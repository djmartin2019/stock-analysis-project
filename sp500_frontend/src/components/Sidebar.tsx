"use client";
import { useEffect, useState } from "react";
import { useTicker } from "@/context/TickerContext";
import { fetchTopPerformers } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
    const [topStocks, setTopStocks] = useState([]);
    const {
        setSelectedTicker,
        setIsLoading,
        setIsPageTransitioning,
        setIsDataLoading
    } = useTicker();
    const router = useRouter();

    const handleTickerClick = (ticker: string) => {
        // Start the transition
        setIsPageTransitioning(true);
        setIsLoading(true);
        setIsDataLoading(true);
        setSelectedTicker(ticker);

        // Navigate to dashboard
        router.push("/dashboard");
        // The loading state will be cleared by the dashboard component when it's ready
    };

    useEffect(() => {
        async function loadData() {
            try {
                const topStocksData = await fetchTopPerformers()
                setTopStocks(topStocksData.slice(0, 10));
            } catch (error) {
                console.error("Error fetching data", error);
            }
        }
        loadData();
    }, []);


    return (
        <aside className="w-42 h-screen bg-darkgray p-4 flex flex-col">
            <div className="flex flex-col pt-20 flex-grow">
                {topStocks.map((stock) => (
                    <Link
                        href="/dashboard"
                        key={stock.Ticker}
                        onClick={() => handleTickerClick(stock.Ticker)}
                        className="text-gray-300 hover:bg-gray-700 p-2 rounded transition text-center"
                    >
                        {stock.Ticker}
                    </Link>
                ))}
            </div>

            <div className="mt-auto pb-4">
                <Link href="/terms" className="text-gray-400 hover:text-gray-200 p-2 rounded block text-center">
                    Terms
                </Link>
            </div>
        </aside>
    );
}
