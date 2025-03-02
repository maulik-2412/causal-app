import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question_id: {type:Number,required:true},
  question_text: { type: String, required: true },
  type: { type: String, enum: ["scale", "multiple_choice", "text", "boolean"], required: true },
  options: { type: [String], default: [] },
  max: { type: Number }, 
  minLabel: { type: String }, 
  maxLabel: { type: String } 
});

const SurveySchema = new mongoose.Schema({
  survey_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String },
  description: { type: String },
  questions: [QuestionSchema], 
  created_at: { type: Date, default: Date.now }
});

const StoreSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true, unique: true },
    survey: SurveySchema 
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", StoreSchema);

export default Store;

