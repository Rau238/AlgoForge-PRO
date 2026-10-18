"use client";

import React, { useState, useEffect } from "react";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import { TradePlanCard } from "./TradePlanCard";
import {
  SlidersHorizontal,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  Percent,
  CheckCircle2,
  DollarSign,
  Radio,
  Layers,
  Zap,
  AlertTriangle,
  Building2,
  Activity,
  Receipt,
  Scale,
} from "lucide-react";

export const TradePlannerDrawer: React.FC = () => {
  const {
    isTradePlannerOpen,
    setIsTradePlannerOpen,
    selectedSymbol,
    setSelectedSymbol,
    tradeSetup,
    setTradeLevel,
    setTradeDirection,
    setRiskPct,
    setTpAllocation,
    liveQuotes,
    account,
    updateAccount,
    initTradeSetupForPrice,
    positions,
  } = useAlgoForgeStore();

  const [balance, setBalance] = useState(account.balance);
  const [marginMode, setMarginMode] = useState<"ISOLATED" | "CROSS">("ISOLATED");
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sync balance if account.balance changes
  useEffect(() => {
    setBalance(account.balance);
  }, [account.balance]);

  const currentQuote = liveQuotes[selectedSymbol];
  const activePosition = positions.find((p) => p.symbol === selectedSymbol && p.status === "OPEN");

  // Auto-sync entry to market price if uninitialized or placeholder
  useEffect(() => {
    if (currentQuote?.price) {
      if (
        !tradeSetup.entry ||
        tradeSetup.entry === 104250 ||
        Math.abs(tradeSetup.entry - currentQuote.price) / currentQuote.price > 0.12
      ) {
        initTradeSetupForPrice(currentQuote.price, selectedSymbol);
      }
    }
  }, [currentQuote?.price, selectedSymbol, initTradeSetupForPrice, tradeSetup.entry]);

  // Determine Delta Exchange maximum leverage for the active contract
  const getMaxLeverage = (sym: string): number => {
    if (sym === "BTCUSDT" || sym === "ETHUSDT") return 100;
    if (sym === "USOIL") return 20;
    return 50; // SOL, BNB, XRP, DOGE, AVAX, LINK, XAUUSD, XAGUSD
  };

  const maxLeverage = getMaxLeverage(selectedSymbol);
  const defaultLev = selectedSymbol === "BTCUSDT" || selectedSymbol === "ETHUSDT" ? 25 : (selectedSymbol === "USOIL" ? 10 : 20);
  const [leverage, setLeverage] = useState(defaultLev);

  // If active symbol changes, clamp leverage
  useEffect(() => {
    const maxL = getMaxLeverage(selectedSymbol);
    if (leverage > maxL) {
      setLeverage(maxL);
    }
  }, [selectedSymbol]);

  const isLong = tradeSetup.direction === "LONG";
  const entry = tradeSetup.entry || currentQuote?.price || 100000;
  const sl = tradeSetup.stopLoss || (isLong ? entry * 0.98 : entry * 1.02);

  // Delta Exchange Contract Metrics
  const isCrypto = selectedSymbol.includes("USDT");
  const isCommodity = ["XAUUSD", "XAGUSD", "USOIL"].includes(selectedSymbol);
  const mmr = isCrypto ? 0.005 : (selectedSymbol === "USOIL" ? 0.025 : 0.01); // Maintenance Margin Rate

  const stopDistPoints = Math.abs(entry - sl);
  const stopDistPct = Math.round((stopDistPoints / (entry || 1)) * 10000) / 100;

  const riskAmount = Math.max(10, Math.round(balance * (tradeSetup.riskPct / 100)));

  // Position sizing in contracts / units
  let units = 0.01;
  if (stopDistPoints > 0) {
    if (selectedSymbol === "BTCUSDT" || selectedSymbol === "ETHUSDT") {
      units = Math.max(0.001, Math.round((riskAmount / stopDistPoints) * 1000) / 1000);
    } else if (isCommodity) {
      units = Math.max(0.1, Math.round((riskAmount / stopDistPoints) * 10) / 10);
    } else {
      units = Math.max(0.01, Math.round((riskAmount / stopDistPoints) * 100) / 100);
    }
  }

  const notionalValue = Math.round(units * entry * 100) / 100;
  const initialMargin = Math.round((notionalValue / leverage) * 100) / 100;

  // Delta Exchange Liquidation Price Formula
  let liquidationPrice = 0;
  if (isLong) {
    liquidationPrice = Math.round(entry * (1.0 - (1.0 / leverage) + mmr) * 100) / 100;
  } else {
    liquidationPrice = Math.round(entry * (1.0 + (1.0 / leverage) - mmr) * 100) / 100;
  }

  const liqDistancePct = Math.round((Math.abs(liquidationPrice - entry) / entry) * 10000) / 100;

  // Delta Exchange Fees & Taxes
  const estTakerFee = Math.round(notionalValue * 0.0005 * 100) / 100; // 0.05%
  const estMakerFee = Math.round(notionalValue * 0.0002 * 100) / 100; // 0.02%
  const estGst = Math.round(estTakerFee * 0.18 * 100) / 100; // 18% GST on trading fee
  const estTds = isCrypto ? Math.round(notionalValue * 0.01 * 100) / 100 : 0; // 1% Indian Crypto TDS

  // Take Profit calculations
  const tp1Dist = Math.abs(tradeSetup.tp1 - entry);
  const tp2Dist = Math.abs(tradeSetup.tp2 - entry);
  const tp3Dist = Math.abs(tradeSetup.tp3 - entry);
  const tp4Dist = Math.abs(tradeSetup.tp4 - entry);

  const rr1 = Math.round((tp1Dist / (stopDistPoints || 1)) * 10) / 10;
  const rr2 = Math.round((tp2Dist / (stopDistPoints || 1)) * 10) / 10;
  const rr3 = Math.round((tp3Dist / (stopDistPoints || 1)) * 10) / 10;
  const rr4 = Math.round((tp4Dist / (stopDistPoints || 1)) * 10) / 10;

  const tp1Profit = Math.round(riskAmount * rr1 * (tradeSetup.tpAllocations[0] / 100));
  const tp2Profit = Math.round(riskAmount * rr2 * (tradeSetup.tpAllocations[1] / 100));
  const tp3Profit = Math.round(riskAmount * rr3 * (tradeSetup.tpAllocations[2] / 100));
  const tp4Profit = Math.round(riskAmount * rr4 * (tradeSetup.tpAllocations[3] / 100));

  const maxReward = tp1Profit + tp2Profit + tp3Profit + tp4Profit;
  const totalRR = Math.round((maxReward / (riskAmount || 1)) * 10) / 10;

  const handleExecute = async (mode: "PAPER" | "LIVE") => {
    setIsExecuting(true);
    try {
      const orderPayload = {
        symbol: selectedSymbol,
        side: isLong ? "BUY" : "SELL",
        order_type: "MARKET",
        quantity: units,
        price: entry,
        stop_loss: sl,
        tp1: tradeSetup.tp1,
        tp2: tradeSetup.tp2,
        tp3: tradeSetup.tp3,
        tp4: tradeSetup.tp4,
        leverage: leverage,
        margin_mode: marginMode,
        strategy: "Delta Quantitative Planner",
        rr: totalRR,
      };

      await api.createOrder(orderPayload);

      try {
        const port = await api.getPortfolio();
        if (port?.account) {
          updateAccount({
            balance: port.account.balance,
            equity: port.account.equity,
            freeMargin: port.account.free_margin,
            usedMargin: port.account.used_margin,
            todaysPnl: port.account.daily_pnl || port.account.todaysPnl || 0,
            openPositionsCount: port.account.open_positions_count || 1,
          });
        }
      } catch (err) {
        console.error("Failed to sync portfolio:", err);
      }

      setExecutionStatus(`Order Placed on Delta Exchange! ${isLong ? "BUY" : "SELL"} ${units} ${selectedSymbol} @ ${leverage}x [${marginMode}]`);
      setTimeout(() => setExecutionStatus(null), 5000);
    } catch (e: any) {
      console.error(e);
      setExecutionStatus(`Execution Error: ${e.message || "Failed"}`);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isTradePlannerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[410px] bg-[#090d16] border-l border-[#1e2b45] z-50 shadow-2xl flex flex-col text-xs font-sans select-none">
      {/* Header - Slim Compact */}
      <div className="h-11 border-b border-[#1e2b45] px-3 flex items-center justify-between bg-[#0e1526]/95 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white tracking-tight">
                Quantitative Trade Planner
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-num font-bold tracking-wider uppercase bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                Delta {maxLeverage}x
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsTradePlannerOpen(false)}
          className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body - Compact Scrollable Spacing */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5">
        {/* Status Notification */}
        {executionStatus && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-2 rounded-lg flex items-center gap-1.5 text-[11px] font-bold shadow-md animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="leading-tight">{executionStatus}</span>
          </div>
        )}

        {/* Contract & Price Bar */}
        <div className="p-2 bg-[#0e1628] border border-[#1e2b45] rounded-lg flex items-center justify-between font-mono-num tabular-nums">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">
                {selectedSymbol} &bull; {isCrypto ? "Perpetual Futures" : "Commodity Futures"}
              </span>
              <span className="text-[9.5px] text-slate-400 font-sans">
                Delta Exchange &bull; Tier Cap: <strong className="text-cyan-400">{maxLeverage}x</strong>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9.5px] text-slate-400 block font-sans">Market Price</span>
            <span className="text-xs font-black text-cyan-300">
              ${currentQuote?.price?.toLocaleString() || entry.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Direction Selector: LONG vs SHORT */}
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[#060a12] border border-[#1e2b45] rounded-lg">
          <button
            onClick={() => setTradeDirection("LONG")}
            className={`py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              isLong
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>LONG (BUY)</span>
          </button>
          <button
            onClick={() => setTradeDirection("SHORT")}
            className={`py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              !isLong
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>SHORT (SELL)</span>
          </button>
        </div>

        {/* Delta Leverage & Margin Mode Controls */}
        <div className="bg-[#0e1628] border border-[#1e2b45] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#1e2b45] pb-1.5">
            <span className="text-[9.5px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Delta Leverage & Margin Mode
            </span>
            <div className="flex items-center gap-1 bg-[#060a12] p-0.5 rounded border border-[#1e2b45]">
              <button
                onClick={() => setMarginMode("ISOLATED")}
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${
                  marginMode === "ISOLATED"
                    ? "bg-cyan-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ISOLATED
              </button>
              <button
                onClick={() => setMarginMode("CROSS")}
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${
                  marginMode === "CROSS"
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                CROSS
              </button>
            </div>
          </div>

          {/* Quick Leverage Selector Pills */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[9.5px]">
              <span className="text-slate-400 font-sans">Active Leverage Tier:</span>
              <span className="font-extrabold text-cyan-300 font-mono-num tabular-nums">{leverage}x</span>
            </div>
            <div className="grid grid-cols-6 gap-1 font-mono-num tabular-nums">
              {[5, 10, 20, 25, 50, 100].map((lev) => {
                const disabled = lev > maxLeverage;
                const active = leverage === lev;
                return (
                  <button
                    key={lev}
                    disabled={disabled}
                    onClick={() => setLeverage(lev)}
                    className={`py-1 rounded text-[10.5px] font-extrabold border transition-all ${
                      disabled
                        ? "bg-[#080c14]/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-40"
                        : active
                        ? "bg-cyan-600 text-white border-cyan-400 shadow-sm"
                        : "bg-[#060a12] border-[#1e2b45] text-slate-300 hover:border-cyan-500/50 hover:text-white"
                    }`}
                  >
                    {lev}x
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Balance & Risk Sizing */}
        <div className="bg-[#0e1628] border border-[#1e2b45] rounded-lg p-2.5 space-y-2 font-mono-num tabular-nums">
          <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block border-b border-[#1e2b45] pb-1 font-sans">
            Account Balance & Risk Sizing
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5 font-sans">Account Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#060a12] border border-[#1e2b45] rounded px-2 py-1 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5 font-sans">Risk % Per Trade</label>
              <div className="flex items-center space-x-1">
                {[0.5, 1.0, 2.0, 3.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRiskPct(pct)}
                    className={`flex-1 py-1 rounded text-[9.5px] font-bold border transition-colors ${
                      tradeSetup.riskPct === pct
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-[#060a12] text-slate-400 border-[#1e2b45] hover:text-white"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5 font-sans">Risk Budget ($)</label>
              <div className="px-2 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 font-bold text-xs">
                ${riskAmount.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5 font-sans">Stop Distance</label>
              <div className="px-2 py-1 bg-[#060a12] border border-[#1e2b45] rounded text-cyan-300 font-bold text-xs">
                {stopDistPoints.toFixed(2)} pts ({stopDistPct}%)
              </div>
            </div>
          </div>
        </div>

        {/* Protection Levels & Take Profit Targets */}
        <div className="bg-[#0e1628] border border-[#1e2b45] rounded-lg p-2.5 space-y-2 font-mono-num tabular-nums">
          <div className="flex items-center justify-between border-b border-[#1e2b45] pb-1">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider font-sans">
              Price Targets & Protection
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => currentQuote?.price && initTradeSetupForPrice(currentQuote.price, selectedSymbol)}
                className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#121b2f] hover:bg-[#18233d] text-cyan-300 border border-cyan-700/50 transition-all font-sans"
              >
                Sync Market
              </button>
              {activePosition && (
                <button
                  type="button"
                  onClick={() => {
                    setTradeLevel("entry", activePosition.entry_price);
                    setTradeLevel("stopLoss", activePosition.stop_loss);
                    if (activePosition.tp1) setTradeLevel("tp1", activePosition.tp1);
                    if (activePosition.tp2) setTradeLevel("tp2", activePosition.tp2);
                    if (activePosition.tp3) setTradeLevel("tp3", activePosition.tp3);
                    if (activePosition.tp4) setTradeLevel("tp4", activePosition.tp4);
                  }}
                  className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition-all font-sans"
                >
                  Sync Position
                </button>
              )}
            </div>
          </div>

          {/* Entry & SL in 2 Columns */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9.5px] text-slate-300 font-semibold block mb-0.5 font-sans">Entry Price</span>
              <input
                type="number"
                step="any"
                value={entry}
                onChange={(e) => setTradeLevel("entry", parseFloat(e.target.value) || 0)}
                className="w-full bg-[#060a12] border border-cyan-500/40 rounded px-2 py-1 text-cyan-200 font-bold text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <span className="text-[9.5px] text-rose-400 font-semibold block mb-0.5 font-sans flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Stop Loss ({stopDistPct}%)
              </span>
              <input
                type="number"
                step="any"
                value={sl}
                onChange={(e) => setTradeLevel("stopLoss", parseFloat(e.target.value) || 0)}
                className="w-full bg-rose-950/20 border border-rose-500/40 rounded px-2 py-1 text-rose-300 font-bold text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Multi-Tier Take Profits (TP1 to TP4) */}
          <div className="space-y-1.5 pt-1">
            {[
              { id: "tp1", label: "TP1", val: tradeSetup.tp1, rr: rr1, profit: tp1Profit, idx: 0 },
              { id: "tp2", label: "TP2", val: tradeSetup.tp2, rr: rr2, profit: tp2Profit, idx: 1 },
              { id: "tp3", label: "TP3", val: tradeSetup.tp3, rr: rr3, profit: tp3Profit, idx: 2 },
              { id: "tp4", label: "TP4", val: tradeSetup.tp4, rr: rr4, profit: tp4Profit, idx: 3 },
            ].map((tp) => (
              <div key={tp.id} className="bg-[#060a12] p-1.5 rounded border border-[#1e2b45]">
                <div className="flex justify-between text-[9.5px] mb-1 text-emerald-400">
                  <span className="font-semibold flex items-center gap-1">
                    <Target className="w-2.5 h-2.5" /> {tp.label} ({tradeSetup.tpAllocations[tp.idx]}% Exit)
                  </span>
                  <span>
                    {tp.rr}R &bull; +${tp.profit.toLocaleString()}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <input
                    type="number"
                    step="any"
                    value={tp.val}
                    onChange={(e) => setTradeLevel(tp.id as any, parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-[#0b1120] border border-emerald-500/40 rounded px-2 py-0.5 text-emerald-300 font-bold text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    value={tradeSetup.tpAllocations[tp.idx]}
                    onChange={(e) => setTpAllocation(tp.idx, parseFloat(e.target.value) || 0)}
                    className="w-12 bg-[#0b1120] border border-[#1e2b45] rounded px-1 py-0.5 text-slate-300 text-center text-xs"
                    title="Exit allocation percentage"
                  />
                  <span className="text-slate-500 self-center text-[10px]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delta Exchange Calculated Risk & Tax Breakdown Card */}
        <div className="bg-[#060a12] border border-[#1e2b45] rounded-lg p-2.5 space-y-1.5 text-[10.5px] font-mono-num tabular-nums">
          <div className="flex items-center justify-between border-b border-[#1e2b45] pb-1">
            <span className="text-[9.5px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Delta Risk, Margin & Tax Audit
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {marginMode} {leverage}x
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Order Size:</span>
            <span className="text-white font-bold">{units} Contracts</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Notional Contract Value:</span>
            <span className="text-slate-200 font-bold">${notionalValue.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Initial Margin Required:</span>
            <span className="text-cyan-300 font-extrabold">${initialMargin.toLocaleString()}</span>
          </div>

          {/* Delta Liquidation Buffer */}
          <div className="flex justify-between items-center bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[9.5px] font-sans">
              <AlertTriangle className="w-3 h-3" /> Delta Liquidation:
            </span>
            <div className="text-right">
              <span className="text-amber-300 font-bold">${liquidationPrice.toLocaleString()}</span>
              <span className="text-[9px] text-amber-400/80 block">({liqDistancePct}% Buffer)</span>
            </div>
          </div>

          {/* Fee & Tax Breakdown Strip */}
          <div className="bg-[#0a0f1d] p-1.5 rounded border border-[#1e2b45] space-y-1 text-[9.5px]">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Brokerage Fees:</span>
              <span>Taker: ${estTakerFee} (0.05%) &bull; Maker: ${estMakerFee} (0.02%)</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span className="font-sans">Taxes (India/Global):</span>
              <span>18% GST: ${estGst} &bull; 1% TDS: ${estTds}</span>
            </div>
          </div>

          <div className="flex justify-between border-t border-[#1e2b45] pt-1">
            <span className="text-slate-400 font-sans">Max Potential Reward:</span>
            <span className="text-emerald-400 font-extrabold">+${maxReward.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Overall Risk/Reward:</span>
            <span className="text-indigo-400 font-extrabold">1 : {totalRR}</span>
          </div>
        </div>

        {/* Visual Trade Plan Preview Card */}
        <div className="pt-0.5">
          <TradePlanCard
            symbol={selectedSymbol}
            direction={tradeSetup.direction}
            entry={entry}
            stopLoss={sl}
            tp1={tradeSetup.tp1}
            tp2={tradeSetup.tp2}
            tp3={tradeSetup.tp3}
            tp4={tradeSetup.tp4}
            riskAmount={riskAmount}
            maxReward={maxReward}
            riskReward={`1 : ${totalRR}`}
            confidence={81.5}
            strategyName="Delta Momentum Breakout"
            timeframe="1H"
          />
        </div>
      </div>

      {/* Footer Execution Actions */}
      <div className="p-2.5 border-t border-[#1e2b45] bg-[#0e1628] grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={() => handleExecute("PAPER")}
          disabled={isExecuting}
          className="py-2 bg-[#121b2f] hover:bg-[#18233d] disabled:opacity-50 text-cyan-300 font-bold rounded-lg transition-all border border-cyan-500/30 flex items-center justify-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Paper Sizing</span>
        </button>

        <button
          onClick={() => handleExecute("LIVE")}
          disabled={isExecuting}
          className="py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Delta Live Trade</span>
        </button>
      </div>
    </div>
  );
};
