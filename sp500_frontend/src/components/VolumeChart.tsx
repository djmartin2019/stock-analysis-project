"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface VolumeChartProps {
    data: {
        Ticker: string;
        Date: string;
        Volume: number;
    }[];
}

export default function VolumeChart({ data }: VolumeChartProps) {
    const [loading, setLoading] = useState(true);

    if (data.length === 0) {
        return <div className="p-4 rounded-lg shadow-lg bg-white text-black">No volume data available</div>;
    }

    useEffect(() => {
        if (Array.isArray(data) && data.length > 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [data]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] w-full bg-gray-800 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
            </div>
        );
    }

    // ✅ Get the ticker safely
    const ticker = data.length > 0 ? data[0].Ticker : "Unknown";

    // ✅ Get the date 12 months ago
    const oneYearAgo = dayjs().subtract(1, "year");

    // ✅ Filter the data for the last 12 months
    const filteredData = data.filter(stock => dayjs(stock.Date).isAfter(oneYearAgo));

    const movingAvgPeriod = 20;
    const movingAvg = filteredData.map((stock, index) => {
        if (index < movingAvgPeriod) return null; // Not enough data for MA
        const avg = filteredData
            .slice(index - movingAvgPeriod, index)
            .reduce((sum, s) => sum + s.Volume, 0) / movingAvgPeriod;
        return { Date: stock.Date, Volume: avg };
    }).filter(Boolean); // Remove nulls

    // ✅ Format date and determine volume color
    const formattedData = filteredData.map((stock, index) => ({
        ...stock,
        Date: dayjs(stock.Date).format("YYYY-MM-DD"),
        color: index === 0 ? "gray" : stock.Volume > filteredData[index - 1]?.Volume ? "limegreen" : "red",
    }));

    return (
        <div className="p-4 shadow-lg bg-black">
            <h2 className="bg-black text-xl font-bold mb-4 text-white">{ticker} Trading Volume</h2>
            <Plot
                data={[
                    // 🔹 Bar chart for daily volume
                    {
                        x: formattedData.map(stock => stock.Date),
                        y: formattedData.map(stock => stock.Volume),
                        type: "bar",
                        marker: {
                            color: formattedData.map(stock => stock.color),
                            opacity: 0.8,
                        },
                        name: "Daily Trading Volume",
                    },
                    // 🔹 20-day moving average trendline
                    {
                        x: movingAvg.map(stock => stock.Date),
                        y: movingAvg.map(stock => stock.Volume),
                        type: "scatter",
                        mode: "lines",
                        name: "20-Day Moving Avg",
                        line: { color: "#FFA500", width: 3, dash: "solid" }, // Orange trendline
                    },
                ]}
                layout={{
                    autosize: true,
                    plot_bgcolor: "black",
                    paper_bgcolor: "black",
                    font: { color: "#ffffff" },
                    xaxis: {
                        title: "Date",
                        tickformat: "%Y-%m-%d",
                        showgrid: false,
                        tickangle: -45, // ✅ Rotate labels for readability
                        nticks: 10, // ✅ Limit number of ticks
                    },
                    yaxis: {
                        title: "Volume",
                        showgrid: true,
                        gridcolor: "#333",
                    },
                    margin: { t: 10, l: 50, r: 10, b: 80 },
                }}
                useResizeHandler
                style={{ width: "100%", height: "300px" }}
            />
        </div>
    );
}
