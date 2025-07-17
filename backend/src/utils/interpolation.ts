import PriceModel from "../models/Price.js";
import { getHistoricalPrice } from "./alchemy.js";

export async function interpolatePrice(
  tokenAddress: string,
  network: string,
  timestamp: number
) {
  const before = await PriceModel.findOne({
    tokenAddress,
    network,
    timestamp: { $lte: timestamp },
  }).sort({ timestamp: -1 });

  const after = await PriceModel.findOne({
    tokenAddress,
    network,
    timestamp: { $gte: timestamp },
  }).sort({ timestamp: 1 });

  // if (!before || !after) {
  const price = await getHistoricalPrice(tokenAddress, network, timestamp);
  await PriceModel.create({ tokenAddress, network, timestamp, price });
  return { price, source: "api" };
  // }

  // Linear interpolation
  // const timeDiff = after.timestamp - before.timestamp;
  // const weight = (timestamp - before.timestamp) / timeDiff;
  // const price = before.price + (after.price - before.price) * weight;

  // return { price, source: "interpolated" };
}
