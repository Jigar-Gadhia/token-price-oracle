// backend/src/utils/alchemy.ts
import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";
import pRetry from "p-retry";

const CMC_API_KEY = process.env.CMC_API_KEY as string;

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET, // Configurable
});

// Map network to CoinGecko platform IDs
const networkToPlatform: { [key: string]: string } = {
  ethereum: "ethereum",
  polygon: "polygon-pos",
};

const networkToSlug: Record<string, string> = {
  ethereum: "ethereum",
  polygon: "polygon",
};

const contractPlatformSlug: Record<string, string> = {
  ethereum: "ethereum",
  polygon: "polygon",
};

export async function getHistoricalPrice(
  tokenAddress: string,
  network: string,
  timestamp: number
) {
  return pRetry(
    async () => {
      const date = new Date(timestamp * 1000).toISOString().split("T")[0];
      const platform = contractPlatformSlug[network.toLowerCase()];
      if (!platform) throw new Error("Unsupported network");

      const response = await axios.get(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical`,
        {
          params: {
            time_start: timestamp,
            time_end: timestamp,
            interval: "daily",
            convert: "USD",
            address: tokenAddress,
            network: platform,
          },
          headers: {
            "X-CMC_PRO_API_KEY": CMC_API_KEY,
          },
        }
      );

      const usdPrice =
        response?.data?.data?.quotes?.[0]?.quote?.USD?.close ??
        response?.data?.data?.quotes?.[0]?.quote?.USD?.price;

      if (!usdPrice) throw new Error("Price data not available");

      return usdPrice;
    },
    { retries: 3, minTimeout: 1000, factor: 2 }
  );
}

export async function getTokenCreationDate(
  tokenAddress: string,
  network: string
) {
  // Configure Alchemy network dynamically
  const alchemyNetwork =
    network.toLowerCase() === "polygon"
      ? Network.MATIC_MAINNET
      : Network.ETH_MAINNET;
  const alchemyInstance = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: alchemyNetwork,
  });

  const logs = await alchemyInstance.core.getLogs({
    address: tokenAddress,
    fromBlock: "0x0",
    toBlock: "latest",
    topics: [
      "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
    ], // Transfer event
  });
  const block = await alchemyInstance.core.getBlock(logs[0]?.blockNumber || 0);
  return block?.timestamp
    ? new Date(block.timestamp * 1000).toISOString()
    : new Date().toISOString();
}
