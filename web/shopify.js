import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import {MongoDBSessionStorage} from "@shopify/shopify-app-session-storage-mongodb"
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import mongoose from "mongoose";
import { connectDB } from "./db.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/shopify_sessions";

(async () => {
  await connectDB();
})();



const sessionStorage = new MongoDBSessionStorage(MONGO_URI, "shopify_sessions");
// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage,
});

export default shopify;
