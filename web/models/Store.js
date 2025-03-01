const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  surveys: [
    {
      survey_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      title: { type: String, required: true }, // Title for the survey
      questions: [
        {
          question_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          question_text: { type: String, required: true },
          type: { type: String, enum: ["scale", "multiple_choice", "text", "boolean"], required: true },
          options: { type: [String], default: [] }, // Used for multiple_choice & boolean
          min: { type: Number }, // Only for scale
          max: { type: Number }, // Only for scale
          minLabel: { type: String }, // Only for scale
          maxLabel: { type: String } // Only for scale
        }
      ],
      created_at: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Store", StoreSchema);
