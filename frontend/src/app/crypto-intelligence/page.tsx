"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import { CryptoIntelligenceSkeleton, SkeletonBox } from "@/components/common/PageSkeletons";
import {
  Flame,
  Activity,
  Zap,
  Globe2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Cpu,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Layers,
  Sparkles,
  BarChart3,
  Scale,
  X,
  BookOpen,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function CryptoIntelligencePage() {
  const router = useRouter();
  const { setSelectedSymbol, autoTraderEnabled, setAutoTraderEnabled, updateAccount } = useAlgoForgeStore();

  const [activeTab, setActiveTab] = useState<"LIQUIDATION" | "STRATEGIES" | "SENTIMENT" | "NEWS">("LIQUIDATION");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSDT");

  const [liqData, setLiqData] = useState<any | null>(null);
  const [sentimentData, setSentimentData] = useState<any | null>(null);
  const [newsData, setNewsData] = useState<any | null>(null);
  const [deployedStrategies, setDeployedStrategies] = useState<any[]>([]);
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH_LEVERAGE" | "MODERATE" | "LOW_RISK">("ALL");
  const [executingTradeId, setExecutingTradeId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Load all intelligence data
  const loadIntelligence = async () => {
    try {
      setRefreshing(true);
      const [liq, sent, news, strats] = await Promise.all([
        api.getLiquidationMap(selectedAsset),
        api.getMarketSentiment(),
        api.getCryptoNewsFeed(),
        api.getDeployedStrategies(),
      ]);
      setLiqData(liq);
      setSentimentData(sent);
      setNewsData(news);
      setDeployedStrategies(strats || []);
    } catch (e) {
      console.error("Intelligence load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIntelligence();
    const interval = setInterval(loadIntelligence, 12000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  // One-click Deploy All Strategies
  const handleDeployAll = async () => {
    try {
      const res = await api.deployAllStrategies();
      setAutoTraderEnabled(true);
      setActionMsg("All 9 Quantitative Strategies successfully deployed and scanning live markets!");
      if (res.strategies) setDeployedStrategies(res.strategies);
      setTimeout(() => setActionMsg(null), 4500);

      const port = await api.getPortfolio();
      if (port?.account) updateAccount(port.account);
    } catch (e: any) {
      console.error(e);
      alert(`Deployment error: ${e.message || "Failed"}`);
    }
  };

  // Immediate High-Leverage Risky Trade Execution
  const handleExecuteRiskyTrade = async (strat: any) => {
    try {
      setExecutingTradeId(strat.id);
      const sym = strat.symbols?.[0] || selectedAsset || "BTCUSDT";
      const res = await api.executeRiskyTrade(sym, strat.leverage, strat.id);
      if (res?.account) {
        updateAccount(res.account);
      }
      setActionMsg(`⚡ [${strat.leverage}x] ${strat.name} trade executed on ${sym}! Isolated Margin: $${strat.target_margin || 4}.00`);
      setTimeout(() => setActionMsg(null), 5000);
      loadIntelligence();
    } catch (e: any) {
      console.error(e);
      setActionMsg(`Failed to execute trade: ${e.message || "Error"}`);
      setTimeout(() => setActionMsg(null), 4000);
    } finally {
      setExecutingTradeId(null);
    }
  };

  // Immediate Scan & Execute
  const handleScanExecuteNow = async () => {
    try {
      const res = await api.triggerAutoTraderScan();
      setActionMsg(
        `Scanned ${res.detected_signals?.length || 0} signals across deployed algorithms. Executed ${res.executed_trades?.length || 0} orders on Delta Exchange.`
      );
      setTimeout(() => setActionMsg(null), 4500);
      loadIntelligence();
    } catch (e: any) {
      console.error(e);
    }
  };

  const fng = sentimentData?.fear_and_greed?.current_score || 53;
  const fngClass = sentimentData?.fear_and_greed?.classification || "Neutral";

  if (loading && !liqData && deployedStrategies.length === 0) {
    return <CryptoIntelligenceSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Action Notification Banner */}
      {actionMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#1e2b45] pb-3">
        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              Real-Time Market Radar
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] text-cyan-300 font-mono-num font-bold">
              Alternative.me &bull; Binance &bull; Delta Exchange
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Crypto Intelligence &amp; Liquidation Heatmap</span>
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Real-time liquidation cascades, public sentiment feeds &amp; multi-strategy autonomous execution
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Deploy All Strategies Button */}
          <button
            onClick={handleDeployAll}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Deploy all 5 algorithmic strategies across live markets"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Deploy All Strategies</span>
          </button>

          {/* Trigger Scan Button */}
          <button
            onClick={handleScanExecuteNow}
            className="px-2.5 py-1.5 bg-[#0d1322] hover:bg-[#152238] border border-[#1e2b45] text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Run immediate technical scanner"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Scan &amp; Execute</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadIntelligence}
            disabled={refreshing}
            className="p-1.5 bg-[#0d1322] hover:bg-[#152238] border border-[#1e2b45] text-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Real-Time Market Intelligence KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-num tabular-nums">
        {/* Fear & Greed Index */}
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider flex items-center justify-between">
            <span>Fear &amp; Greed Index</span>
            <span className="text-[8.5px] text-slate-500 font-mono">Alternative.me</span>
          </span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-base sm:text-lg font-black ${
                fng >= 60 ? "text-emerald-400" : fng <= 40 ? "text-rose-400" : "text-amber-300"
              }`}
            >
              {fng} / 100
            </span>
            <span
              className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded font-sans uppercase ${
                fng >= 60
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : fng <= 40
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              {fngClass}
            </span>
          </div>
        </div>

        {/* 24h Global Liquidations with Visual Stacked Progress Bar */}
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold tracking-wider">
              24h Total Liquidations
            </span>
            <span className="text-[9.5px] text-slate-400 font-mono-num">
              {liqData?.global_24h_summary?.total_accounts_liquidated ? `${(liqData.global_24h_summary.total_accounts_liquidated / 1000).toFixed(1)}k accts` : "42.9k accts"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-rose-400 font-mono-num">
              ${liqData?.global_24h_summary ? `${(liqData.global_24h_summary.total_liquidations_usd / 1e6).toFixed(1)}M` : "142.8M"}
            </span>
            <div className="flex items-center gap-1.5 text-[9.5px] font-mono-num font-bold">
              <span className="text-emerald-400">{liqData?.global_24h_summary?.longs_liquidated_pct || 62.4}% Longs</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400">{liqData?.global_24h_summary?.shorts_liquidated_pct || 37.6}% Shorts</span>
            </div>
          </div>
          {/* Proper Visual Stacked Progress Bar */}
          <div className="w-full h-1.5 bg-[#080c14] rounded-full overflow-hidden flex shadow-inner" title="62.4% Longs vs 37.6% Shorts Liquidated">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${liqData?.global_24h_summary?.longs_liquidated_pct || 62.4}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${liqData?.global_24h_summary?.shorts_liquidated_pct || 37.6}%` }}
            />
          </div>
        </div>

        {/* Nearest Short Squeeze Trigger */}
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
            Nearest Short Squeeze
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-emerald-400">
              ${liqData?.nearest_short_squeeze_level?.toLocaleString() || "82,358"}
            </span>
            <span className="text-[9.5px] text-slate-400 font-sans">
              {liqData?.nearest_short_squeeze_volume || "$26.4M"}
            </span>
          </div>
          <div className="w-full h-1 bg-[#080c14] rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-400 rounded-full w-3/4 animate-pulse" />
          </div>
        </div>

        {/* Nearest Long Liquidation Cascade */}
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
            Nearest Long Cascade
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-rose-400">
              ${liqData?.nearest_long_cascade_level?.toLocaleString() || "81,051"}
            </span>
            <span className="text-[9.5px] text-slate-400 font-sans">
              {liqData?.nearest_long_cascade_volume || "$30.2M"}
            </span>
          </div>
          <div className="w-full h-1 bg-[#080c14] rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-rose-400 rounded-full w-4/5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2b45] pb-2">
        <div className="flex items-center space-x-1 bg-[#0d1322] border border-[#1e2b45] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("LIQUIDATION")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "LIQUIDATION" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Liquidation Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab("STRATEGIES")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "STRATEGIES" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deployed Strategies ({deployedStrategies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("SENTIMENT")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "SENTIMENT" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sentiment &amp; Funding</span>
          </button>

          <button
            onClick={() => setActiveTab("NEWS")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "NEWS" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Breaking Crypto News ({newsData?.news?.length || 6})</span>
          </button>
        </div>

        {/* Asset Switcher (applicable for Liquidation & Strategies) */}
        <div className="flex items-center space-x-1 bg-[#0d1322] border border-[#1e2b45] p-0.5 rounded-lg text-xs font-mono-num font-bold">
          {["BTCUSDT", "ETHUSDT", "SOLUSDT", "XAUUSD"].map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedAsset(sym)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                selectedAsset === sym ? "bg-[#18263f] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: LIQUIDATION HEATMAP */}
      {activeTab === "LIQUIDATION" && (
        <div className="space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left 2 Cols: Interactive Liquidation Depth Heatmap */}
            <div className="lg:col-span-2 bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3 font-mono-num tabular-nums">
              <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-xs sm:text-sm">
                    {selectedAsset} Leverage Liquidation Heatmap
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#18263f] text-cyan-300 border border-[#1e2b45]">
                    Delta &bull; Binance Order Flow
                  </span>
                </div>
                <span className="text-xs text-slate-300">
                  Current Price: <strong className="text-white">${liqData?.current_price?.toLocaleString()}</strong>
                </span>
              </div>

              {/* Short Liquidations (Above Current Price - Red/Rose Bars) */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center justify-between font-sans">
                  <span>Short Position Liquidations (Bearish Forced Buybacks)</span>
                  <span className="text-slate-400">Short Squeeze Risk Pool</span>
                </span>
                <div className="space-y-1.5">
                  {liqData?.short_liquidation_clusters?.map((cluster: any, idx: number) => {
                    const widthPct = Math.min(100, (cluster.volume_millions / 60) * 100);
                    return (
                      <div key={idx} className="bg-[#080c14] border border-[#1e2b45] rounded-lg p-2.5 flex items-center justify-between text-xs relative overflow-hidden">
                        {/* Visual Depth Bar Fill */}
                        <div
                          className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-500/25 via-rose-500/15 to-transparent border-l border-rose-500/50 pointer-events-none transition-all"
                          style={{ width: `${widthPct}%` }}
                        />
                        <div className="flex items-center gap-2.5 relative z-10">
                          <span className="font-bold text-white">${cluster.price.toLocaleString()}</span>
                          <span className="text-[9.5px] text-rose-300 font-sans font-bold px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30">
                            +{cluster.distance_pct}%
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-sans font-semibold">({cluster.leverage})</span>
                        </div>
                        <div className="relative z-10 flex items-center gap-2.5">
                          <div className="text-right">
                            <span className="font-extrabold text-rose-400 block">${cluster.volume_millions}M</span>
                            <span className="text-[9px] text-slate-500 font-sans block">{widthPct.toFixed(0)}% depth</span>
                          </div>
                          <span className="text-[9px] font-sans uppercase font-bold px-1.5 py-0.5 rounded bg-[#18263f] text-slate-300 border border-[#1e2b45]">
                            {cluster.intensity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Current Market Price Marker */}
              <div className="bg-[#121c32] border border-indigo-500/40 rounded-lg p-2.5 flex items-center justify-between text-xs shadow-md">
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE MARKET TICKER PRICE</span>
                </div>
                <div className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>${liqData?.current_price?.toLocaleString()}</span>
                  <span className="text-[10px] font-normal text-slate-400 font-sans">(Zero Liquidation Point)</span>
                </div>
              </div>

              {/* Long Liquidations (Below Current Price - Green/Emerald Bars) */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-between font-sans">
                  <span>Long Position Liquidations (Bullish Forced Selloffs)</span>
                  <span className="text-slate-400">Long Cascade Risk Pool</span>
                </span>
                <div className="space-y-1.5">
                  {liqData?.long_liquidation_clusters?.map((cluster: any, idx: number) => {
                    const widthPct = Math.min(100, (cluster.volume_millions / 60) * 100);
                    return (
                      <div key={idx} className="bg-[#080c14] border border-[#1e2b45] rounded-lg p-2.5 flex items-center justify-between text-xs relative overflow-hidden">
                        {/* Visual Depth Bar Fill */}
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-transparent border-r border-emerald-500/50 pointer-events-none transition-all"
                          style={{ width: `${widthPct}%` }}
                        />
                        <div className="flex items-center gap-2.5 relative z-10">
                          <span className="font-bold text-white">${cluster.price.toLocaleString()}</span>
                          <span className="text-[9.5px] text-emerald-300 font-sans font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30">
                            {cluster.distance_pct}%
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-sans font-semibold">({cluster.leverage})</span>
                        </div>
                        <div className="relative z-10 flex items-center gap-2.5">
                          <div className="text-right">
                            <span className="font-extrabold text-emerald-400 block">${cluster.volume_millions}M</span>
                            <span className="text-[9px] text-slate-500 font-sans block">{widthPct.toFixed(0)}% depth</span>
                          </div>
                          <span className="text-[9px] font-sans uppercase font-bold px-1.5 py-0.5 rounded bg-[#18263f] text-slate-300 border border-[#1e2b45]">
                            {cluster.intensity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Liquidation Risk Intelligence & Exchange Distribution */}
            <div className="space-y-3 font-sans">
              {/* Squeeze & Cascade Radar with Depth Bars */}
              <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Squeeze &amp; Cascade Radar
                </span>

                <div className="bg-[#080c14] border border-[#1e2b45] rounded-lg p-2.5 space-y-2.5 font-mono-num text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Short Squeeze Cascade Level:</span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <strong className="text-emerald-400 text-sm">${liqData?.nearest_short_squeeze_level?.toLocaleString()}</strong>
                      <span className="text-slate-300 font-bold">{liqData?.nearest_short_squeeze_volume} volume</span>
                    </div>
                    {/* Visual Proximity Bar */}
                    <div className="w-full h-1.5 bg-[#121c32] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-4/5" />
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-sans mt-1">
                      A pump above this level triggers forced short buybacks accelerating upside momentum.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1e2b45]">
                    <span className="text-[10px] text-slate-400 font-sans block">Long Liquidation Cascade Level:</span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <strong className="text-rose-400 text-sm">${liqData?.nearest_long_cascade_level?.toLocaleString()}</strong>
                      <span className="text-slate-300 font-bold">{liqData?.nearest_long_cascade_volume} volume</span>
                    </div>
                    {/* Visual Proximity Bar */}
                    <div className="w-full h-1.5 bg-[#121c32] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full w-5/6" />
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-sans mt-1">
                      A break below this level triggers cascading sell stops across overleveraged longs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exchange Liquidation Distribution with Visual Horizontal Bars */}
              <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-2 font-mono-num tabular-nums text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 font-sans tracking-wider">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  Exchange Liquidation Volume Distribution
                </span>

                <div className="space-y-2 font-sans">
                  {liqData?.global_24h_summary?.exchange_distribution?.map((ex: any, idx: number) => (
                    <div key={idx} className="bg-[#080c14] p-2.5 rounded-lg border border-[#1e2b45] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 font-bold">{ex.exchange}</span>
                        <div className="flex items-center gap-2 font-mono-num">
                          <span className="text-white font-bold">{ex.volume}</span>
                          <span className="text-[10px] text-cyan-300 font-bold">({ex.pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#121c32] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                          style={{ width: `${ex.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#18263f] text-[10px] text-slate-400 font-sans">
                  Largest single liquidation: <strong className="text-white">{liqData?.global_24h_summary?.largest_single_order}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPLOYED MULTI-STRATEGY AUTONOMOUS TRADER */}
      {activeTab === "STRATEGIES" && (
        <div className="space-y-3 animate-in fade-in font-sans">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1220] border border-[#18263f] p-3 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Autonomous Multi-Strategy Execution Engine</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {deployedStrategies.length} STRATEGIES DEPLOYED
                  </span>
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Continuous microstructure order flow scanning with isolated margin sizing for the $100 capital account
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const s100 = deployedStrategies.find((s) => s.id === "hyper_scalper_100x") || deployedStrategies[0];
                  if (s100) handleExecuteRiskyTrade(s100);
                }}
                disabled={executingTradeId !== null}
                className="px-3 py-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-3.5 h-3.5 text-yellow-300" />
                <span>Launch 100x Scalp</span>
              </button>

              <button
                onClick={handleDeployAll}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Sync &amp; Deploy All</span>
              </button>
            </div>
          </div>

          {/* Risk Tier Filter Bar */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <span className="text-[10px] text-slate-400 uppercase font-sans mr-1">Filter Risk:</span>
            <button
              onClick={() => setRiskFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                riskFilter === "ALL" ? "bg-indigo-600 text-white" : "bg-[#0d1322] border border-[#1e2b45] text-slate-400 hover:text-white"
              }`}
            >
              All Strategies ({deployedStrategies.length})
            </button>
            <button
              onClick={() => setRiskFilter("HIGH_LEVERAGE")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                riskFilter === "HIGH_LEVERAGE" ? "bg-rose-600 text-white" : "bg-[#0d1322] border border-[#1e2b45] text-rose-300 hover:text-white"
              }`}
            >
              <Flame className="w-3 h-3 text-yellow-300" />
              <span>High Leverage (35x - 100x)</span>
            </button>
            <button
              onClick={() => setRiskFilter("MODERATE")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                riskFilter === "MODERATE" ? "bg-indigo-600 text-white" : "bg-[#0d1322] border border-[#1e2b45] text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-3 h-3 text-cyan-300" />
              <span>Moderate (20x - 25x)</span>
            </button>
            <button
              onClick={() => setRiskFilter("LOW_RISK")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                riskFilter === "LOW_RISK" ? "bg-emerald-600 text-white" : "bg-[#0d1322] border border-[#1e2b45] text-slate-400 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-emerald-300" />
              <span>Low Risk (10x Basis)</span>
            </button>
          </div>

          {/* Strategy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {deployedStrategies
              .filter((s) => {
                const lev = s.leverage || 25;
                if (riskFilter === "HIGH_LEVERAGE") return lev >= 35;
                if (riskFilter === "MODERATE") return lev >= 20 && lev < 35;
                if (riskFilter === "LOW_RISK") return lev <= 15;
                return true;
              })
              .map((strat) => {
                const lev = strat.leverage || 25;
                const isExtreme = lev >= 100;
                const isHighRisk = lev >= 50;
                const isImbalance = lev >= 35;
                const isExecuting = executingTradeId === strat.id;

                return (
                  <div key={strat.id} className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-2.5 shadow-lg flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between border-b border-[#18263f] pb-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-white">{strat.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isExtreme ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                🔥 100x EXTREME
                              </span>
                            ) : isHighRisk ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/35">
                                ⚡ 50x HIGH RISK
                              </span>
                            ) : isImbalance ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/35">
                                ⚡ 35x ORDER FLOW
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                {lev}x {strat.category}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono-num">{strat.timeframe}</span>
                          </div>
                        </div>

                        {/* Accuracy Badge */}
                        <div className="text-right font-mono-num tabular-nums shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 block">
                            {strat.accuracy}% Win Rate
                          </span>
                          <span className="text-[9.5px] text-slate-400 mt-0.5 block">
                            PF: {strat.profit_factor}
                          </span>
                        </div>
                      </div>

                      {/* Sizing & Risk Parameters */}
                      <div className="bg-[#080c14] border border-[#1e2b45] rounded-lg p-2 text-xs font-mono-num tabular-nums space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-[10px] text-slate-400 font-sans">Isolated Margin ($100 Acct):</span>
                          <strong className="text-white">${strat.target_margin || 10}.00 <span className="text-slate-400 font-normal">(${(strat.target_margin || 10) * lev} Notional)</span></strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-[10px] text-slate-400 font-sans">Risk / Reward (SL &bull; TP1):</span>
                          <span className="text-amber-300 font-bold">
                            SL: -{((strat.sl_pct || 0.012) * 100).toFixed(2)}% &bull; TP: +{((strat.tp1_pct || 0.015) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Mathematical Trigger Rule Checklist */}
                      <div className="bg-[#080c14] border border-[#1e2b45] rounded-lg p-2.5 space-y-1.5 text-xs font-mono-num tabular-nums">
                        <span className="text-[9.5px] text-slate-400 uppercase font-bold font-sans block">
                          Mathematical Condition Checklist:
                        </span>
                        <div className="space-y-1 text-[10.5px]">
                          {strat.condition_checklist?.length > 0 ? (
                            strat.condition_checklist.map((cond: any, cidx: number) => (
                              <div key={cidx} className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 font-sans">
                                  <span className={`w-1.5 h-1.5 rounded-full ${cond.met ? "bg-emerald-400" : "bg-slate-500"}`} />
                                  {cond.name}:
                                </span>
                                <span className={`font-bold ${cond.met ? "text-emerald-400" : "text-slate-400"}`}>
                                  {cond.value} {cond.met ? "✓" : ""}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-400 font-sans text-[10px]">
                              {strat.rules_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Metrics & Actions */}
                    <div className="pt-2 border-t border-[#18263f] flex items-center justify-between gap-1 text-xs">
                      <div className="font-mono-num tabular-nums">
                        <span className="text-[9.5px] text-slate-400 font-sans block">Algo Earnings:</span>
                        <strong className="text-emerald-400 font-bold text-xs">
                          +${strat.historical_earnings?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleExecuteRiskyTrade(strat)}
                          disabled={isExecuting}
                          className={`px-2 py-1 rounded text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isExtreme
                              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                              : isHighRisk
                              ? "bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                          } disabled:opacity-50`}
                          title={`Execute ${lev}x trade on ${strat.symbols?.[0] || "BTCUSDT"}`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{isExecuting ? "Executing..." : `Trade (${lev}x)`}</span>
                        </button>

                        <Link
                          href={`/chart/${strat.symbols?.[0] || "BTCUSDT"}?strategy=${strat.id}`}
                          className="px-2 py-1 bg-[#121c32] hover:bg-[#1a2744] text-indigo-300 border border-indigo-500/30 rounded text-[10.5px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span>Chart</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: MARKET SENTIMENT & FUNDING RATES */}
      {activeTab === "SENTIMENT" && (
        <div className="space-y-3 animate-in fade-in font-sans">
          {/* Top Feature: Fear & Greed Multi-Segment Visual Gauge Bar */}
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18263f] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs sm:text-sm font-sans flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Alternative.me Fear &amp; Greed Index Radar
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#18263f] text-cyan-300 border border-[#1e2b45]">
                  Public Live API
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-sans">Current Sentiment:</span>
                <span className="text-sm font-black text-emerald-400 font-mono-num">
                  {fng} / 100
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  fng >= 60
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : fng <= 40
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}>
                  {fngClass}
                </span>
              </div>
            </div>

            {/* 5-Segment Multi-Color Progress Gauge Bar */}
            <div className="relative pt-3 pb-1">
              <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-rose-600 flex-1 border-r border-[#080c14]" title="0-25: Extreme Fear" />
                <div className="h-full bg-amber-600 flex-1 border-r border-[#080c14]" title="25-45: Fear" />
                <div className="h-full bg-yellow-500 flex-1 border-r border-[#080c14]" title="45-55: Neutral" />
                <div className="h-full bg-lime-500 flex-1 border-r border-[#080c14]" title="55-75: Greed" />
                <div className="h-full bg-emerald-500 flex-1" title="75-100: Extreme Greed" />
              </div>

              {/* Triangle Marker Pointer */}
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
                style={{ left: `${Math.max(4, Math.min(96, fng))}%` }}
              >
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md" />
              </div>

              {/* Tier Legend Labels */}
              <div className="flex items-center justify-between text-[9px] font-bold uppercase mt-2 font-sans">
                <span className="text-rose-400">Extreme Fear (0-25)</span>
                <span className="text-amber-400">Fear (25-45)</span>
                <span className="text-yellow-400">Neutral (45-55)</span>
                <span className="text-lime-400">Greed (55-75)</span>
                <span className="text-emerald-400">Extreme Greed (75-100)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Fear & Greed 7-Day History with Visual Score Bars */}
            <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3 font-mono-num tabular-nums">
              <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
                <span className="font-extrabold text-white text-xs font-sans">
                  7-Day Historical Sentiment Trend
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Alternative.me</span>
              </div>

              <div className="space-y-2">
                {sentimentData?.fear_and_greed?.history?.map((item: any, idx: number) => {
                  const val = parseInt(item.value);
                  const isToday = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border space-y-1 text-xs ${
                        isToday ? "bg-[#121c32] border-indigo-500/40" : "bg-[#080c14] border-[#1e2b45]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${val >= 60 ? "bg-emerald-400" : val <= 40 ? "bg-rose-400" : "bg-amber-300"}`} />
                          <span className="font-sans text-slate-300 font-bold">
                            {isToday ? "Today (Latest)" : `${idx}d Ago`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${val >= 60 ? "text-emerald-400" : val <= 40 ? "text-rose-400" : "text-amber-300"}`}>
                            {val}
                          </span>
                          <span className="text-[10px] font-sans text-slate-400">
                            ({item.value_classification})
                          </span>
                        </div>
                      </div>
                      {/* Visual 0-100 Score Bar */}
                      <div className="w-full h-1 bg-[#121c32] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            val >= 60 ? "bg-emerald-400" : val <= 40 ? "bg-rose-400" : "bg-amber-400"
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Perpetual Funding Rates & Basis with Bars */}
            <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3 font-mono-num tabular-nums">
              <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
                <span className="font-extrabold text-white text-xs font-sans">
                  Perpetual Funding Rates &amp; Basis
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">Delta &bull; Binance</span>
              </div>

              <div className="space-y-2 font-sans">
                {sentimentData?.funding_rates?.map((fr: any, idx: number) => {
                  const isPositive = (fr.rate || 0) >= 0;
                  const absPct = Math.min(100, Math.abs(fr.rate || 0.0001) * 500000);
                  return (
                    <div key={idx} className="bg-[#080c14] border border-[#1e2b45] p-2.5 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{fr.symbol}</span>
                        <span className={`font-mono-num font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {fr.rate_pct}
                        </span>
                      </div>
                      {/* Funding Rate Magnitude Bar */}
                      <div className="w-full h-1.5 bg-[#121c32] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isPositive ? "bg-emerald-400" : "bg-rose-400"}`}
                          style={{ width: `${Math.max(15, absPct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-num">
                        <span>Annualized: {fr.annualized}</span>
                        <span className="text-slate-300 font-sans">{fr.sentiment}</span>
                      </div>
                    </div>
                  );
                })}

                <div className="p-2 bg-[#080c14] border border-[#18263f] rounded-lg text-[10px] text-slate-400 leading-relaxed">
                  Positive funding rate indicates perpetuals trade at a premium over spot; long traders pay short traders every 8 hours.
                </div>
              </div>
            </div>

            {/* Trending Coins (CoinGecko Live API) */}
            <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3.5 space-y-3 font-mono-num tabular-nums">
              <div className="flex items-center justify-between border-b border-[#18263f] pb-2">
                <span className="font-extrabold text-white text-xs font-sans">
                  CoinGecko Trending Assets
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Free Public API</span>
              </div>

              <div className="space-y-1.5 font-sans">
                {sentimentData?.trending_coins?.length > 0 ? (
                  sentimentData.trending_coins.map((coin: any, idx: number) => (
                    <div key={idx} className="bg-[#080c14] border border-[#1e2b45] p-2 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {coin.thumb && (
                          <img src={coin.thumb} alt={coin.name} className="w-4 h-4 rounded-full" />
                        )}
                        <span className="font-bold text-white">{coin.name}</span>
                        <span className="text-[10px] text-indigo-300 font-mono uppercase font-bold">{coin.symbol}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Rank #{coin.rank || idx + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2 py-1">
                    {[1, 2, 3].map((sk) => (
                      <div key={sk} className="bg-[#080c14] border border-[#1e2b45] p-2 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SkeletonBox className="w-4 h-4 rounded-full" />
                          <SkeletonBox className="w-20 h-3" />
                          <SkeletonBox className="w-10 h-2.5 rounded" />
                        </div>
                        <SkeletonBox className="w-14 h-2.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BREAKING CRYPTO NEWS WITH DEEP-DIVE ARTICLE MODAL */}
      {activeTab === "NEWS" && (
        <div className="space-y-3 animate-in fade-in font-sans">
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden divide-y divide-[#141e30]">
            {newsData?.news?.map((n: any) => {
              const impactScore = n.market_impact_score || 85;
              const isBull = n.sentiment === "BULLISH";
              const isBear = n.sentiment === "BEARISH";

              return (
                <div key={n.id} className="p-3.5 sm:p-4 hover:bg-[#121c32]/50 transition-colors space-y-2.5">
                  {/* Top Category, Sentiment, Time & Source Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                        isBull
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : isBear
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          : "bg-slate-700 text-slate-300"
                      }`}>
                        {n.sentiment}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#18263f] text-slate-300 border border-[#1e2b45]">
                        {n.category}
                      </span>

                      <span className="text-[10.5px] text-slate-400 font-mono-num flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {n.time_ago}
                      </span>

                      {n.read_time && (
                        <span className="text-[10px] text-slate-400 font-sans">
                          &bull; {n.read_time}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-400">
                        {n.source}
                      </span>
                      {n.author && (
                        <span className="text-[10px] text-slate-500 hidden sm:inline font-sans">
                          ({n.author})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Headline & Tradable Asset Badges */}
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug">
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-sans font-semibold">Affected Contracts:</span>
                      {n.affected_symbols?.map((sym: string) => (
                        <Link
                          key={sym}
                          href={`/chart/${sym}`}
                          onClick={() => setSelectedSymbol(sym)}
                          className="px-1.5 py-0.2 rounded text-[9.5px] font-mono-num font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                        >
                          {sym} &rarr;
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Market Volatility Impact Progress Bar */}
                  <div className="bg-[#080c14] border border-[#1e2b45] p-2 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold font-sans">
                      <span className="text-slate-400">Market Volatility Impact Rating:</span>
                      <span className={`font-mono-num ${impactScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                        {impactScore}/100 ({n.impact} IMPACT)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#121c32] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          impactScore >= 80
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-amber-500 to-yellow-400"
                        }`}
                        style={{ width: `${impactScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {n.summary}
                  </p>

                  {/* Key Takeaways Bullets (If present) */}
                  {n.key_takeaways && (
                    <div className="bg-[#080c14] border border-[#18263f] rounded-lg p-2.5 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
                        Key Institutional Takeaways:
                      </span>
                      <ul className="space-y-0.5 text-[10.5px] text-slate-300 list-disc list-inside">
                        {n.key_takeaways.slice(0, 2).map((tk: string, i: number) => (
                          <li key={i} className="leading-snug">
                            {tk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions: Read Full Article & Quant Impact Button */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedArticle(n)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Read Full Quantitative Article &amp; Analysis &rarr;</span>
                    </button>

                    <span className="text-[10.5px] text-slate-400 font-mono-num">
                      Published {n.time_ago}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE FULL ARTICLE & QUANT IMPACT MODAL DRAWER                     */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-[#0c1220] border border-[#1e2b45] max-w-3xl w-full rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-[#080c14] border-b border-[#18263f] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                    selectedArticle.sentiment === "BULLISH"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : selectedArticle.sentiment === "BEARISH"
                      ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {selectedArticle.sentiment}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#18263f] text-slate-300 border border-[#1e2b45]">
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs text-indigo-400 font-bold font-sans">
                    {selectedArticle.source}
                  </span>
                  {selectedArticle.read_time && (
                    <span className="text-[10px] text-slate-400 font-sans">
                      &bull; {selectedArticle.read_time}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                  {selectedArticle.title}
                </h2>
                {selectedArticle.author && (
                  <p className="text-[11px] text-slate-400 font-sans">
                    By <strong className="text-slate-200">{selectedArticle.author}</strong> &bull; {selectedArticle.time_ago}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#18263f] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-xs">
              {/* Market Impact & Tradable Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-num">
                <div className="bg-[#080c14] border border-[#18263f] p-2.5 rounded-lg space-y-1">
                  <span className="text-[9.5px] text-slate-400 font-sans uppercase font-bold block">
                    Market Volatility Impact Rating
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-black text-emerald-400">
                      {selectedArticle.market_impact_score || 88} / 100
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-300 font-sans uppercase">
                      {selectedArticle.impact || "HIGH"} IMPACT
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#121c32] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                      style={{ width: `${selectedArticle.market_impact_score || 88}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#080c14] border border-[#18263f] p-2.5 rounded-lg space-y-1">
                  <span className="text-[9.5px] text-slate-400 font-sans uppercase font-bold block">
                    Tradable Derivative Contracts
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {selectedArticle.affected_symbols?.map((sym: string) => (
                      <Link
                        key={sym}
                        href={`/chart/${sym}`}
                        onClick={() => {
                          setSelectedSymbol(sym);
                          setSelectedArticle(null);
                        }}
                        className="px-2 py-1 rounded text-xs font-mono-num font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/40 transition-colors flex items-center gap-1"
                      >
                        <span>{sym}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Takeaways */}
              {selectedArticle.key_takeaways && (
                <div className="bg-[#080c14] border border-indigo-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Institutional Executive Takeaways:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {selectedArticle.key_takeaways.map((tk: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 font-bold">&bull;</span>
                        <span>{tk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Multi-Paragraph In-Depth Article */}
              <div className="space-y-3 font-sans">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block">
                  Full Quantitative Analysis &amp; Order Flow Context:
                </span>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2.5 font-normal">
                  {selectedArticle.full_article || selectedArticle.summary}
                </div>
              </div>

              {/* Recommended Algorithmic Strategy Play */}
              {selectedArticle.algo_play && (
                <div className="bg-[#080c14] border border-emerald-500/40 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Recommended Algorithmic Execution Play:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedArticle.algo_play}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#080c14] border-t border-[#18263f] flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-3 py-1.5 bg-[#121c32] hover:bg-[#1a2744] text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Analysis
              </button>

              {selectedArticle.affected_symbols?.[0] && (
                <Link
                  href={`/chart/${selectedArticle.affected_symbols[0]}`}
                  onClick={() => {
                    setSelectedSymbol(selectedArticle.affected_symbols[0]);
                    setSelectedArticle(null);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Trade {selectedArticle.affected_symbols[0]} on Live Chart &rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
