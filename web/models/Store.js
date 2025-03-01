import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  question_text: { type: String, required: true },
  type: { type: String, enum: ["scale", "multiple_choice", "text", "boolean"], required: true },
  options: { type: [String], default: [] }, // Used for multiple_choice & boolean
  min: { type: Number }, // Only for scale
  max: { type: Number }, // Only for scale
  minLabel: { type: String }, // Only for scale
  maxLabel: { type: String } // Only for scale
});

const SurveySchema = new mongoose.Schema({
  survey_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [QuestionSchema], // One survey contains multiple questions
  created_at: { type: Date, default: Date.now }
});

const StoreSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true, unique: true },
    survey: SurveySchema // Store has only ONE survey (not an array)
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", StoreSchema);

export default Store;

