"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAlgoForgeStore } from "@/lib/store";
import { TradingViewChart } from "@/components/chart/TradingViewChart";
import { StrategyChartHUD } from "@/components/chart/StrategyChartHUD";
import {
  Grid,
  Columns,
  Square,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  Coins,
  Flame,
} from "lucide-react";

export default function ChartSymbolPage() {
  const params = useParams();
  const router = useRouter();
  const urlSymbol = (params?.symbol as string)?.toUpperCase() || "BTCUSDT";

  const {
    selectedSymbol,
    setSelectedSymbol,
    multiChartCount,
    setMultiChartCount,
    timeframe,
    liveQuotes,
  } = useAlgoForgeStore();

  useEffect(() => {
    if (urlSymbol && urlSymbol !== selectedSymbol) {
      setSelectedSymbol(urlSymbol);
    }
  }, [urlSymbol, selectedSymbol, setSelectedSymbol]);

  // Tradable Crypto & Commodities Only (Gold, Silver, Crude Oil) - NO FIAT FOREX
  const pinnedPairs = [
    { symbol: "BTCUSDT", label: "BTC/USDT", category: "CRYPTO", icon: "🪙" },
    { symbol: "ETHUSDT", label: "ETH/USDT", category: "CRYPTO", icon: "🪙" },
    { symbol: "SOLUSDT", label: "SOL/USDT", category: "CRYPTO", icon: "🪙" },
    { symbol: "BNBUSDT", label: "BNB/USDT", category: "CRYPTO", icon: "🪙" },
    { symbol: "XRPUSDT", label: "XRP/USDT", category: "CRYPTO", icon: "🪙" },
    { symbol: "XAUUSD", label: "GOLD", category: "COMMODITIES", icon: "🏆" },
    { symbol: "XAGUSD", label: "SILVER", category: "COMMODITIES", icon: "🥈" },
    { symbol: "USOIL", label: "CRUDE OIL", category: "COMMODITIES", icon: "🛢️" },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden select-none bg-[#080c14] font-sans">
      {/* Sleek Ticker Tape Bar: Pinned Crypto & Commodities */}
      <div className="h-8 bg-[#0b101c] border-b border-[#1e2b45] px-3 flex items-center justify-between text-xs shrink-0">
        {/* Left: Quick Switcher for Crypto + Gold + Silver + Crude Oil */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          <div className="hidden sm:inline-flex items-center gap-1.5 shrink-0 mr-1 text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap font-sans">
            <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="whitespace-nowrap tracking-wider">Tradable Watchlist:</span>
          </div>
          {pinnedPairs.map((pair) => {
            const q = liveQuotes[pair.symbol];
            const isSelected = urlSymbol === pair.symbol;
            return (
              <button
                key={pair.symbol}
                onClick={() => {
                  setSelectedSymbol(pair.symbol);
                  router.push(`/chart/${pair.symbol}`);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-num flex items-center space-x-1 transition-all border shrink-0 ${
                  isSelected
                    ? "bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold shadow-sm"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121b2f]"
                }`}
              >
                <span>{pair.icon}</span>
                <span className="font-sans font-bold text-[11px]">{pair.label}</span>
                {q && (
                  <span
                    className={`text-[10px] font-bold ${
                      q.change_24h >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {q.change_24h >= 0 ? "+" : ""}
                    {q.change_24h.toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Multi-Chart Layout Switcher */}
        <div className="flex items-center space-x-2 shrink-0 pl-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold hidden md:inline font-sans">
            Layout:
          </span>
          <div className="flex items-center bg-[#080c14] border border-[#1e2b45] rounded p-0.5">
            <button
              onClick={() => setMultiChartCount(1)}
              className={`p-1 rounded transition-colors ${
                multiChartCount === 1 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Single Chart (Max Canvas Space)"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMultiChartCount(2)}
              className={`p-1 rounded transition-colors ${
                multiChartCount === 2 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Dual Split View (15m + 1H)"
            >
              <Columns className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMultiChartCount(4)}
              className={`p-1 rounded transition-colors ${
                multiChartCount === 4 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Quad Grid View (Multi-Timeframe)"
            >
              <Grid className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Strategy Signal & Execution HUD ("How It Works") */}
      <StrategyChartHUD symbol={urlSymbol} timeframe={timeframe} />

      {/* Main Chart Workspace Area - Seamless flush layout */}
      <div className="flex-1 min-h-0 w-full h-full bg-[#080c14] overflow-hidden flex flex-col">
        {multiChartCount === 1 && (
          <div className="flex-1 min-h-0 h-full w-full">
            <TradingViewChart symbol={urlSymbol} timeframe={timeframe} />
          </div>
        )}

        {multiChartCount === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 p-1.5 h-full w-full flex-1 min-h-0 bg-[#080c14]">
            <div className="h-full min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden">
              <TradingViewChart symbol={urlSymbol} timeframe="15m" isMultiChart={true} />
            </div>
            <div className="h-full min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden">
              <TradingViewChart symbol={urlSymbol} timeframe="1H" isMultiChart={true} />
            </div>
          </div>
        )}

        {multiChartCount === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-1.5 p-1.5 h-full w-full flex-1 min-h-0 bg-[#080c14]">
            <div className="h-full min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden">
              <TradingViewChart symbol={urlSymbol} timeframe="15m" isMultiChart={true} />
            </div>
            <div className="h-full min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden">
              <TradingViewChart symbol={urlSymbol} timeframe="1H" isMultiChart={true} />
            </div>
            <div className="h-full min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden">
              <TradingViewChart symbol={urlSymbol} timeframe="4H" isMultiChart={true} />
            </div>
            <div className="h-full min-h-0 border border-[#1e2b45] rounded-lg overflow-hidden">
              <TradingViewChart symbol={urlSymbol} timeframe="1D" isMultiChart={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
