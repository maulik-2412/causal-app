// @ts-nocheck
import dotenv from "dotenv";
dotenv.config();
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import { connectDB } from "./db.js";
import cors from "cors"
import mongoose from "mongoose";
import Store from './models/Store.js'
import Response from './models/Responses.js'
import Customer from "./models/Customer.js";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

connectDB();
const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://causalfunnelstore.myshopify.com",
  "https://admin.shopify.com", 
  "https://87fc-2401-4900-1f36-49a3-5c44-3432-9456-910b.ngrok-free.app",
  "http://localhost:5173/",
  "https://jewish-singh-wb-bibliographic.trycloudflare.com"
];

app.use(cors({
  origin: function(origin, callback) {
   
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "ngrok-skip-browser-warning", "Authorization"]
}));

app.get("/api/survey",async (req,res)=>{
  const { shop } = req.query;
  if (!shop) {
    return res.status(400).json({ error: "Shop name is required" });
  }

  try {
    const store = await Store.findOne({ shop });

    if (!store || !store.survey) {
      return res.status(404).json({ error: "Survey not found for this shop" });
    }

    res.json({
      survey_id: store.survey.survey_id,
      title: store.survey.title,
      description: store.survey.description,
      questions: store.survey.questions,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch survey questions" });
  }
})

app.post("/api/survey/submit",async(req,res)=>{
  try {
    const { shop, answers } = req.body;
    
    const store = await Store.findOne({ shop });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    console.log("Received answers:", answers);
    console.log("Store questions:", store.survey.questions);

    
 

   
    
    const newResponse = new Response({
      store_id: store._id,
      responses: answers
    });
    console.log(newResponse);
    await newResponse.save();

    res.status(201).json({ message: "Survey response saved successfully" });
    console.log('saved');
  } catch (error) {
    console.error("Error submitting survey response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;



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



app.post("/api/surveyQuestions", async (_req, res) => {
  try {
    const { shop, title, description, questions } = _req.body;
    if (!shop) {
      return res.status(400).json({ error: "Shop is required" });
    }

    let store = await Store.findOne({ shop });

    if (!store) {
      
      console.log("Store not found, creating a new store with survey...");
      store = new Store({
        shop,
        survey: {
          survey_id: new mongoose.Types.ObjectId(),
          title,
          description,
          questions: questions.map((q) => ({
            question_id: q.question_id,
            question_text: q.question_text,
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

    
    await store.save();

    res.json({ success: true, message: "Survey saved successfully", store });
  } catch (err) {
    console.error("Error saving survey:", err);
    res.status(500).json({ error: err.message });
  }
});



app.get("/api/surveyQuestions", async (_req, res) => {
  try {
    const { shop } = _req.query;
    if (!shop) {
      return res.status(400).json({ error: "Shop parameter is required" });
    }

    const store = await Store.findOne({ shop });
    
    if (!store || !store.survey) {
      return res.json({ survey: null }); 
    }
    res.json({ survey: store.survey });
  } catch (err) {
    console.error("Error fetching survey:", err);
    res.status(500).json({ error: err.message });
  }});

  app.get("/api/surveyResponses", async (req, res) => {
    try {
      const { shop } = req.query;
      if (!shop) {
        return res.status(400).json({ error: "Shop parameter is required" });
      }
  
      
      const store = await Store.findOne({ shop });
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
  
      
      const responses = await Response.find({ store_id: store._id })
        .populate("customer_id", "name email") 
        .sort({ createdAt: -1 });
  
      res.json({ responses });
    } catch (error) {
      console.error("Error fetching survey responses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  

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
