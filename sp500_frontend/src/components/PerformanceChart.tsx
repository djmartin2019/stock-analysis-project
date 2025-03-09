"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import minMax from "dayjs/plugin/minMax";

dayjs.extend(isBetween);
dayjs.extend(minMax);

// ✅ Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface SP500StockData {
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
    Ticker: string;
    Year: number;
    Month: number;
    Day: number;
    moving_avg_20: number;
    volatility_20: number;
    moving_avg_50: number;
    volatility_50: number;
    Change: number;
}

interface PerformanceChartProps {
    data: SP500StockData[];
    ticker: string;
}

export default function PerformanceChart({ data, ticker }: PerformanceChartProps) {
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState(dayjs().subtract(5, "year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [showMovingAvg20, setShowMovingAvg20] = useState(false);
    const [showMovingAvg50, setShowMovingAvg50] = useState(false);

    const earliestDate = data.length > 0
        ? dayjs.min(...data.map(stock => dayjs(stock.Date))) // Corrected
        : dayjs().subtract(5, "years"); // Fallback in case data is missing


    useEffect(() => {
        if (Array.isArray(data) && data.length > 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [data]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse bg-gray-800 rounded-lg h-64 w-full"></div>            </div>
        );
    }

    if (!Array.isArray(data)) {
        console.error("PerformanceChart received invalid data:", data);
        return <div className="pt-4 shadow-lg bg-white">No valid data available for {ticker}</div>;
    }

    const filteredData = data
        .filter(stock => stock.Ticker === ticker)
        .map(stock => ({
            ...stock,
            Date: dayjs(stock.Date).format("YYYY-MM-DD"),
            Close: stock.Close !== undefined && stock.Close !== null && !isNaN(stock.Close) ? stock.Close : null,
            moving_avg_20: stock.moving_avg_20 !== undefined && stock.moving_avg_20 !== null && !isNaN(stock.moving_avg_20) ? stock.moving_avg_20 : null,
            moving_avg_50: stock.moving_avg_50 !== undefined && stock.moving_avg_50 !== null && !isNaN(stock.moving_avg_50) ? stock.moving_avg_50 : null,
        }))
        .filter(stock => dayjs(stock.Date).isBetween(startDate, endDate, "day", "[]"));

    filteredData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    if (filteredData.length === 0) {
        return <div className="p-4 rounded-lg shadow-lg bg-white">No data available for {ticker}</div>;
    }

    const allDates = filteredData.map(stock => stock.Date);
    const allClosePrices = filteredData.map(stock => (stock.Close !== null ? stock.Close : null)); // ✅ Forces null
    const allMovingAvg20 = showMovingAvg20 ? filteredData.map(stock => (stock.moving_avg_20 !== null ? stock.moving_avg_20 : null)) : [];
    const allMovingAvg50 = showMovingAvg50 ? filteredData.map(stock => (stock.moving_avg_50 !== null ? stock.moving_avg_50 : null)) : [];

    return (
        <div className="pt-4 pl-4 pr-4 rounded-lg">
            {/* Filters Section */}
            <div className="flex items-center gap-4 mb-4">
                {/* Date Pickers */}
                <label className="text-white"> Start Date: </label>
                <input
                    type="date"
                    min={earliestDate ? earliestDate.format("YYYY-MM-DD") : undefined} // Prevents selecting a date past what the API is providing
                    max={dayjs().format("YYYY-MM-DD")} // Prevents future selection
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded"
                />
                <label className="text-white">End Date: </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded"
                />

                {/* toggle Moving Averages */}
                <label className="text-white flex items-center">
                    <input
                        type="checkbox"
                        checked={showMovingAvg20}
                        onChange={() => setShowMovingAvg20(!showMovingAvg20)}
                        className="mr-2"
                    />
                    20-Day MA
                </label>
                <label className="text-white flex items-center">
                    <input
                        type="checkbox"
                        checked={showMovingAvg50}
                        onChange={() => setShowMovingAvg50(!showMovingAvg50)}
                        className="mr-2"
                    />
                    50-Day MA
                </label>
            </div>

            <Plot
                data={[
                    {
                        x: allDates,
                        y: allClosePrices,
                        type: "scatter",
                        mode: "lines",
                        name: "Close Price",
                        line: { color: "#00FF00", width: 2 },
                        connectgaps: false,  // ✅ Ensures missing data doesn't create a diagonal line.
                    },
                    showMovingAvg20 && {
                        x: allDates,
                        y: allMovingAvg20,
                        type: "scatter",
                        mode: "lines",
                        name: "20-Day Moving Avg",
                        line: { color: "#FF00FF", width: 2, dash: "dash" },
                        connectgaps: false,  // ✅ Breaks line if data is missing
                    },
                    showMovingAvg50 && {
                        x: allDates,
                        y: allMovingAvg50,
                        type: "scatter",
                        mode: "lines",
                        name: "50-Day Moving Avg",
                        line: { color: "#00FFFF", width: 2, dash: "dot" },
                        connectgaps: false,  // ✅ Breaks line if data is missing
                    },
                ].filter(Boolean)} // Remove undefined datasets

                layout={{
                    autosize: true,
                    plot_bgcolor: "black",
                    paper_bgcolor: "black",
                    font: { color: "#ffffff" },
                    xaxis: {
                        title: "Date",
                        tickformat: "%Y-%m-%d",
                        showgrid: true,
                        gridcolor: "#333",
                        range: [startDate, endDate], // ✅ Explicitly set range
                    },
                    yaxis: {
                        title: "Stock Price",
                        showgrid: true,
                        gridcolor: "#333",
                    },
                    margin: { t: 10, l: 50, r: 10, b: 50 },
                    legend: {
                        bgcolor: "#1e1e1e",
                        font: { color: "#ffffff" },
                    },
                }}
                useResizeHandler
                style={{ width: "100%", height: "400px" }}
            />

        </div>
    );
}

