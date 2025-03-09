"use client";

interface StockTableProps {
    title: string;
    stocks: any[];
}

export default function StockTable({ title, stocks }: StockTableProps) {
    return (
        <div className="border rounded-lg pt-3 pb-3">
            <h2 className="text-lg font-semibold pl-4">{title}</h2>
            <table className="w-full mt-2">
                <thead><tr>
                        <th className="text-left pl-4">Ticker</th>
                        <th className="text-right pr-4">Price</th>
                        <th className="text-right pr-4">Change</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock, index) => (
                        <tr className="hover:bg-slate-900 hover:text-white"
                            key={stock.ticker && stock.date ? `${stock.ticker}-${stock.date}` : `fallback-${index}`}>
                        <td className="text-left pl-4">{stock.Ticker}</td>
                        <td className="text-right pr-4">${stock.Close.toFixed(2)}</td>
                        <td className="text-right pr-4">{stock.Change.toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

