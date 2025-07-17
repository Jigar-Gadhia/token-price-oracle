// backend/src/index.ts
import express from "express";
import mongoose from "mongoose";
import priceRouter from "./routes/price.js";
import scheduleRouter from "./routes/schedule.js";
import dotenv from "dotenv";
dotenv.config();
import "./workers/priceFetcher.js"; // Initialize BullMQ worker
import cors from "cors";
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use("/api/price", priceRouter);
app.use("/api/schedule", scheduleRouter);

// MongoDB Connection
const mongoUrl = process.env.MONGODB_URL;
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: Error) => console.error("MongoDB connection error:", err));

// Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
