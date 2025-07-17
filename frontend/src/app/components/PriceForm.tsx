"use client";
import { useState } from "react";
import { usePriceStore } from "../store/priceStore";

export default function PriceForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const [timestamp, setTimestamp] = useState("");
  const { fetchPrice, scheduleFullHistory, loading } = usePriceStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchPrice({ tokenAddress, network, timestamp: parseInt(timestamp) });
  };

  const handleSchedule = async () => {
    await scheduleFullHistory({ tokenAddress, network });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Token Address</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Timestamp</label>
          <input
            type="number"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Get Price
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Schedule Full History
          </button>
        </div>
      </form>
    </div>
  );
}
