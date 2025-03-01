// @ts-nocheck
import dotenv from "dotenv";
dotenv.config();
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import cors from "cors"
import mongoose from "mongoose";
import Store from './models/Store.js'
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

mongoose.connect(process.env.MONGO_URI
).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));



const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(cors());
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

/* app.use("/api/store", require("./routes/storeRoutes"));
app.use("/api/response", require("./routes/responseRoutes")); */

app.post("/api/survey", async (_req, res) => {
  try {
    const { shop, title, description, questions } = _req.body;

    if (!shop) {
      return res.status(400).json({ error: "Shop is required" });
    }

    let store = await Store.findOne({ shop });

    if (!store) {
      // **Create new store with survey**
      console.log("Store not found, creating a new store with survey...");
      store = new Store({
        shop,
        survey: {
          survey_id: new mongoose.Types.ObjectId(),
          title,
          description,
          questions: questions.map((q) => ({
            question_id: new mongoose.Types.ObjectId(),
            question_text: q.text,
            type: q.type,
            options: q.options || [],
            min: q.min,
            max: q.max,
            minLabel: q.minLabel,
            maxLabel: q.maxLabel,
          })),
          created_at: new Date(),
        },
      });
      console.log("New store and survey created for shop:", shop);
    } else {
      // **Update existing survey**
      console.log("Updating existing survey for shop:", shop);
      store.survey = {
        survey_id: store.survey?.survey_id || new mongoose.Types.ObjectId(),
        title,
        description,
        questions: questions.map((q) => ({
          question_id: q.question_id || new mongoose.Types.ObjectId(),
          question_text: q.question_text,
          type: q.type,
          options: q.options || [],
          min: q.min,
          max: q.max,
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        })),
        created_at: store.survey?.created_at || new Date(),
      };
    }

    // **Save the store (create or update)**
    await store.save();

    res.json({ success: true, message: "Survey saved successfully", store });
  } catch (err) {
    console.error("Error saving survey:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/survey", async (req, res) => {
  try {
    const { shop } = req.query;
    if (!shop) {
      return res.status(400).json({ error: "Shop parameter is required" });
    }

    const store = await Store.findOne({ shop });
    if (!store || !store.survey) {
      return res.json({ survey: null }); // No survey found
    }

    res.json({ survey: store.survey });
  } catch (err) {
    console.error("Error fetching survey:", err);
    res.status(500).json({ error: err.message });
  }});


app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT,()=>{
  console.log("server started on",PORT)
});
