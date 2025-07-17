import express from "express";
import Redis from "ioredis";
import { getHistoricalPrice } from "../utils/alchemy.js";
import { interpolatePrice } from "../utils/interpolation.js";
import PriceModel from "../models/Price.js";

const priceRouter = express.Router();
const redis = new Redis();

priceRouter.get("/", async (req, res) => {
  const { tokenAddress, network, timestamp } = req.query;
  const cacheKey = `${tokenAddress}:${network}:${timestamp}`;

  console.log("🔍 Incoming request:", { tokenAddress, network, timestamp });

  try {
    // Validate inputs
    if (!tokenAddress || !network || !timestamp) {
      return res.status(400).json({ error: "Missing query parameters" });
    }

    // Check Redis cache
    const cachedPrice = await redis.get(cacheKey);
    if (cachedPrice) {
      console.log("✅ Cache hit:", cacheKey);
      return res.json({ value: parseFloat(cachedPrice), source: "cached" });
    }

    console.log("⛔ Cache miss:", cacheKey);

    // Check MongoDB for exact timestamp
    const exactPrice = await PriceModel.findOne({
      tokenAddress,
      network,
      timestamp,
    });

    if (exactPrice) {
      console.log("📦 Found in MongoDB:", exactPrice);
      await redis.set(cacheKey, exactPrice.price, "EX", 300); // 5m TTL
      return res.json({ value: exactPrice.price, source: "api" });
    }

    console.log("🔁 Not found in MongoDB. Interpolating...");

    // Interpolate price
    const interpolated = await interpolatePrice(
      tokenAddress as string,
      network as string,
      parseInt(timestamp as string)
    );

    console.log("📈 Interpolated result:", interpolated);

    await redis.set(cacheKey, interpolated.price, "EX", 300);
    res.json({ value: interpolated.price, source: "interpolated" });
  } catch (error: any) {
    console.error("❌ Error fetching price:", error);
    res.status(500).json({ error: error.message });
  }
});

export default priceRouter;
