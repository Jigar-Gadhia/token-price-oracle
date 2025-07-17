// backend/src/utils/alchemy.ts
import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";
import pRetry from "p-retry";

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
      try {
        const date = new Date(timestamp * 1000);
        const formattedDate = date
          .toLocaleDateString("en-GB")
          .split("/")
          .join("-"); // format to dd-mm-yyyy

        const platform = networkToPlatform[network.toLowerCase()];
        if (!platform) throw new Error(`Unsupported network: ${network}`);

        // Step 1: Get CoinGecko ID from contract address
        const contractUrl = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${tokenAddress}`;
        const contractRes = await axios.get(contractUrl);
        const coinId = contractRes.data.id;

        if (!coinId) throw new Error("CoinGecko ID not found for token");

        // Step 2: Fetch historical price using CoinGecko ID
        const historyUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${formattedDate}&localization=false`;
        const historyRes = await axios.get(historyUrl);

        const price = historyRes.data?.market_data?.current_price?.usd;
        if (!price) {
          throw new Error("Price data not available");
        }

        return price;
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn("Rate limited by CoinGecko. Retrying...");
          throw error;
        }
        throw error;
      }
    },
    { retries: 3, minTimeout: 2000, factor: 2 }
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
