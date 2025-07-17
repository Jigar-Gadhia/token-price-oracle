// backend/src/index.ts
import express from "express";
import mongoose from "mongoose";
import priceRouter from "./routes/price.js";
import scheduleRouter from "./routes/schedule.js";
import "./workers/priceFetcher.js"; // Initialize BullMQ worker
import { configDotenv } from "dotenv";
import cors from "cors";

configDotenv();
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/price", priceRouter);
app.use("/api/schedule", scheduleRouter);

// MongoDB Connection
const mongoUrl =
  process.env.MONGODB_URL || "mongodb://mongodb:27017/token-oracle";
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: Error) => console.error("MongoDB connection error:", err));

// Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
