// frontend/app/components/PriceDisplay.tsx
"use client";
import { usePriceStore } from "../store/priceStore";

export default function PriceDisplay() {
  const { price, error, loading } = usePriceStore();

  return (
    <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-lg mx-auto">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center font-medium">{error}</p>
      ) : price ? (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">
            Price: ${price.value.toFixed(4)}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            Source: {price.source}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No price data available</p>
      )}
    </div>
  );
}
