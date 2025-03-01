const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  customer_id: { type: String, required: true },
  email: String,
  name: String
}, { timestamps: true });

module.exports = mongoose.model("Customer", CustomerSchema);
