import MandiRates from "@/components/MandiRates";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MandiPage() {
  return (
    <div className="min-h-screen bg-[#F4F9F1] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#2D5A27] font-medium hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
      <MandiRates />
    </div>
  );
}
