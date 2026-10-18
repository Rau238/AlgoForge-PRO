"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAlgoForgeStore } from "@/lib/store";
import { api } from "@/lib/api";
import { TradePlanCard } from "@/components/trade/TradePlanCard";
import {
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  DollarSign,
  Percent,
  CheckCircle2,
  Radio,
  CandlestickChart,
  Zap,
  Building2,
  AlertTriangle,
  Receipt,
  Scale,
} from "lucide-react";

export default function TradePlannerPage() {
  const {
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
  } = useAlgoForgeStore();

  const [balance, setBalance] = useState(account.balance);
  const [marginMode, setMarginMode] = useState<"ISOLATED" | "CROSS">("ISOLATED");

  const getMaxLeverage = (sym: string): number => {
    if (sym === "BTCUSDT" || sym === "ETHUSDT") return 100;
    if (sym === "USOIL") return 20;
    return 50;
  };

  const maxLev = getMaxLeverage(selectedSymbol);
  const [leverage, setLeverage] = useState(selectedSymbol.includes("USDT") ? 25 : 20);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (leverage > maxLev) setLeverage(maxLev);
  }, [selectedSymbol, maxLev, leverage]);

  const currentQuote = liveQuotes[selectedSymbol];
  const isLong = tradeSetup.direction === "LONG";
  const entry = tradeSetup.entry || currentQuote?.price || 100000;
  const sl = tradeSetup.stopLoss || (isLong ? entry * 0.98 : entry * 1.02);

  const isCrypto = selectedSymbol.includes("USDT");
  const isCommodity = ["XAUUSD", "XAGUSD", "USOIL"].includes(selectedSymbol);
  const mmr = isCrypto ? 0.005 : (selectedSymbol === "USOIL" ? 0.025 : 0.01);

  const pipSize = selectedSymbol.includes("USDT") ? 0.1 : (selectedSymbol.includes("XAG") ? 0.001 : 0.01);
  const stopDistPoints = Math.abs(entry - sl);
  const stopDistPips = Math.round((stopDistPoints / pipSize) * 10) / 10;
  const stopDistPct = Math.round((stopDistPoints / (entry || 1)) * 10000) / 100;

  const riskAmount = Math.max(10, Math.round(balance * (tradeSetup.riskPct / 100) * 100) / 100);

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
  const marginRequired = Math.round((notionalValue / leverage) * 100) / 100;

  // Delta Liquidation Price
  let liquidationPrice = 0;
  if (isLong) {
    liquidationPrice = Math.round(entry * (1.0 - (1.0 / leverage) + mmr) * 100) / 100;
  } else {
    liquidationPrice = Math.round(entry * (1.0 + (1.0 / leverage) - mmr) * 100) / 100;
  }
  const liqDistancePct = Math.round((Math.abs(liquidationPrice - entry) / entry) * 10000) / 100;

  // Delta Fees & Taxes
  const estTakerFee = Math.round(notionalValue * 0.0005 * 100) / 100;
  const estMakerFee = Math.round(notionalValue * 0.0002 * 100) / 100;
  const estGst = Math.round(estTakerFee * 0.18 * 100) / 100;
  const estTds = isCrypto ? Math.round(notionalValue * 0.01 * 100) / 100 : 0;

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
    try {
      await api.createOrder({
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
      });

      try {
        const port = await api.getPortfolio();
        if (port?.account) updateAccount(port.account);
      } catch (err) {
        console.error(err);
      }

      setExecutionStatus(`Order Sent to ${mode} Execution on Delta Exchange: ${units} ${selectedSymbol} @ ${leverage}x!`);
      setTimeout(() => setExecutionStatus(null), 4500);
    } catch (e: any) {
      console.error(e);
      setExecutionStatus(`Execution Error: ${e.message || "Failed"}`);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2b45] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Quantitative Trade Planner & Sizing Desk
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono-num font-bold tracking-wider uppercase bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
              Delta Exchange {maxLev}x
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            Institutional leverage sizing, 4-tier target scaling, and Delta Exchange fee/tax risk calculations
          </p>
        </div>

        <Link
          href={`/chart/${selectedSymbol}`}
          className="px-3 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <CandlestickChart className="w-3.5 h-3.5 text-cyan-400" />
          <span>Open Chart Desk</span>
        </Link>
      </div>

      {executionStatus && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3.5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{executionStatus}</span>
        </div>
      )}

      {/* Grid: Inputs (2 Cols) & Visual Card Preview (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Inputs (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Symbol & Direction Picker */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-3 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <span className="text-[9.5px] text-slate-400 font-bold uppercase block mb-1">
                Select Instrument (Delta Perpetual & Commodity)
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XAUUSD", "XAGUSD", "USOIL"].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono-num font-bold border transition-colors ${
                      selectedSymbol === sym
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-[#080c14] text-slate-400 border-[#1e2b45] hover:text-white"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9.5px] text-slate-400 font-bold uppercase block mb-1">
                Trade Direction
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setTradeDirection("LONG")}
                  className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 border transition-all ${
                    isLong
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-[#080c14] text-slate-400 border-[#1e2b45] hover:text-white"
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> LONG
                </button>
                <button
                  onClick={() => setTradeDirection("SHORT")}
                  className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 border transition-all ${
                    !isLong
                      ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                      : "bg-[#080c14] text-slate-400 border-[#1e2b45] hover:text-white"
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Capital & Leverage Settings */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-3 rounded-xl space-y-2.5 font-mono-num tabular-nums">
            <div className="flex items-center justify-between border-b border-[#1e2b45] pb-1.5">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-wider font-sans">
                1. Capital, Leverage & Margin Mode
              </h3>
              <div className="flex items-center gap-1 bg-[#080c14] p-0.5 rounded border border-[#1e2b45]">
                <button
                  onClick={() => setMarginMode("ISOLATED")}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${
                    marginMode === "ISOLATED" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ISOLATED
                </button>
                <button
                  onClick={() => setMarginMode("CROSS")}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${
                    marginMode === "CROSS" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  CROSS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-0.5 font-sans text-[10px]">Account Balance ($)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-2.5 py-1 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 font-sans text-[10px]">Risk %</label>
                <div className="flex items-center space-x-1">
                  {[0.5, 1.0, 2.0, 3.0].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setRiskPct(pct)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                        tradeSetup.riskPct === pct
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-[#080c14] text-slate-400 border-[#1e2b45] hover:text-white"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 font-sans text-[10px]">
                  Delta Leverage ({maxLev}x Max)
                </label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full bg-[#080c14] border border-cyan-800/40 rounded px-2.5 py-1 text-cyan-300 font-bold"
                >
                  {[5, 10, 20, 25, 50, 100].map((lev) => (
                    <option key={lev} value={lev} disabled={lev > maxLev}>
                      {lev}x {lev > maxLev ? "(Exceeds)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 font-sans text-[10px]">Risk Budget ($)</label>
                <div className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 font-bold text-xs">
                  ${riskAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Precise Price Levels & Multi-Target Take Profits */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-3 rounded-xl space-y-2.5 font-mono-num tabular-nums">
            <div className="flex items-center justify-between border-b border-[#1e2b45] pb-1.5">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-wider font-sans">
                2. Price Levels & 4-Tier Target Scaling
              </h3>
              <button
                type="button"
                onClick={() => currentQuote?.price && initTradeSetupForPrice(currentQuote.price, selectedSymbol)}
                className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#121b2f] text-cyan-300 border border-cyan-700/50 hover:bg-[#18233d] transition-all font-sans"
              >
                Sync Market Price
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-slate-300 font-semibold block mb-0.5 font-sans text-[10px]">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={entry}
                  onChange={(e) => setTradeLevel("entry", parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080c14] border border-cyan-500/40 rounded px-2.5 py-1 text-cyan-200 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-rose-400 font-semibold block mb-0.5 font-sans text-[10px] flex items-center justify-between">
                  <span>Stop Loss</span>
                  <span className="text-[9.5px] text-slate-400">{stopDistPoints.toFixed(2)} pts ({stopDistPct}%)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={sl}
                  onChange={(e) => setTradeLevel("stopLoss", parseFloat(e.target.value) || 0)}
                  className="w-full bg-rose-950/20 border border-rose-500/40 rounded px-2.5 py-1 text-rose-300 font-bold text-xs"
                />
              </div>
            </div>

            {/* 4 Take Profit Tiers */}
            <div className="space-y-1.5 pt-1">
              {[
                { id: "tp1", label: "Take Profit 1", val: tradeSetup.tp1, rr: rr1, profit: tp1Profit, idx: 0 },
                { id: "tp2", label: "Take Profit 2", val: tradeSetup.tp2, rr: rr2, profit: tp2Profit, idx: 1 },
                { id: "tp3", label: "Take Profit 3", val: tradeSetup.tp3, rr: rr3, profit: tp3Profit, idx: 2 },
                { id: "tp4", label: "Take Profit 4", val: tradeSetup.tp4, rr: rr4, profit: tp4Profit, idx: 3 },
              ].map((tp) => (
                <div key={tp.id} className="grid grid-cols-12 gap-2 items-center text-xs bg-[#080c14] p-1.5 rounded border border-[#1e2b45]">
                  <div className="col-span-4 text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                    <Target className="w-3 h-3" />
                    <span>{tp.label}</span>
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      step="any"
                      value={tp.val}
                      onChange={(e) => setTradeLevel(tp.id as any, parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0d1322] border border-emerald-500/40 rounded px-2 py-0.5 text-emerald-300 font-bold text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={tradeSetup.tpAllocations[tp.idx]}
                        onChange={(e) => setTpAllocation(tp.idx, parseFloat(e.target.value) || 0)}
                        className="w-12 bg-[#0d1322] border border-[#1e2b45] rounded px-1 py-0.5 text-center text-white font-bold text-xs"
                      />
                      <span className="text-slate-500 text-[10px]">%</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-bold text-emerald-400 text-xs">
                    +{tp.rr}R (+${tp.profit})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delta Exchange Fee & Liquidation Card */}
          <div className="bg-[#060a12] border border-[#1e2b45] p-3 rounded-xl font-mono-num tabular-nums space-y-1.5 text-xs">
            <div className="flex justify-between items-center border-b border-[#1e2b45] pb-1 text-[10px]">
              <span className="text-cyan-400 font-bold uppercase tracking-wider font-sans">
                Delta Exchange Execution Audit
              </span>
              <span className="text-slate-400">Order: {units} Contracts &bull; Margin ${marginRequired}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
              <div className="bg-[#0b101c] p-1.5 rounded border border-[#1e2b45]">
                <span className="text-[9px] text-slate-500 block font-sans">Notional Value:</span>
                <span className="text-white font-bold">${notionalValue.toLocaleString()}</span>
              </div>
              <div className="bg-[#0b101c] p-1.5 rounded border border-[#1e2b45]">
                <span className="text-[9px] text-slate-500 block font-sans">Initial Margin:</span>
                <span className="text-cyan-300 font-bold">${marginRequired}</span>
              </div>
              <div className="bg-[#0b101c] p-1.5 rounded border border-[#1e2b45]">
                <span className="text-[9px] text-slate-500 block font-sans">Delta Liquidation:</span>
                <span className="text-amber-400 font-bold">${liquidationPrice} ({liqDistancePct}%)</span>
              </div>
              <div className="bg-[#0b101c] p-1.5 rounded border border-[#1e2b45]">
                <span className="text-[9px] text-slate-500 block font-sans">Fees & 18% GST:</span>
                <span className="text-slate-300 font-bold">${estTakerFee} + ${estGst} GST</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 text-[10.5px] font-sans">
                Max Reward: <strong className="text-emerald-400">+${maxReward.toLocaleString()}</strong> &bull; R:R: <strong className="text-indigo-400">1 : {totalRR}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExecute("PAPER")}
                  className="px-3.5 py-1.5 bg-[#121b2f] hover:bg-[#1a2744] text-cyan-300 border border-cyan-500/30 font-bold rounded-lg transition-all text-xs flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Paper Execution</span>
                </button>
                <button
                  onClick={() => handleExecute("LIVE")}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Delta Live Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Card (1 Col) */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
            Institutional Trade Plan Card Preview
          </span>
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
            confidence={78.4}
            strategyName="Delta Quantitative Execution"
            timeframe="1H"
          />
        </div>
      </div>
    </div>
  );
}
