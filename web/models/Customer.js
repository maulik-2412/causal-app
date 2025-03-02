import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    customer_id: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    name: { type: String, trim: true },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", CustomerSchema);
export default Customer;

