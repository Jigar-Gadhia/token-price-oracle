"use client";
import { usePriceStore } from "../store/priceStore";

export default function ProgressBar() {
  const { progress } = usePriceStore();
  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>{progress}% Complete</p>
    </div>
  );
}
