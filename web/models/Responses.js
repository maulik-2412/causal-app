const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  customer_id: { type: String, required: true },
  responses: [
    {
      question_id: mongoose.Schema.Types.ObjectId,
      answer: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Response", ResponseSchema);
