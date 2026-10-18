"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Search,
  PlusCircle,
  Coins,
  Flame,
  Zap,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Layers,
  Building2,
  ExternalLink,
} from "lucide-react";
import { MarketsSkeleton } from "@/components/common/PageSkeletons";

export default function MarketsScannerPage() {
  const { setSelectedSymbol, setIsTradePlannerOpen } = useAlgoForgeStore();
  
  // View mode: AlgoForge Scanner vs Delta Exchange Volume Ranked
  const [activeTab, setActiveTab] = useState<"SCANNER" | "DELTA_EXCHANGE">("DELTA_EXCHANGE");

  // Scanner State
  const [scannerData, setScannerData] = useState<any[]>([]);
  const [marketFilter, setMarketFilter] = useState<string>("ALL");
  const [signalFilter, setSignalFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Delta Exchange Volume State
  const [deltaMarkets, setDeltaMarkets] = useState<any[]>([]);
  const [deltaContractFilter, setDeltaContractFilter] = useState<"ALL" | "PERPETUAL" | "COMMODITY">("ALL");
  const [deltaSearch, setDeltaSearch] = useState<string>("");
  const [deltaLoading, setDeltaLoading] = useState(false);

  // Dynamic pair addition modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newMarketType, setNewMarketType] = useState("CRYPTO");

  // Initial load
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [scanRes, deltaRes] = await Promise.all([
          api.getScannerData().catch(() => []),
          api.getDeltaMarketsByVolume().catch(() => []),
        ]);
        if (isMounted) {
          setScannerData(scanRes || []);
          setDeltaMarkets(deltaRes || []);
        }
      } catch (e) {
        console.error("Markets data fetch error:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    const interval = setInterval(async () => {
      try {
        if (activeTab === "SCANNER") {
          const s = await api.getScannerData();
          if (isMounted) setScannerData(s || []);
        } else {
          const d = await api.getDeltaMarketsByVolume();
          if (isMounted) setDeltaMarkets(d || []);
        }
      } catch (err) {
        // silent background poll error
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeTab]);

  const handleAddDynamicPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;
    try {
      const sym = newSymbol.toUpperCase();
      const isCrypto = newMarketType === "CRYPTO";
      await api.getInstruments();
      await fetch("http://localhost:8000/api/v1/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sym,
          name: `${sym} Dynamic Pair`,
          market_type: newMarketType,
          base_currency: sym.substring(0, 3),
          quote_currency: isCrypto ? "USDT" : "USD",
          category: "DYNAMIC",
          pip_size: 0.01,
          tick_size: 0.01,
          precision: 2,
          lot_size: isCrypto ? 1.0 : (sym.includes("XAU") ? 100.0 : (sym.includes("XAG") ? 5000.0 : 1000.0)),
          base_price: isCrypto ? 150.0 : (sym.includes("XAU") ? 4180.0 : (sym.includes("XAG") ? 32.0 : 99.0)),
          spread_pips: 1.5,
        }),
      });
      setShowAddModal(false);
      setNewSymbol("");
      const refreshed = await api.getScannerData();
      setScannerData(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered AlgoForge Scanner items
  const filteredScanner = scannerData.filter((item) => {
    if (marketFilter !== "ALL" && item.market_type !== marketFilter) return false;
    if (signalFilter === "BUY" && item.signal !== "BUY") return false;
    if (signalFilter === "SELL" && item.signal !== "SELL") return false;
    if (signalFilter === "BULLISH" && item.trend !== "Bullish") return false;
    if (signalFilter === "BEARISH" && item.trend !== "Bearish") return false;
    if (signalFilter === "OVERSOLD" && item.rsi >= 35) return false;
    if (signalFilter === "OVERBOUGHT" && item.rsi <= 65) return false;
    if (search && !item.symbol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Filtered Delta Exchange Listed Items
  const filteredDelta = deltaMarkets.filter((item) => {
    if (deltaContractFilter === "PERPETUAL" && item.contract_type !== "perpetual_futures") return false;
    if (deltaContractFilter === "COMMODITY" && !item.contract_type?.includes("commodity")) return false;
    if (deltaSearch) {
      const q = deltaSearch.toLowerCase();
      const matchSym = item.symbol?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchSym && !matchDesc) return false;
    }
    return true;
  });

  // If initial load is in progress, show content-specific skeleton
  if (loading) {
    return <MarketsSkeleton />;
  }

  // Calculate top Delta stats
  const totalVolumeUSD = deltaMarkets.reduce((sum, m) => sum + (m.turnover_usd || 0), 0);
  const topDeltaPerp = deltaMarkets.find((m) => m.contract_type === "perpetual_futures") || deltaMarkets[0];

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-indigo-400" />
            Market Screener & Delta Exchange Listings
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Real-time volume ranking, 100x leverage specs, and institutional quantitative signals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Tab Toggle */}
          <div className="flex items-center bg-[#0c1220] border border-[#18263f] rounded-lg p-1">
            <button
              onClick={() => setActiveTab("DELTA_EXCHANGE")}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "DELTA_EXCHANGE"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Delta Listed Cryptos (Volume-Wise)</span>
              <span className="text-[9.5px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-200">
                {deltaMarkets.length || "280+"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("SCANNER")}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "SCANNER"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Asset Scanner</span>
              <span className="text-[9.5px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-200">
                {scannerData.length}
              </span>
            </button>
          </div>

          {activeTab === "SCANNER" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Pair</span>
            </button>
          )}
        </div>
      </div>

      {/* DELTA EXCHANGE VOLUME SCREENER VIEW */}
      {activeTab === "DELTA_EXCHANGE" && (
        <div className="space-y-3">
          {/* Delta Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#0c1220] border border-[#18263f] p-3 rounded-xl text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Delta Exchange Listed</span>
              <span className="text-white font-extrabold text-sm flex items-center gap-1">
                {deltaMarkets.length} Cryptos / Contracts
              </span>
              <span className="text-[9.5px] text-emerald-400">Strictly Volume-Sorted Live Feed</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Top 24H Turnover</span>
              <span className="text-amber-300 font-extrabold text-sm font-mono-num tabular-nums">
                {topDeltaPerp ? `${topDeltaPerp.symbol}: ${topDeltaPerp.turnover_formatted}` : "$9.29M"}
              </span>
              <span className="text-[9.5px] text-slate-400">ETH & BTC Perpetual Lead Volume</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Max Institutional Leverage</span>
              <span className="text-indigo-300 font-extrabold text-sm">Up to 100x Leverage</span>
              <span className="text-[9.5px] text-slate-400">Isolated Margin Calibrated</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Exchange Fee Structure</span>
              <span className="text-emerald-300 font-extrabold text-sm">0.05% Taker / 0.02% Maker</span>
              <span className="text-[9.5px] text-slate-400">+18% GST Compliance</span>
            </div>
          </div>

          {/* Delta Filters & Search Bar */}
          <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Contract Type Filter - Strictly Perpetuals & Futures Only */}
            <div className="flex items-center space-x-1 bg-[#080c14] border border-[#18263f] rounded-lg p-1">
              {[
                { id: "ALL", label: "All Perpetuals & Futures (Volume Ranked)" },
                { id: "PERPETUAL", label: "Perpetuals Only (100x)" },
                { id: "COMMODITY", label: "Commodity Futures (Gold/Oil)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDeltaContractFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer text-xs ${
                    deltaContractFilter === f.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Delta Search */}
            <div className="w-56 sm:w-64 relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search symbol (ETH, BTC, SOL, DOGE)..."
                value={deltaSearch}
                onChange={(e) => setDeltaSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#080c14] border border-[#18263f] rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Delta Exchange Table */}
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-num tabular-nums">
                <thead>
                  <tr className="bg-[#0a0f1d] text-slate-400 font-sans font-bold text-[9.5px] uppercase border-b border-[#18263f]">
                    <th className="text-center py-2 px-2.5 w-10"># Rank</th>
                    <th className="text-left py-2 px-2.5">Symbol / Contract</th>
                    <th className="text-center py-2 px-2.5">Contract Type</th>
                    <th className="text-right py-2 px-2.5">Live Mark Price</th>
                    <th className="text-right py-2 px-2.5">24H Change</th>
                    <th className="text-right py-2 px-2.5 text-indigo-300 font-bold">24H Volume (USD)</th>
                    <th className="text-right py-2 px-2.5">Open Interest</th>
                    <th className="text-center py-2 px-2.5">Max Leverage</th>
                    <th className="text-center py-2 px-2.5">Fees (Maker/Taker)</th>
                    <th className="text-center py-2 px-2.5">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141e30]">
                  {filteredDelta.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                        No Delta Exchange contracts matched your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredDelta.slice(0, 100).map((m, idx) => {
                      const isPerp = m.contract_type === "perpetual_futures";
                      const isPositive = (m.change_24h || 0) >= 0;

                      return (
                        <tr key={m.symbol} className="hover:bg-[#121b2f]/60 transition-colors">
                          <td className="text-center text-slate-400 font-sans text-[11px] font-bold py-2 px-2.5">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/chart/${m.symbol}`}
                                onClick={() => setSelectedSymbol(m.symbol)}
                                className="font-bold text-white hover:text-indigo-300 transition-colors flex items-center gap-1"
                              >
                                <span>{m.symbol}</span>
                              </Link>
                              {idx < 3 && (
                                <span className="px-1 py-0.2 text-[8.5px] font-black rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  HOT
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block font-sans truncate max-w-[180px]">
                              {m.description || m.symbol}
                            </span>
                          </td>
                          <td className="text-center py-2 px-2.5">
                            <span
                              className={`text-[9.5px] px-1.5 py-0.5 rounded font-black inline-block font-sans ${
                                isPerp
                                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                              }`}
                            >
                              {isPerp ? "PERPETUAL" : "FUTURES"}
                            </span>
                          </td>
                          <td className="text-right font-extrabold text-white py-2 px-2.5">
                            ${(m.price ?? 0).toLocaleString(undefined, {
                              minimumFractionDigits: (m.price ?? 0) < 1 ? 4 : 2,
                              maximumFractionDigits: (m.price ?? 0) < 1 ? 4 : 2,
                            })}
                          </td>
                          <td
                            className={`text-right font-bold py-2 px-2.5 ${
                              isPositive ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {typeof m.change_24h === "number" ? m.change_24h.toFixed(2) : "0.00"}%
                          </td>
                          <td className="text-right font-bold text-indigo-300 py-2 px-2.5">
                            {m.turnover_formatted || `$${((m.turnover_usd || 0) / 1e6).toFixed(2)}M`}
                          </td>
                          <td className="text-right text-slate-300 py-2 px-2.5">
                            {m.open_interest_usd
                              ? `$${(m.open_interest_usd / 1e3).toFixed(1)}K`
                              : "-"}
                          </td>
                          <td className="text-center py-2 px-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                              {m.max_leverage ? `${m.max_leverage}x` : "100x"}
                            </span>
                          </td>
                          <td className="text-center text-slate-400 font-sans text-[10.5px] py-2 px-2.5">
                            <span className="text-slate-300">{m.maker_fee || "0.02%"}</span> /{" "}
                            <span className="text-slate-400">{m.taker_fee || "0.05%"}</span>
                          </td>
                          <td className="text-center py-2 px-2.5">
                            <div className="flex items-center justify-center space-x-1 font-sans">
                              <Link
                                href={`/chart/${m.symbol}`}
                                onClick={() => setSelectedSymbol(m.symbol)}
                                className="px-2 py-0.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded text-[10px] font-bold border border-indigo-500/30 transition-colors"
                              >
                                Chart
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedSymbol(m.symbol);
                                  setIsTradePlannerOpen(true);
                                }}
                                className="px-2 py-0.5 bg-[#17233c] hover:bg-[#202f4f] text-slate-200 rounded text-[10px] font-bold border border-[#1e2b45] cursor-pointer transition-colors"
                              >
                                Plan Trade
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredDelta.length > 100 && (
              <div className="p-2.5 text-center bg-[#0a0f1d] border-t border-[#18263f] text-slate-400 text-xs font-sans">
                Showing top 100 of {filteredDelta.length} listed contracts strictly volume-sorted. Refine search query for specific contracts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALGFORGE MULTI-ASSET SCANNER VIEW */}
      {activeTab === "SCANNER" && (
        <div className="space-y-3">
          {/* Filter Toolbar */}
          <div className="bg-[#0c1220] border border-[#18263f] p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Market Filter */}
            <div className="flex items-center space-x-1 bg-[#080c14] border border-[#18263f] rounded-lg p-1">
              {["ALL", "CRYPTO", "COMMODITIES"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMarketFilter(m)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer text-xs font-sans ${
                    marketFilter === m ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Condition Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto py-0.5 font-sans">
              {[
                { id: "ALL", label: "All Signals" },
                { id: "BUY", label: "BUY Signals" },
                { id: "SELL", label: "SELL Signals" },
                { id: "BULLISH", label: "Bullish Trend" },
                { id: "BEARISH", label: "Bearish Trend" },
                { id: "OVERSOLD", label: "Oversold" },
                { id: "OVERBOUGHT", label: "Overbought" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSignalFilter(f.id)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border transition-colors cursor-pointer ${
                    signalFilter === f.id
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500 font-bold"
                      : "bg-[#080c14] text-gray-400 border-[#18263f] hover:text-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-40 sm:w-48 relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-500" />
              <input
                type="text"
                placeholder="Filter symbols..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-[#080c14] border border-[#18263f] rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* Main Scanner Table */}
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-num tabular-nums">
                <thead>
                  <tr className="bg-[#0a0f1d] text-slate-400 font-sans font-bold text-[9.5px] uppercase border-b border-[#18263f]">
                    <th className="text-left py-2 px-2.5">Symbol</th>
                    <th className="text-center py-2 px-2.5">Market</th>
                    <th className="text-left py-2 px-2.5">Category</th>
                    <th className="text-right py-2 px-2.5">Live Price</th>
                    <th className="text-right py-2 px-2.5">24H Change</th>
                    <th className="text-right py-2 px-2.5">24H Volume</th>
                    <th className="text-left py-2 px-2.5">Trend</th>
                    <th className="text-right py-2 px-2.5">RSI</th>
                    <th className="text-right py-2 px-2.5">ATR</th>
                    <th className="text-center py-2 px-2.5">Signal</th>
                    <th className="text-center py-2 px-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141e30]">
                  {filteredScanner.map((item) => {
                    const isBullish = item.trend === "Bullish";
                    const isBuy = item.signal === "BUY";
                    const isSell = item.signal === "SELL";

                    return (
                      <tr key={item.symbol} className="hover:bg-[#121b2f]/60 transition-colors">
                        <td className="font-bold text-white py-2 px-2.5">
                          <Link
                            href={`/chart/${item.symbol}`}
                            onClick={() => setSelectedSymbol(item.symbol)}
                            className="hover:underline text-indigo-300 flex items-center gap-1.5 font-mono-num"
                          >
                            {item.symbol}
                          </Link>
                        </td>
                        <td className="text-center py-2 px-2.5">
                          <span
                            className={`text-[9.5px] px-1.5 py-0.5 rounded font-black inline-block min-w-[50px] ${
                              item.market_type === "CRYPTO"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {item.market_type}
                          </span>
                        </td>
                        <td className="text-slate-400 text-[10.5px] py-2 px-2.5 font-medium font-sans">{item.category}</td>
                        <td className="text-right font-extrabold text-white font-mono-num py-2 px-2.5">
                          ${item.price?.toLocaleString(undefined, {
                            minimumFractionDigits: item.market_type === "CRYPTO" ? 2 : 4,
                          })}
                        </td>
                        <td className={`text-right font-bold font-mono-num py-2 px-2.5 ${item.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {item.change >= 0 ? "+" : ""}{item.change}%
                        </td>
                        <td className="text-right text-slate-300 font-mono-num py-2 px-2.5">
                          ${(item.volume ? (item.volume / 1e6).toFixed(1) + "M" : "120M")}
                        </td>
                        <td className="py-2 px-2.5 font-sans">
                          <span
                            className={`font-semibold flex items-center gap-1 text-[11px] ${
                              isBullish ? "text-emerald-400" : item.trend === "Bearish" ? "text-rose-400" : "text-slate-400"
                            }`}
                          >
                            {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {item.trend}
                          </span>
                        </td>
                        <td className={`text-right font-bold font-mono-num py-2 px-2.5 ${item.rsi > 60 ? "text-emerald-400" : item.rsi < 40 ? "text-rose-400" : "text-slate-300"}`}>
                          {item.rsi}
                        </td>
                        <td className="text-right text-slate-300 font-mono-num py-2 px-2.5">{item.atr}</td>
                        <td className="text-center py-2 px-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-black inline-block min-w-[45px] ${
                              isBuy
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isSell
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {item.signal}
                          </span>
                        </td>
                        <td className="text-center py-2 px-2.5">
                          <div className="flex items-center justify-center space-x-1 font-sans">
                            <Link
                              href={`/chart/${item.symbol}`}
                              onClick={() => setSelectedSymbol(item.symbol)}
                              className="px-2 py-0.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded text-[10px] font-bold border border-indigo-500/30"
                            >
                              Chart
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedSymbol(item.symbol);
                                setIsTradePlannerOpen(true);
                              }}
                              className="px-2 py-0.5 bg-[#17233c] hover:bg-[#202f4f] text-slate-200 rounded text-[10px] font-bold border border-[#1e2b45] cursor-pointer"
                            >
                              Plan
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Pair Addition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl w-full max-w-md p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#18263f] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Register Dynamic Market Pair
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddDynamicPair} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Symbol Name (e.g. LINKUSDT or XAUUSD)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LINKUSDT"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-3 py-2 text-white font-bold text-xs uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Market Type</label>
                <select
                  value={newMarketType}
                  onChange={(e) => setNewMarketType(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="CRYPTO">CRYPTO</option>
                  <option value="COMMODITIES">COMMODITIES</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#17233c] text-gray-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
                >
                  Add Pair & Start Feeds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
