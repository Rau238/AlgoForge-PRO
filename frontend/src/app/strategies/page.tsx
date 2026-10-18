"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import { StrategiesSkeleton } from "@/components/common/PageSkeletons";
import {
  Cpu,
  PlusCircle,
  TrendingUp,
  Percent,
  ShieldAlert,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers,
  Zap,
  Activity,
  CheckCircle2,
  X,
  Building2,
  Receipt,
  Scale,
  LineChart,
  HelpCircle,
  Clock,
  History,
  Target,
  Flame,
  Radio,
  Coins,
  Play,
  RotateCw,
} from "lucide-react";

export default function StrategiesPage() {
  const router = useRouter();
  const { setSelectedSymbol, setIsTradePlannerOpen } = useAlgoForgeStore();

  // Core Data States
  const [strategies, setStrategies] = useState<any[]>([]);
  const [deployedStrategies, setDeployedStrategies] = useState<any[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [autoTraderStatus, setAutoTraderStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "CRYPTO" | "COMMODITIES" | "ARBITRAGE">("ALL");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "EXTREME_100X" | "HIGH_RISK" | "MODERATE">("ALL");
  const [deploymentFilter, setDeploymentFilter] = useState<"ALL" | "DEPLOYED_ONLY" | "STANDBY_ONLY">("ALL");
  const [sectionView, setSectionView] = useState<"ALL_SECTIONS" | "AUTONOMOUS_FLEET" | "LIVE_HISTORY" | "CUSTOM_STRATEGIES">("ALL_SECTIONS");

  // Interaction feedback states
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deployingAll, setDeployingAll] = useState(false);
  const [undeployingAll, setUndeployingAll] = useState(false);

  // Add Strategy Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStratName, setNewStratName] = useState("");
  const [newStratMarket, setNewStratMarket] = useState("CRYPTO");
  const [newStratSymbol, setNewStratSymbol] = useState("BTCUSDT");
  const [newStratTimeframe, setNewStratTimeframe] = useState("1H");
  const [newStratLeverage, setNewStratLeverage] = useState(50);
  const [newStratIndicator, setNewStratIndicator] = useState("EMA_RSI");
  const [newStratSlType, setNewStratSlType] = useState("ATR");
  const [newStratSlValue, setNewStratSlValue] = useState(1.5);
  const [newStratDescription, setNewStratDescription] = useState("");

  const loadAllData = async () => {
    try {
      const [strats, deployed, history, status] = await Promise.all([
        api.getStrategies().catch(() => []),
        api.getDeployedStrategies().catch(() => []),
        api.getAutoTraderExecutionHistory().catch(() => []),
        api.getAutoTraderStatus().catch(() => null),
      ]);
      setStrategies(strats || []);
      setDeployedStrategies(deployed || []);
      setExecutionHistory(history || []);
      setAutoTraderStatus(status);
    } catch (e) {
      console.error("Error loading strategies data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Deploy All 12 Fleet Strategies
  const handleDeployAll = async () => {
    try {
      setDeployingAll(true);
      await api.deployAllStrategies();
      setActionMsg("🚀 All 12 Institutional Quant Algorithms armed & actively scanning Delta Exchange markets!");
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setActionMsg(`Failed to deploy fleet: ${err.message || "Unknown error"}`);
    } finally {
      setDeployingAll(false);
      setTimeout(() => setActionMsg(null), 6000);
    }
  };

  // Undeploy All Strategies (Standby Mode)
  const handleUndeployAll = async () => {
    try {
      setUndeployingAll(true);
      await api.undeployAllStrategies();
      setActionMsg("⏸️ All 12 Quant Algorithms placed in STANDBY mode (auto-execution paused).");
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setActionMsg(`Failed to pause fleet: ${err.message || "Unknown error"}`);
    } finally {
      setUndeployingAll(false);
      setTimeout(() => setActionMsg(null), 6000);
    }
  };

  // Single Strategy Deployment Toggle
  const handleToggleStrategy = async (strategyId: string) => {
    try {
      setTogglingId(strategyId);
      const res = await api.toggleAutoTraderStrategy(strategyId);
      const isNowDeployed = res.is_deployed;
      setActionMsg(
        isNowDeployed
          ? `🟢 [DEPLOYED] "${res.strategy_name || strategyId}" is now armed & actively monitoring Delta Exchange live feed!`
          : `⏸️ [STANDBY] "${res.strategy_name || strategyId}" paused and un-deployed from autonomous execution.`
      );
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setActionMsg(`Failed to toggle strategy: ${err.message || "Unknown error"}`);
    } finally {
      setTogglingId(null);
      setTimeout(() => setActionMsg(null), 5000);
    }
  };

  // Trigger test trade for a strategy
  const handleExecuteTrade = async (stratId: string, sym: string, lev: number) => {
    try {
      setTriggeringId(stratId);
      const res = await api.executeRiskyTrade(sym, lev, stratId);
      setActionMsg(`⚡ [EXECUTED] ${lev}x Algo trade on ${sym}! Isolated margin: $${res.position?.initial_margin || "5.00"}.`);
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setActionMsg(`Trade execution failed: ${err.message || "Engine busy"}`);
    } finally {
      setTriggeringId(null);
      setTimeout(() => setActionMsg(null), 6000);
    }
  };

  // Add Custom Strategy
  const handleCreateCustomStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratName) return;
    try {
      setIsSubmitting(true);
      const payload = {
        name: newStratName,
        market: newStratMarket,
        symbol: newStratSymbol,
        timeframe: newStratTimeframe,
        max_leverage: Number(newStratLeverage),
        default_leverage: Math.min(20, Number(newStratLeverage)),
        description: newStratDescription || `${newStratName} institutional model`,
        indicator: newStratIndicator,
        sl_type: newStratSlType,
        sl_value: Number(newStratSlValue),
        tp_type: "RR_RATIO",
        tp_value: 2.5,
        category: newStratMarket === "COMMODITIES" ? "COMMODITIES" : "CRYPTO",
        exchange: "Delta Exchange",
      };
      await api.createStrategy(payload);
      setIsAddModalOpen(false);
      setActionMsg(`Strategy "${newStratName}" registered successfully!`);
      await loadAllData();
      setNewStratName("");
      setNewStratDescription("");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to create strategy: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionMsg(null), 5000);
    }
  };

  // Filter Deployed Institutional Strategies
  const filteredDeployed = deployedStrategies.filter((s) => {
    if (deploymentFilter === "DEPLOYED_ONLY" && !s.is_deployed) return false;
    if (deploymentFilter === "STANDBY_ONLY" && s.is_deployed) return false;
    if (riskFilter === "EXTREME_100X") return s.leverage >= 100;
    if (riskFilter === "HIGH_RISK") return s.leverage >= 35 && s.leverage < 100;
    if (riskFilter === "MODERATE") return s.leverage < 35;
    return true;
  });

  const deployedCount = deployedStrategies.filter((s) => s.is_deployed).length;
  const standbyCount = deployedStrategies.length - deployedCount;

  // Filter Custom Strategies
  const filteredCustom = strategies.filter((strat) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CRYPTO") return strat.market?.includes("CRYPTO") && strat.category !== "ARBITRAGE";
    if (activeTab === "COMMODITIES") return strat.market?.includes("COMMODITIES");
    if (activeTab === "ARBITRAGE") return strat.category === "ARBITRAGE";
    return true;
  });

  // Calculate Aggregated Metrics
  const totalFleetEarnings = deployedStrategies.reduce((sum, s) => sum + (s.historical_earnings || 0), 0);
  const avgFleetAccuracy = deployedStrategies.length > 0
    ? (deployedStrategies.reduce((sum, s) => sum + (s.accuracy || 0), 0) / deployedStrategies.length).toFixed(1)
    : "78.4";

  if (loading) {
    return <StrategiesSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-4 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Action Notification Banner */}
      {actionMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Header & Top Fleet Metrics */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#18263f] pb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Algorithmic Strategies Hub
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-num font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                Autonomous Engine Active &bull; {deployedCount}/12 Deployed
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400">
              Institutional quantitative execution architectures with dynamic leverage (up to 100x), Maker rebate harvesting (0.02%), and automated capital compounding
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleDeployAll}
              disabled={deployingAll}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
              title="Deploy all 12 institutional strategies for autonomous trading"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>{deployingAll ? "Deploying..." : "Deploy All 12 Once"}</span>
            </button>

            <button
              onClick={handleUndeployAll}
              disabled={undeployingAll}
              className="px-3 py-1.5 bg-[#17233c] hover:bg-[#202f4f] disabled:opacity-50 text-slate-300 hover:text-white border border-[#1e2b45] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Pause all strategies and return to Standby"
            >
              <span>{undeployingAll ? "Pausing..." : "Pause All (Standby)"}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-2.5 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Add Strategy</span>
            </button>

            <Link
              href="/strategy-builder"
              className="px-2.5 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-slate-200 border border-[#1e2b45] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Visual Builder</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Fleet KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-[#080c14] border border-[#18263f] p-2.5 rounded-lg space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Total Fleet Historical Earnings</span>
            <span className="text-emerald-400 font-extrabold text-base font-mono-num tabular-nums block">
              +${totalFleetEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9.5px] text-slate-500 block">Across 12 institutional quant models</span>
          </div>

          <div className="bg-[#080c14] border border-[#18263f] p-2.5 rounded-lg space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Average Win Rate / Accuracy</span>
            <span className="text-cyan-300 font-extrabold text-base font-mono-num tabular-nums block">
              {avgFleetAccuracy}% Confluence
            </span>
            <span className="text-[9.5px] text-slate-500 block">Delta Arbitrage leads at 88.4%</span>
          </div>

          <div className="bg-[#080c14] border border-[#18263f] p-2.5 rounded-lg space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Active Fleet Deployment</span>
            <span className="text-emerald-400 font-extrabold text-base font-mono-num tabular-nums block">
              {deployedCount} Active / {standbyCount} Standby
            </span>
            <span className="text-[9.5px] text-slate-500 block">Single-click individual deployment</span>
          </div>

          <div className="bg-[#080c14] border border-[#18263f] p-2.5 rounded-lg space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Exchange Execution Specs</span>
            <span className="text-indigo-300 font-extrabold text-base block">
              0.02% Maker / 0.05% Taker
            </span>
            <span className="text-[9.5px] text-slate-500 block">Delta Exchange derivatives engine</span>
          </div>
        </div>

        {/* Section View Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#18263f]">
          {[
            { id: "ALL_SECTIONS", label: "All Sections (Comprehensive View)", count: deployedStrategies.length + strategies.length },
            { id: "AUTONOMOUS_FLEET", label: "🤖 Section 1: Autonomous Execution Desk", count: deployedStrategies.length },
            { id: "LIVE_HISTORY", label: "📜 Section 2: Live Execution & Earnings History", count: executionHistory.length },
            { id: "CUSTOM_STRATEGIES", label: "🛠️ Section 3: User Custom Strategies", count: strategies.length },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSectionView(sec.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                sectionView === sec.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[#080c14] text-slate-400 hover:text-white border border-[#18263f]"
              }`}
            >
              <span>{sec.label}</span>
              <span className="text-[9.5px] px-1 py-0.2 rounded bg-white/10 text-slate-200">
                {sec.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: AUTONOMOUS INSTITUTIONAL EXECUTION DESK (12 QUANT ALGORITHMS)   */}
      {/* ========================================================================= */}
      {(sectionView === "ALL_SECTIONS" || sectionView === "AUTONOMOUS_FLEET") && (
        <section className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1220] border-l-4 border-l-emerald-500 border border-[#18263f] p-3 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SECTION 1: AUTONOMOUS EXECUTION FLEET
                </span>
                <span className="text-xs text-white font-bold">12 High-Frequency Quant Algorithms</span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Clearly view which strategies are currently <strong>DEPLOYED (ACTIVE AUTO-EXECUTION)</strong> versus <strong>STANDBY</strong>. Single-click to deploy or pause any model.
              </p>
            </div>

            {/* Filter Pills: Deployment Status & Risk Tiers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Deployment Filter Pills */}
              <div className="flex items-center space-x-1 bg-[#080c14] border border-[#18263f] rounded-lg p-1 text-xs">
                {[
                  { id: "ALL", label: `All (${deployedStrategies.length})` },
                  { id: "DEPLOYED_ONLY", label: `🟢 Deployed (${deployedCount})` },
                  { id: "STANDBY_ONLY", label: `⏸️ Standby (${standbyCount})` },
                ].map((df) => (
                  <button
                    key={df.id}
                    onClick={() => setDeploymentFilter(df.id as any)}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                      deploymentFilter === df.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>

              {/* Risk Tier Filter */}
              <div className="flex items-center space-x-1 bg-[#080c14] border border-[#18263f] rounded-lg p-1 text-xs">
                {[
                  { id: "ALL", label: "All Tiers" },
                  { id: "EXTREME_100X", label: "Extreme 100x" },
                  { id: "HIGH_RISK", label: "High Risk (35x-50x)" },
                  { id: "MODERATE", label: "Moderate (10x-25x)" },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => setRiskFilter(rf.id as any)}
                    className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                      riskFilter === rf.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 12 Strategies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDeployed.map((s) => {
              const primarySym = s.symbols?.[0] || "BTCUSDT";
              const isExtreme = s.leverage >= 100;
              const isHigh = s.leverage >= 50 && s.leverage < 100;
              const isTriggered = s.condition_met;
              const isDeployed = s.is_deployed !== false;

              return (
                <div
                  key={s.id}
                  className={`bg-[#0c1220] border rounded-xl p-3.5 flex flex-col justify-between transition-all space-y-3 ${
                    isDeployed
                      ? isTriggered
                        ? "border-emerald-500/80 shadow-lg shadow-emerald-500/10"
                        : "border-emerald-500/30 hover:border-emerald-500/60"
                      : "border-[#18263f] opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* TOP STATUS BAR: PROMINENT DEPLOYED VS STANDBY BADGE + DIRECT TOGGLE */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#18263f]">
                      {isDeployed ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>DEPLOYED (AUTO-EXECUTION ON)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <span>STANDBY (NOT DEPLOYED)</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleToggleStrategy(s.id)}
                        disabled={togglingId === s.id}
                        className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                          isDeployed
                            ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                        }`}
                        title={isDeployed ? "Pause strategy and un-deploy to Standby" : "Deploy strategy for live autonomous trading"}
                      >
                        {togglingId === s.id ? (
                          <span>Updating...</span>
                        ) : isDeployed ? (
                          <span>Pause (Standby)</span>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-yellow-300" />
                            <span>Deploy Strategy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Header: Name + Risk Badge + Accuracy */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white tracking-tight">
                            {s.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                              isExtreme
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isHigh
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {s.leverage}x Max Leverage
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono">
                            {primarySym} &bull; {s.timeframe}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-emerald-400 font-black text-xs font-mono-num tabular-nums block">
                          {s.accuracy}% Win
                        </span>
                        <span className="text-[9px] text-slate-500 block">PF: {s.profit_factor}</span>
                      </div>
                    </div>

                    {/* How & From Where it is Coming (Signal Source Pipeline) */}
                    <div className="bg-[#080c14] border border-[#18263f] rounded-lg p-2 space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-300">
                        <Radio className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>Signal Ingestion Pipeline:</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                        {s.id === "delta_high_volume_scalp" && "Delta #1 Volume Screener ($9.3M ETH turnover) + CVD Delta Surge"}
                        {s.id === "hyper_scalper_100x" && "Delta Live WebSocket L2 Depth + Sub-millisecond Orderbook Bid/Ask Wall Skew"}
                        {s.id === "liquidation_squeeze_50x" && "Binance/Delta Liquidation Cluster Monitor (<0.8% distance breach) + Volume Surge"}
                        {s.id === "orderbook_imbalance_sniper" && "2.5x Bid/Ask Wall Absorption + Delta CVD Divergence on high-volume ticks"}
                        {s.id === "grid_liquidity_maker" && "Delta Orderbook Geometric Grid capturing 0.02% Maker Rebates on narrow spreads"}
                        {s.id === "delta_arbitrage" && "Delta 8-Hour Funding Rate Differential Matrix (>0.0100% basis premium capture)"}
                        {s.id === "multi_tf_trend_ribbon" && "Confluent 20/50/200 EMA Ribbon across 5m, 15m, and 1h candles + MACD confirmation"}
                        {s.id === "vwap_imbalance" && "Session VWAP Cross + 15% Buyer Volume Delta on Institutional Flow"}
                        {s.id === "delta_momentum" && "EMA(20) > EMA(50) breakout + RSI(14) 45-70 momentum channel expansion"}
                        {s.id === "volatility_breakout_50x" && "Bollinger Band (20, 2.5) expansion + ATR(14) volatility spike > 1.35x baseline"}
                        {s.id === "supertrend_trend" && "Directional Supertrend(10, 3.0) flip on 15m candles with volatility squeeze release"}
                        {s.id === "delta_gold_silver" && "Delta Commodity Trend Engine on PAXG, XAUUSD & USOIL with 1.2x ATR breakout"}
                      </p>
                    </div>

                    {/* Earnings & Mathematical Quant Performance */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-num tabular-nums">
                      <div className="bg-[#080c14] border border-[#18263f] p-2 rounded-lg">
                        <span className="text-[9.5px] text-slate-500 uppercase font-bold block mb-0.5">Historical Earnings</span>
                        <span className="text-emerald-400 font-extrabold text-xs block">
                          +${s.historical_earnings?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="bg-[#080c14] border border-[#18263f] p-2 rounded-lg">
                        <span className="text-[9.5px] text-slate-500 uppercase font-bold block mb-0.5">$100 Account Sizing</span>
                        <span className="text-indigo-300 font-extrabold text-xs block">
                          ${s.target_margin?.toFixed(2)} Margin
                        </span>
                      </div>
                    </div>

                    {/* Live Condition Checklist */}
                    <div className="bg-[#080c14] border border-[#18263f] rounded-lg p-2 space-y-1">
                      <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold uppercase">
                        <span>Live Condition Checklist</span>
                        <span className={isTriggered ? "text-emerald-400 font-black" : "text-amber-400 font-bold"}>
                          {isTriggered ? "CONDITION MET ✓" : "SCANNING FEED..."}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[10px]">
                        {s.condition_checklist?.map((chk: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1">
                              <span className={chk.met ? "text-emerald-400 font-bold" : "text-slate-500"}>
                                {chk.met ? "✓" : "○"}
                              </span>
                              <span>{chk.label}</span>
                            </span>
                            <span className="font-mono text-[9px] text-slate-400">{chk.current}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[#18263f] flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/chart/${primarySym}`}
                      onClick={() => setSelectedSymbol(primarySym)}
                      className="px-2.5 py-1 rounded bg-[#17233c] hover:bg-[#202f4f] text-slate-200 font-bold text-[10.5px] border border-[#1e2b45] transition-colors"
                    >
                      View Chart
                    </Link>

                    <button
                      onClick={() => handleExecuteTrade(s.id, primarySym, s.leverage)}
                      disabled={triggeringId === s.id}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[10.5px] transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{triggeringId === s.id ? "Firing..." : `Execute ${s.leverage}x Trade`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: LIVE AUTONOMOUS EXECUTION & EARNINGS HISTORY                    */}
      {/* ========================================================================= */}
      {(sectionView === "ALL_SECTIONS" || sectionView === "LIVE_HISTORY") && (
        <section className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1220] border-l-4 border-l-cyan-500 border border-[#18263f] p-3 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SECTION 2: LIVE AUTONOMOUS EXECUTION &amp; EARNINGS HISTORY
                </span>
                <span className="text-xs text-white font-bold">Real-Time Autonomous Fills &amp; Signal Origins</span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Displays live trade settlements generated by our autonomous strategies, showing exact dollar earnings, execution leverage, and the precise market catalyst.
              </p>
            </div>

            <span className="text-[10.5px] text-slate-400 font-mono-num tabular-nums">
              Total Recorded Fills: <strong className="text-white">{executionHistory.length}</strong>
            </span>
          </div>

          {/* Autonomous Execution Table */}
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-num tabular-nums">
                <thead>
                  <tr className="bg-[#0a0f1d] text-slate-400 font-sans font-bold text-[9.5px] uppercase border-b border-[#18263f]">
                    <th className="text-left py-2 px-3">Execution ID</th>
                    <th className="text-left py-2 px-3">Algorithm &amp; Symbol</th>
                    <th className="text-center py-2 px-3">Direction</th>
                    <th className="text-center py-2 px-3">Leverage</th>
                    <th className="text-right py-2 px-3">Entry &rarr; Exit</th>
                    <th className="text-right py-2 px-3">Allocated Margin</th>
                    <th className="text-right py-2 px-3 text-emerald-400 font-bold">Net Earnings</th>
                    <th className="text-left py-2 px-3 max-w-xs">How &amp; From Where It Came (Signal Origin)</th>
                    <th className="text-center py-2 px-3">Status</th>
                    <th className="text-center py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141e30]">
                  {executionHistory.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                        No autonomous executions recorded yet. Click "Deploy All" to start live trade monitoring.
                      </td>
                    </tr>
                  ) : (
                    executionHistory.map((tx) => {
                      const isLong = tx.direction === "LONG";
                      const isPositive = (tx.pnl || 0) >= 0;

                      return (
                        <tr key={tx.id} className="hover:bg-[#121b2f]/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[10.5px] text-indigo-300 font-bold">
                            {tx.id}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block text-xs">{tx.strategy_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tx.symbol} &bull; Delta Perp</span>
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-black inline-block ${
                                isLong
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {tx.direction}
                            </span>
                          </td>
                          <td className="text-center py-2.5 px-3 font-bold text-white">
                            <span className="px-1.5 py-0.5 rounded bg-[#17233c] text-indigo-300 border border-[#1e2b45] text-[10px]">
                              {tx.leverage}x
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-3">
                            <span className="text-slate-300 block font-bold">${tx.entry_price?.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 block">&rarr; ${tx.exit_price?.toLocaleString()}</span>
                          </td>
                          <td className="text-right py-2.5 px-3 text-slate-300">
                            ${tx.margin?.toFixed(2)}
                          </td>
                          <td className={`text-right py-2.5 px-3 font-extrabold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPositive ? "+" : ""}${tx.pnl?.toFixed(2)}
                            <span className={`text-[10px] block ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                              {isPositive ? "+" : ""}{tx.pnl_pct?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans max-w-sm">
                            <span className="text-[11px] text-slate-200 block font-medium leading-tight">
                              {tx.signal_origin}
                            </span>
                            <span className="text-[9.5px] text-indigo-400 font-mono block mt-0.5">
                              📡 {tx.signal_source}
                            </span>
                          </td>
                          <td className="text-center py-2.5 px-3 whitespace-nowrap">
                            {tx.exit_type === "TAKE_PROFIT" || tx.status?.includes("PROFIT") ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  COMPLETED (PROFIT)
                                </span>
                                <span className="text-[9px] text-emerald-400 font-sans mt-0.5 font-bold">{tx.exit_reason || "TP Hit"}</span>
                              </div>
                            ) : tx.exit_type === "STOP_LOSS" || tx.status?.includes("STOP LOSS") || tx.result === "LOSS" ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                                  COMPLETED (SL HIT)
                                </span>
                                <span className="text-[9px] text-rose-400 font-sans mt-0.5 font-bold">{tx.exit_reason || "Stop Loss"}</span>
                              </div>
                            ) : tx.exit_type === "BREAKEVEN" || tx.status?.includes("BREAKEVEN") || tx.result === "BREAKEVEN" ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                  <Target className="w-3 h-3 text-cyan-300" />
                                  COMPLETED (BREAKEVEN)
                                </span>
                                <span className="text-[9px] text-cyan-400 font-sans mt-0.5 font-bold">{tx.exit_reason || "0% Risk Protected"}</span>
                              </div>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {tx.status || "ACTIVE"}
                              </span>
                            )}
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <Link
                              href={`/chart/${tx.symbol}`}
                              onClick={() => setSelectedSymbol(tx.symbol)}
                              className="px-2 py-0.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded text-[10px] font-bold border border-indigo-500/30 transition-colors"
                            >
                              Chart
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: USER CUSTOM & MANUAL ALGORITHMIC STRATEGIES                     */}
      {/* ========================================================================= */}
      {(sectionView === "ALL_SECTIONS" || sectionView === "CUSTOM_STRATEGIES") && (
        <section className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1220] border-l-4 border-l-indigo-500 border border-[#18263f] p-3 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SECTION 3: USER CUSTOM ALGORITHMIC STRATEGIES
                </span>
                <span className="text-xs text-white font-bold">User-Configured Models &amp; Visual Builder Formulations</span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Customize indicator rules, tweak risk multipliers, and run quantitative backtests before live deployment.
              </p>
            </div>

            {/* Custom Category Filter */}
            <div className="flex items-center space-x-1 bg-[#080c14] border border-[#18263f] rounded-lg p-1 text-xs">
              {[
                { id: "ALL", label: `All Custom (${strategies.length})` },
                { id: "CRYPTO", label: "Crypto 100x" },
                { id: "COMMODITIES", label: "Commodities" },
                { id: "ARBITRAGE", label: "Arbitrage" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id as any)}
                  className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                    activeTab === f.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Strategies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCustom.map((strat) => {
              const defaultSym = strat.symbol || (strat.market?.includes("COMMODITIES") ? "XAUUSD" : "BTCUSDT");
              const maxLev = strat.max_leverage || strat.default_leverage || 50;

              return (
                <div
                  key={strat.id}
                  className="bg-[#0c1220] border border-[#18263f] hover:border-indigo-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sm font-bold text-white tracking-tight leading-snug">
                          {strat.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9.5px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                            {strat.exchange || "Delta Exchange"} &bull; {maxLev}x Max
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400">
                            {defaultSym} &bull; {strat.timeframe}
                          </span>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        Active
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {strat.description}
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 bg-[#080c14] border border-[#18263f] p-2 rounded-lg text-xs font-mono-num tabular-nums">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Indicator</span>
                        <span className="font-bold text-white text-[10.5px] truncate block">{strat.indicator}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Stop Loss</span>
                        <span className="font-bold text-rose-400 text-[10.5px] block">{strat.sl_value}x {strat.sl_type}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Take Profit</span>
                        <span className="font-bold text-emerald-400 text-[10.5px] block">1:{strat.tp_value || 2.5} RR</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#18263f] flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/backtesting?strategy=${strat.id}&market=${strat.market}&symbol=${defaultSym}&leverage=${maxLev}`}
                      className="px-2.5 py-1 bg-[#17233c] hover:bg-[#202f4f] text-slate-200 rounded font-bold text-[10.5px] border border-[#1e2b45] transition-colors"
                    >
                      Backtest Model
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedSymbol(defaultSym);
                        setIsTradePlannerOpen(true);
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10.5px] transition-all shadow-sm cursor-pointer"
                    >
                      Open in Planner
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add Custom Strategy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl w-full max-w-lg p-5 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#18263f] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Register New Custom Strategy
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCustomStrategy} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Strategy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delta Hyper Volatility Sniper"
                  value={newStratName}
                  onChange={(e) => setNewStratName(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#18263f] rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Market Type</label>
                  <select
                    value={newStratMarket}
                    onChange={(e) => setNewStratMarket(e.target.value)}
                    className="w-full bg-[#080c14] border border-[#18263f] rounded px-2.5 py-2 text-white font-bold focus:outline-none"
                  >
                    <option value="CRYPTO">CRYPTO FUTURES (100x)</option>
                    <option value="COMMODITIES">COMMODITIES (50x Gold/Oil)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Primary Symbol</label>
                  <input
                    type="text"
                    value={newStratSymbol}
                    onChange={(e) => setNewStratSymbol(e.target.value.toUpperCase())}
                    className="w-full bg-[#080c14] border border-[#18263f] rounded px-3 py-2 text-white font-bold uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Max Leverage</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newStratLeverage}
                    onChange={(e) => setNewStratLeverage(Number(e.target.value))}
                    className="w-full bg-[#080c14] border border-[#18263f] rounded px-3 py-2 text-white font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Timeframe</label>
                  <select
                    value={newStratTimeframe}
                    onChange={(e) => setNewStratTimeframe(e.target.value)}
                    className="w-full bg-[#080c14] border border-[#18263f] rounded px-2.5 py-2 text-white font-bold focus:outline-none"
                  >
                    <option value="1m">1m Flash</option>
                    <option value="5m">5m Scalp</option>
                    <option value="15m">15m Trend</option>
                    <option value="1H">1H Institutional</option>
                    <option value="4H">4H Swing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Strategy Description &amp; Alpha Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Explain entry/exit rules and indicators..."
                  value={newStratDescription}
                  onChange={(e) => setNewStratDescription(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#18263f] rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#17233c] text-gray-300 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-bold cursor-pointer"
                >
                  {isSubmitting ? "Registering..." : "Register Strategy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
