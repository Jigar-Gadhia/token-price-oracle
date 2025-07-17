import { create } from "zustand";
import axios from "axios";

interface PriceState {
  price: { value: number; source: "cached" | "interpolated" | "api" } | null;
  loading: boolean;
  error: string | null;
  progress: number;
  fetchPrice: (params: {
    tokenAddress: string;
    network: string;
    timestamp: number;
  }) => Promise<void>;
  scheduleFullHistory: (params: {
    tokenAddress: string;
    network: string;
  }) => Promise<void>;
}

export const usePriceStore = create<PriceState>((set) => ({
  price: null,
  loading: false,
  error: null,
  progress: 0,
  fetchPrice: async ({ tokenAddress, network, timestamp }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/price", {
        params: { tokenAddress, network, timestamp },
      });
      set({ price: response.data, loading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, loading: false });
      } else {
        set({ error: "An unknown error occurred", loading: false });
      }
    }
  },
  scheduleFullHistory: async ({ tokenAddress, network }) => {
    set({ loading: true, error: null, progress: 0 });
    try {
      const response = await axios.post("/api/schedule", {
        tokenAddress,
        network,
      });
      set({ progress: response.data.progress, loading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, loading: false });
      } else {
        set({ error: "An unknown error occurred", loading: false });
      }
    }
  },
}));
