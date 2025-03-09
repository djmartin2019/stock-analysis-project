"use client";

import { useEffect, useState } from "react";
import { fetchTopPerformers, fetchBottomPerformers } from "@/lib/api";
import StockDashboard from "@/components/StockDashboard";
import StockTable from "@/components/StockTable";
import VolumeChart from "@/components/VolumeChart";
import { useTicker } from "@/context/TickerContext";

export default function DashboardPage() {
    const [topStocks, setTopStocks] = useState([]);
    const [bottomStocks, setBottomStocks] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [tickerDetails, setTickerDetails] = useState<{ ticker: string; company_name: string; sector: string } | null>(null);
    const { selectedTicker, isLoading, setIsLoading, setIsPageTransitioning, setIsDataLoading } = useTicker();
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Load ticker-specific data
    useEffect(() => {
        if (!selectedTicker) {
            setStockData([]);
            setTickerDetails(null);
            return;
        }

        const fetchTickerData = async () => {
            try {
                setIsLoading(true);

                const [stockRes, tickersRes] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/sp500/stock/${selectedTicker}`),
                    fetch(`http://127.0.0.1:8000/sp500/tickers`)
                ]);

                if (!stockRes.ok || !tickersRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [stockData, tickersData] = await Promise.all([
                    stockRes.json(),
                    tickersRes.json()
                ]);

                const processedStockData = Array.isArray(stockData) ? stockData : [];
                setStockData(processedStockData);

                const tickerInfo = tickersData.find((t: any) => t.ticker === selectedTicker);
                setTickerDetails(tickerInfo ? {
                    ticker: tickerInfo.ticker,
                    company_name: tickerInfo.company_name,
                    sector: tickerInfo.sector
                } : null);

            } catch (error) {
                console.error(`Error fetching data for ${selectedTicker}:`, error);
                setStockData([]);
                setTickerDetails(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickerData();
    }, [selectedTicker, setIsLoading]);

    // Load initial data (top/bottom performers)
    useEffect(() => {
        async function loadData() {
            setIsDataLoading(true);
            try {
                const [topData, bottomData] = await Promise.all([
                    fetchTopPerformers(),
                    fetchBottomPerformers()
                ]);

                setTopStocks(topData);
                setBottomStocks(bottomData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setInitialDataLoaded(true);
                setIsDataLoading(false);
                setIsPageTransitioning(false); // Turn off the transition when data is ready
            }
        }

        loadData();
    }, [selectedTicker]);

    const showChartLoading = isLoading || (!isLoading && !stockData.length && selectedTicker);
    const showChartData = !isLoading && stockData.length > 0;

    return (
        <div className="space-y-2">
            {/* Stock Dashboard */}
            <div className={`min-h-80 transition-opacity duration-500 ${showChartLoading ? "opacity-50" : "opacity-100"}`}>
                {showChartLoading ? (
                    <div className="animate-pulse bg-gray-800 rounded-lg h-80 w-full"></div>
                ) : showChartData ? (
                    <StockDashboard ticker={selectedTicker} stockData={stockData} tickerDetails={tickerDetails} />
                ) : (
                    <div className="flex justify-center items-center h-80 bg-gray-800 rounded-lg">
                        <p className="text-white">Select a ticker to view data</p>
                    </div>
                )}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-6">
                {/* Top & Bottom Performers */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        {!initialDataLoaded ? (
                            <div className="animate-pulse bg-gray-800 rounded-lg h-40"></div>
                        ) : (
                            <StockTable title="Top Performers" stocks={topStocks} />
                        )}
                    </div>
                    <div>
                        {!initialDataLoaded ? (
                            <div className="animate-pulse bg-gray-800 rounded-lg h-40"></div>
                        ) : (
                            <StockTable title="Bottom Performers" stocks={bottomStocks} />
                        )}
                    </div>
                </div>

                {/* Volume Chart */}
                <div className={`min-h-64 transition-opacity duration-500 ${showChartLoading ? "opacity-50" : "opacity-100"}`}>
                    {showChartLoading ? (
                        <div className="animate-pulse bg-gray-800 rounded-lg h-64 w-full"></div>
                    ) : showChartData ? (
                        <VolumeChart data={stockData} />
                    ) : (
                        <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg">
                            <p className="text-white">Select a ticker to view volume data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
