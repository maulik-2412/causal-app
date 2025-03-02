import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    customer: {type:String},
    email: {type:String},
    session_id: { type: String, default: null },
    responses: [
      {
        question_id: mongoose.Schema.Types.ObjectId,
        answer: String
      }
    ]
  },
  { timestamps: true } 
);

const Response = mongoose.model("Response", ResponseSchema);

export default Response;
