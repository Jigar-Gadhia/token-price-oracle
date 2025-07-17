import express from "express";
import { redis } from "../redis.js"; // ✅ Use shared Upstash instance
import { getHistoricalPrice } from "../utils/alchemy.js";
import { interpolatePrice } from "../utils/interpolation.js";
import PriceModel from "../models/Price.js";

const priceRouter = express.Router();

priceRouter.get("/", async (req, res) => {
  const { tokenAddress, network, timestamp } = req.query;
  const cacheKey = `${tokenAddress}:${network}:${timestamp}`;

  try {
    // Check Redis cache
    const cachedPrice = await redis.get(cacheKey);
    if (cachedPrice) {
      return res.json({ value: parseFloat(cachedPrice), source: "cached" });
    }

    // Check MongoDB for exact timestamp
    const exactPrice = await PriceModel.findOne({
      tokenAddress,
      network,
      timestamp,
    });
    if (exactPrice) {
      await redis.set(cacheKey, exactPrice.price, "EX", 300); // 5m TTL
      return res.json({ value: exactPrice.price, source: "api" });
    }

    // Interpolate price
    const interpolated = await interpolatePrice(
      tokenAddress as string,
      network as string,
      parseInt(timestamp as string)
    );
    await redis.set(cacheKey, interpolated.price, "EX", 300);
    res.json({ value: interpolated.price, source: "interpolated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default priceRouter;
