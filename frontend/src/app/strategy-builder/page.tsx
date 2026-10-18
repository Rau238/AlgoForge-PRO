"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Workflow,
  Plus,
  ArrowDown,
  Trash2,
  Play,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Target,
  SlidersHorizontal,
} from "lucide-react";

export default function StrategyBuilderPage() {
  const router = useRouter();
  const [strategyName, setStrategyName] = useState("Alpha Momentum Breakout");
  const [marketType, setMarketType] = useState("CRYPTO");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1H");
  const [logic, setLogic] = useState("AND"); // AND or OR
  const [action, setAction] = useState("BUY");

  // Visual condition blocks sequence
  const [rules, setRules] = useState([
    {
      id: 1,
      indicator_a: "EMA",
      param_a: 20,
      operator: "CROSS_ABOVE",
      target_type: "INDICATOR",
      indicator_b: "EMA",
      param_b: 50,
      value_b: 0,
    },
    {
      id: 2,
      indicator_a: "RSI",
      param_a: 14,
      operator: "GREATER_THAN",
      target_type: "VALUE",
      indicator_b: "VALUE",
      param_b: 0,
      value_b: 55,
    },
  ]);

  // Risk & Take Profit parameters
  const [slType, setSlType] = useState("ATR"); // ATR, PERCENT, FIXED
  const [slValue, setSlValue] = useState(1.5);
  const [tpRRs, setTpRRs] = useState([1.0, 2.0, 3.0, 4.0]);
  const [tpAllocations, setTpAllocations] = useState([25, 25, 25, 25]);
  const [trailingStop, setTrailingStop] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now(),
        indicator_a: "RSI",
        param_a: 14,
        operator: "GREATER_THAN",
        target_type: "VALUE",
        indicator_b: "VALUE",
        param_b: 0,
        value_b: 50,
      },
    ]);
  };

  const removeRule = (id: number) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: number, field: string, val: any) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleSave = async () => {
    try {
      await api.createStrategy({
        name: strategyName,
        market_type: marketType,
        symbol,
        timeframe,
        rules,
        logic,
        action,
        sl_type: slType,
        sl_value: slValue,
        tp_rrs: tpRRs,
        tp_allocations: tpAllocations,
      });
      setStatusMsg("Strategy created successfully! Ready for backtesting.");
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Workflow className="w-4 h-4 text-indigo-400" />
            Strategy Builder
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Chain technical indicators, dynamic ATR rules & take-profit tiers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Strategy</span>
          </button>
          <Link
            href="/backtesting"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Backtest</span>
          </Link>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-3.5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Grid: Visual Workflow Sequence Canvas & Strategy Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Interactive Visual Flow Canvas (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Base Configuration Header */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Strategy Name</label>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Target Market</label>
              <select
                value={marketType}
                onChange={(e) => setMarketType(e.target.value)}
                className="bg-[#080c14] border border-[#1e2b45] rounded px-3 py-1.5 text-white font-bold text-xs"
              >
                <option value="CRYPTO">CRYPTO</option>
                <option value="COMMODITIES">COMMODITIES</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-[#080c14] border border-[#1e2b45] rounded px-3 py-1.5 text-white font-bold text-xs"
              >
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1H">1H</option>
                <option value="4H">4H</option>
                <option value="1D">1D</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Logic Gate</label>
              <div className="flex items-center space-x-1 bg-[#080c14] border border-[#1e2b45] rounded p-0.5">
                <button
                  onClick={() => setLogic("AND")}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    logic === "AND" ? "bg-indigo-600 text-white" : "text-gray-400"
                  }`}
                >
                  AND
                </button>
                <button
                  onClick={() => setLogic("OR")}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    logic === "OR" ? "bg-indigo-600 text-white" : "text-gray-400"
                  }`}
                >
                  OR
                </button>
              </div>
            </div>
          </div>

          {/* Visual Sequence Pipeline */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-6 rounded-xl flex flex-col items-center space-y-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Conditional Indicator Logic Tree
            </span>

            {/* Render Rule Sequence Nodes */}
            {rules.map((rule, idx) => (
              <React.Fragment key={rule.id}>
                <div className="w-full max-w-xl bg-[#080c14] border border-indigo-500/40 hover:border-indigo-500 rounded-xl p-4 shadow-xl flex items-center justify-between gap-3 text-xs transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black flex items-center justify-center border border-indigo-500/30">
                      {idx + 1}
                    </span>
                    <select
                      value={rule.indicator_a}
                      onChange={(e) => updateRule(rule.id, "indicator_a", e.target.value)}
                      className="bg-[#121b2f] border border-[#1e2b45] text-white font-bold rounded px-2 py-1 text-xs"
                    >
                      <option value="EMA">EMA</option>
                      <option value="SMA">SMA</option>
                      <option value="RSI">RSI</option>
                      <option value="VWAP">VWAP</option>
                      <option value="SUPERTREND">Supertrend</option>
                    </select>

                    <input
                      type="number"
                      value={rule.param_a}
                      onChange={(e) => updateRule(rule.id, "param_a", parseInt(e.target.value) || 0)}
                      className="w-14 bg-[#121b2f] border border-[#1e2b45] text-white font-bold rounded px-2 py-1 text-center text-xs"
                    />
                  </div>

                  {/* Operator */}
                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, "operator", e.target.value)}
                    className="bg-indigo-600/20 border border-indigo-500 text-indigo-300 font-extrabold rounded px-2 py-1 text-xs"
                  >
                    <option value="CROSS_ABOVE">CROSSES ABOVE</option>
                    <option value="CROSS_BELOW">CROSSES BELOW</option>
                    <option value="GREATER_THAN">&gt; (GREATER)</option>
                    <option value="LESS_THAN">&lt; (LESS)</option>
                  </select>

                  {/* Target B */}
                  <div className="flex items-center space-x-2">
                    {rule.target_type === "INDICATOR" ? (
                      <>
                        <select
                          value={rule.indicator_b}
                          onChange={(e) => updateRule(rule.id, "indicator_b", e.target.value)}
                          className="bg-[#121b2f] border border-[#1e2b45] text-white font-bold rounded px-2 py-1 text-xs"
                        >
                          <option value="EMA">EMA</option>
                          <option value="SMA">SMA</option>
                          <option value="RSI">RSI</option>
                        </select>
                        <input
                          type="number"
                          value={rule.param_b}
                          onChange={(e) => updateRule(rule.id, "param_b", parseInt(e.target.value) || 0)}
                          className="w-14 bg-[#121b2f] border border-[#1e2b45] text-white font-bold rounded px-2 py-1 text-center text-xs"
                        />
                      </>
                    ) : (
                      <input
                        type="number"
                        value={rule.value_b}
                        onChange={(e) => updateRule(rule.id, "value_b", parseFloat(e.target.value) || 0)}
                        className="w-16 bg-[#121b2f] border border-[#1e2b45] text-white font-bold rounded px-2 py-1 text-center text-xs"
                      />
                    )}

                    <button
                      onClick={() => removeRule(rule.id)}
                      className="p-1 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="flex flex-col items-center">
                  <ArrowDown className="w-4 h-4 text-indigo-400" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase">{logic}</span>
                </div>
              </React.Fragment>
            ))}

            <button
              onClick={addRule}
              className="px-4 py-2 bg-[#121b2f] hover:bg-[#17233c] text-indigo-300 font-bold text-xs rounded-lg border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Condition Node</span>
            </button>

            {/* Connecting Arrow */}
            <div className="flex flex-col items-center">
              <ArrowDown className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase">EXECUTES</span>
            </div>

            {/* Trigger Block (BUY / SELL) */}
            <div className="w-full max-w-xl bg-emerald-950/30 border-2 border-emerald-500 rounded-xl p-4 flex items-center justify-between text-xs shadow-xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-black rounded text-xs">
                  {action} TRIGGER
                </span>
                <span className="text-gray-300 font-semibold">Execute Position Entry</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setAction("BUY")}
                  className={`px-3 py-1 rounded font-bold ${
                    action === "BUY" ? "bg-emerald-600 text-white" : "text-gray-400"
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setAction("SELL")}
                  className={`px-3 py-1 rounded font-bold ${
                    action === "SELL" ? "bg-rose-600 text-white" : "text-gray-400"
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            {/* Connecting Arrow */}
            <ArrowDown className="w-4 h-4 text-rose-400" />

            {/* Stop Loss Node */}
            <div className="w-full max-w-xl bg-rose-950/20 border border-rose-500/50 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Stop Loss Model:
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={slType}
                  onChange={(e) => setSlType(e.target.value)}
                  className="bg-[#080c14] border border-[#1e2b45] text-white rounded px-2 py-1 text-xs font-bold"
                >
                  <option value="ATR">ATR Dynamic</option>
                  <option value="PERCENT">Percentage %</option>
                  <option value="FIXED">Fixed Distance</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={slValue}
                  onChange={(e) => setSlValue(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-[#080c14] border border-[#1e2b45] text-white font-bold rounded px-2 py-1 text-center text-xs"
                />
                <span className="text-gray-400 text-[10px]">{slType === "ATR" ? "x ATR(14)" : "%"}</span>
              </div>
            </div>

            {/* Connecting Arrow */}
            <ArrowDown className="w-4 h-4 text-emerald-400" />

            {/* Multiple Take Profits Node */}
            <div className="w-full max-w-xl bg-emerald-950/20 border border-emerald-500/50 rounded-xl p-3 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Multiple Take Profit Targets (1R &bull; 2R &bull; 3R &bull; 4R)
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                {tpRRs.map((rr, idx) => (
                  <div key={idx} className="bg-[#080c14] p-2 rounded border border-[#1e2b45]">
                    <span className="text-[10px] text-gray-400 block font-bold">TP{idx + 1}</span>
                    <span className="text-xs font-bold text-emerald-400">+{rr}R</span>
                    <span className="text-[10px] text-gray-500 block">({tpAllocations[idx]}% Exit)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Strategy Settings & Deployment (1 Col) */}
        <div className="space-y-4">
          <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#1e2b45] pb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Automated Trade Management Rules
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trailingStop}
                  onChange={(e) => setTrailingStop(e.target.checked)}
                  className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-300 font-semibold">Move Stop Loss to Breakeven after TP1 hit</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-300 font-semibold">Enable Trailing Stop Loss after TP2 hit</span>
              </label>

              <div className="pt-2 border-t border-[#1e2b45] space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Position Sizing Logic</span>
                <div className="p-2.5 bg-[#080c14] rounded border border-[#1e2b45] text-[11px] text-gray-300">
                  Fixed Risk Sizing: Position size is automatically derived such that the distance between Entry and Stop Loss equals exactly 1.0% ($250) of total account equity.
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Compile Strategy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
