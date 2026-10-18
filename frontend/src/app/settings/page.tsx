"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Percent,
  SlidersHorizontal,
  Bell,
  Save,
  CheckCircle2,
  Lock,
  User,
  Radio,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Risk parameters
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState(1.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState(3.0);
  const [defaultLeverage, setDefaultLeverage] = useState(100);
  const [breakevenOnTP1, setBreakevenOnTP1] = useState(true);
  const [trailingOnTP2, setTrailingOnTP2] = useState(true);
  const [trailingType, setTrailingType] = useState("ATR");
  const [trailingValue, setTrailingValue] = useState(1.5);
  const [tpAllocs, setTpAllocs] = useState([25, 25, 25, 25]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSettings();
        setSettings(data);
        if (data?.risk) {
          setMaxRiskPerTrade(data.risk.max_risk_per_trade_pct || 1.0);
          setMaxDailyLoss(data.risk.max_daily_loss_pct || 3.0);
          setDefaultLeverage(data.risk.default_leverage || 100);
          setBreakevenOnTP1(data.risk.breakeven_on_tp1 ?? true);
          setTrailingOnTP2(data.risk.trailing_on_tp2 ?? true);
          setTrailingType(data.risk.trailing_type || "ATR");
          setTrailingValue(data.risk.trailing_value || 1.5);
          setTpAllocs(data.risk.default_tp_allocation || [25, 25, 25, 25]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateRiskSettings({
        max_risk_per_trade_pct: maxRiskPerTrade,
        max_daily_loss_pct: maxDailyLoss,
        default_leverage: defaultLeverage,
        default_tp_allocation: tpAllocs,
        breakeven_on_tp1: breakevenOnTP1,
        trailing_on_tp2: trailingOnTP2,
        trailing_type: trailingType,
        trailing_value: trailingValue,
        email_notifications: true,
        in_app_notifications: true,
      });
      setSaveMsg("Risk settings and execution parameters saved successfully!");
      setTimeout(() => setSaveMsg(null), 4000);
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
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            Settings & Risk Governance
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Mandatory risk limits, trailing rules & notifications
          </p>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-3.5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{saveMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Risk Governance (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#0d1322] border border-[#1e2b45] p-3.5 sm:p-4 rounded-xl shadow-lg space-y-3">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1e2b45] pb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Capital Risk Controls & Drawdown Circuit Breakers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 font-semibold block mb-1">
                  Maximum Risk Per Trade (%)
                </label>
                <div className="flex items-center space-x-1">
                  {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMaxRiskPerTrade(pct)}
                      className={`px-3 py-1.5 rounded font-bold border transition-colors ${
                        maxRiskPerTrade === pct
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-[#080c14] text-gray-400 border-[#1e2b45]"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">
                  Maximum Daily Loss Limit (%)
                </label>
                <div className="flex items-center space-x-1">
                  {[2.0, 3.0, 5.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMaxDailyLoss(pct)}
                      className={`px-3 py-1.5 rounded font-bold border transition-colors ${
                        maxDailyLoss === pct
                          ? "bg-rose-600 text-white border-rose-500"
                          : "bg-[#080c14] text-gray-400 border-[#1e2b45]"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Default Leverage</label>
                <select
                  value={defaultLeverage}
                  onChange={(e) => setDefaultLeverage(parseInt(e.target.value))}
                  className="w-full bg-[#080c14] border border-[#1e2b45] rounded px-3 py-2 text-white font-bold"
                >
                  <option value={10}>10x Leverage (Energy/Crude Standard)</option>
                  <option value={20}>20x Leverage (Gold & Metals Standard)</option>
                  <option value={25}>25x Leverage (Crypto Derivatives Standard)</option>
                  <option value={50}>50x Leverage (High Volatility Scalp)</option>
                  <option value={100}>100x Leverage (Delta Exchange Max)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Trailing Stop Model</label>
                <div className="flex space-x-2">
                  <select
                    value={trailingType}
                    onChange={(e) => setTrailingType(e.target.value)}
                    className="w-28 bg-[#080c14] border border-[#1e2b45] rounded px-2 py-2 text-white font-bold"
                  >
                    <option value="ATR">ATR Dynamic</option>
                    <option value="PERCENT">Percentage %</option>
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    value={trailingValue}
                    onChange={(e) => setTrailingValue(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-[#080c14] border border-[#1e2b45] rounded px-2 py-2 text-white font-bold text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trade Automation Rules */}
          <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e2b45] pb-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Automated Level Management & Multi-Take Profit Rules
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-[#080c14]">
                <input
                  type="checkbox"
                  checked={breakevenOnTP1}
                  onChange={(e) => setBreakevenOnTP1(e.target.checked)}
                  className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-200 font-semibold">
                  Move Stop Loss to Breakeven immediately when TP1 is hit
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-[#080c14]">
                <input
                  type="checkbox"
                  checked={trailingOnTP2}
                  onChange={(e) => setTrailingOnTP2(e.target.checked)}
                  className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600 focus:ring-0"
                />
                <span className="text-gray-200 font-semibold">
                  Activate Dynamic Trailing Stop after TP2 target is reached
                </span>
              </label>

              {/* Default TP Allocations */}
              <div className="pt-2 border-t border-[#1e2b45]">
                <label className="text-gray-400 block mb-2 font-bold uppercase text-[10px]">
                  Default Multi-Take Profit Allocations (Must Sum to 100%)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {tpAllocs.map((alloc, idx) => (
                    <div key={idx} className="bg-[#080c14] p-2 rounded border border-[#1e2b45] text-center">
                      <span className="text-[10px] text-gray-500 block font-bold">TP{idx + 1} Target</span>
                      <input
                        type="number"
                        value={alloc}
                        onChange={(e) => {
                          const updated = [...tpAllocs];
                          updated[idx] = parseFloat(e.target.value) || 0;
                          setTpAllocs(updated);
                        }}
                        className="w-16 bg-[#121b2f] text-white font-bold text-center rounded py-1 mt-1 text-xs border border-[#1e2b45]"
                      />
                      <span className="text-gray-400 text-[10px] ml-1">%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save All Risk Governance Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile & Notifications (1 Col) */}
        <div className="space-y-4">
          <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e2b45] pb-2">
              <User className="w-4 h-4 text-indigo-400" />
              Trader Profile & Auth
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">Username</span>
                <span className="text-white font-bold">{settings?.account?.username || "TraderAlgo"}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">Registered Email</span>
                <span className="text-gray-300 font-semibold">{settings?.account?.email || "trader@algoforge.io"}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">Account Tier</span>
                <span className="text-indigo-400 font-bold">Institutional Quantitative</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e2b45] pb-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Alert Notification Pipelines
            </h3>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">In-App Sound & Banners</span>
                <input type="checkbox" defaultChecked className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Browser Native Notifications</span>
                <input type="checkbox" defaultChecked className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Strategy Signal Webhooks</span>
                <input type="checkbox" className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600" />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
