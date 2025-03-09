export async function fetchSP500Overview() {
    const res = await fetch("http://127.0.0.1:8000/sp500/overview");
    return res.json();
}

export async function fetchTopPerformers() {
    const res = await fetch("http://127.0.0.1:8000/sp500/top-performers");
    return res.json()
}

export async function fetchBottomPerformers() {
    const res = await fetch("http://127.0.0.1:8000/sp500/bottom-performers");
    return res.json()
}

export async function fetchSectorPerformance() {
  const res = await fetch("http://localhost:8000/sp500/sectors");
  return res.json();
}

export async function fetchStockData(ticker: string) {
  const res = await fetch(`http://localhost:8000/sp500/stock/${ticker}`);
  return res.json();
}
