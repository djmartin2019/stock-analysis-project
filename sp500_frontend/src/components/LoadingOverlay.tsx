"use client";

import { useTicker } from "@/context/TickerContext";

export default function LoadingOverlay() {
    const { isPageTransitioning, isDataLoading } = useTicker();

    // Show loading when either transitioning pages or loading data
    if (!isPageTransitioning && !isDataLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                <p className="text-white mt-4">Loading...</p>
            </div>
        </div>
    );
}
