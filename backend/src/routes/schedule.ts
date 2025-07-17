// backend/src/routes/schedule.ts
import express from "express";
import { Queue } from "bullmq";
import { redis } from "../redis.js"; // Use updated redis instance

const scheduleRouter = express.Router();
const queue = new Queue("price-fetcher", { connection: redis });

scheduleRouter.post("/", async (req, res) => {
  const { tokenAddress, network } = req.body;
  try {
    const job = await queue.add(
      "fetch-history",
      { tokenAddress, network },
      { attempts: 5, backoff: { type: "exponential", delay: 2000 } }
    );
    res.json({ jobId: job.id, progress: 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default scheduleRouter;
