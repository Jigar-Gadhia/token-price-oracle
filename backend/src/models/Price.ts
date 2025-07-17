import mongoose from "mongoose";

const PriceSchema = new mongoose.Schema(
  {
    tokenAddress: { type: String, required: true },
    network: { type: String, required: true },
    timestamp: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Price", PriceSchema);
