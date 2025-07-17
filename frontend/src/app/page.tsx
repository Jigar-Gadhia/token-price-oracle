import PriceForm from "./components/PriceForm";
import PriceDisplay from "./components/PriceDisplay";
import ProgressBar from "./components/ProgressBar";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Historical Token Price Oracle
      </h1>
      <PriceForm />
      <PriceDisplay />
      <ProgressBar />
    </main>
  );
}
