"use client";
import PerformanceChart from "@/components/PerformanceChart";

interface StockDashboardProps {
    ticker: string;
    stockData: any[]; // ✅ Now receiving stock data as a prop
}

export default function StockDashboard({
    ticker,
    stockData,
    tickerDetails,
}: {
    ticker: string;
    stockData: any[];
    tickerDetails: { ticker: string; company_name: string; sector: string } | null;
}) {
    return (
        <div>
            <div className="flex inline-block align-middle">
                <h1 className="text-2xl font-bold">
                    {tickerDetails ? `${tickerDetails.company_name} (${ticker})` : ticker} Dashboard
                </h1>
                <p className="text-gray-400 pl-10 pt-1">{tickerDetails ? `Sector: ${tickerDetails.sector}` : ""}</p>
            </div>
            <div>
                <PerformanceChart data={stockData} ticker={ticker} />
            </div>
        </div>
    );
}

