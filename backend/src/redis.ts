// backend/src/redis.ts
import Redis from "ioredis";

export const redis = new Redis(
  "rediss://default:AWAJAAIncDFkZWU3YjQ1YzhjNjk0NWIwOTU5Mjg1YWM2Mzc2ZGU2N3AxMjQ1ODU@smooth-tomcat-24585.upstash.io:6379",
  {
    maxRetriesPerRequest: null, // Required for BullMQ blocking operations
  }
);

redis.on("connect", () => {
  console.log("🔌 Redis connected");
});

redis.on("ready", () => {
  console.log("✅ Redis is ready to use");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("close", () => {
  console.warn("⚠️ Redis connection closed");
});
