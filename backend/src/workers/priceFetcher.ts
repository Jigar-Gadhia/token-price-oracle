// backend/src/workers/priceFetcher.ts
import { Worker } from "bullmq";
import { getHistoricalPrice, getTokenCreationDate } from "../utils/alchemy.js";
import PriceModel from "../models/Price.js";
import { redis } from "../redis.js"; // Use updated redis instance

export const priceWorker = new Worker(
  "price-fetcher",
  async (job) => {
    const { tokenAddress, network } = job.data;
    const creationDate = await getTokenCreationDate(tokenAddress, network);
    const currentDate = new Date();

    // Convert to UTC midnight timestamps
    const startTimestamp = Math.floor(
      new Date(creationDate).setUTCHours(0, 0, 0, 0) / 1000
    );
    const endTimestamp = Math.floor(currentDate.setUTCHours(0, 0, 0, 0) / 1000);

    for (let ts = startTimestamp; ts <= endTimestamp; ts += 24 * 60 * 60) {
      try {
        const price = await getHistoricalPrice(tokenAddress, network, ts);
        await PriceModel.create({
          tokenAddress,
          network,
          timestamp: ts,
          price,
        });
        await job.updateProgress(
          ((ts - startTimestamp) / (endTimestamp - startTimestamp)) * 100
        );
      } catch (error: any) {
        if (
          error.response?.status === 429 ||
          error.message.includes("rate limit")
        ) {
          // Exponential backoff for CoinGecko rate limits
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * Math.pow(2, job.attemptsMade))
          );
          throw error; // Let BullMQ handle job retries
        }
        console.error(
          `Error fetching price for ${tokenAddress} at ${ts}:`,
          error.message
        );
        continue; // Skip to next timestamp on other errors
      }
    }
  },
  { connection: redis } // Uses updated redis with maxRetriesPerRequest: null
);
