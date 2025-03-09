"use client";
import { useEffect, useState } from "react";
import { useTicker } from "@/context/TickerContext";
import { useRouter } from "next/navigation";

export default function Topbar() {
    const { setSelectedTicker } = useTicker();
    const [search, setSearch] = useState("");
    const [tickers, setTickers] = useState<string[]>([]);
    const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
    const router = useRouter();

    // 🔹 Fetch tickers from API when component mounts
    useEffect(() => {
    async function fetchTickers() {
        try {
            const res = await fetch(`http://127.0.0.1:8000/sp500/tickers`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setTickers(data.map(item => item.ticker)); // Ensure correct key name
            } else {
                setTickers([]);
            }
        } catch (error) {
            console.error("Error fetching tickers:", error);
        }
    }
    fetchTickers();
}, []);


    // 🔹 Update dropdown options when user types
    useEffect(() => {
        if (!search.trim()) {
            setFilteredTickers([]);
        } else {
            setFilteredTickers(
                tickers
                    .filter(ticker =>
                        typeof ticker === "string" &&
                        ticker.toUpperCase().includes(search.toUpperCase()) // ✅ Fixed parentheses
                    )
                    .slice(0, 10) // ✅ Limits results
            );
        }
    }, [search, tickers]);

    // 🔹 Handle selection from dropdown
    const handleSelectTicker = (ticker: string) => {
        setSelectedTicker(ticker);
        setSearch(""); // ✅ Clear search bar after selection
        setFilteredTickers([]); // ✅ Hide dropdown
        router.push("/");
    };

    return (
        <div className="relative flex items-center justify-between bg-darkgray p-4 shadow-md">
            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search companies"
                className="w-1/2 bg-darkgray border border-gray-200 rounded-xl text-white p-2 hover:bg-gray-300 hover:text-gray-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSelectTicker(search.toUpperCase())}
            />

            {/* Dropdown Results */}
            {filteredTickers.length > 0 && (
                <ul className="absolute top-full w-1/2 bg-gray-800 border border-gray-600 rounded-xl mt-1 shadow-lg z-50">
                    {filteredTickers.map((ticker, index) => (
                        <li
                            key={`${ticker}-${index}`} // ✅ Unique key
                            className="cursor-pointer p-2 hover:bg-gray-700"
                            onClick={() => handleSelectTicker(ticker)}
                        >
                            {ticker}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

