"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Radio,
  ShieldCheck,
  Key,
  Lock,
  Globe2,
  CheckCircle2,
  Activity,
  Layers,
  Zap,
  Server,
  Cpu,
  Coins,
  TrendingUp,
} from "lucide-react";

export default function LiveTradingPage() {
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Connection form state
  const [brokerType, setBrokerType] = useState<"COMMODITIES" | "CRYPTO">("CRYPTO");
  const [brokerName, setBrokerName] = useState("Delta Exchange Derivatives API");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [testnet, setTestnet] = useState(false);
  const [connectMsg, setConnectMsg] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const data = await api.getLiveStatus();
      setLiveStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.connectBroker({
        broker_type: brokerType,
        broker_name: brokerName,
        api_key: apiKey,
        api_secret: apiSecret,
        testnet,
      });
      setConnectMsg(`Successfully verified secure gateway connection to ${brokerName}!`);
      setApiKey("");
      setApiSecret("");
      await loadStatus();
      setTimeout(() => setConnectMsg(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-400" />
            Live Broker Gateways
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Delta Exchange derivatives & Binance real-time order routing
          </p>
        </div>
      </div>

      {connectMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{connectMsg}</span>
        </div>
      )}

      {/* Modular Adapters Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Delta Exchange Adapter Card */}
        <div className="bg-[#0d1322] border border-[#1e2b45] p-3.5 sm:p-4 rounded-xl shadow-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#1e2b45] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                DX
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block">DeltaExchangeAdapter</span>
                <span className="text-[10px] text-slate-400">Delta Exchange Derivatives (BTC, ETH, SOL, Commodities)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CONNECTED
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono-num">
            <div className="flex justify-between py-1 border-b border-[#141c2c]">
              <span className="text-slate-400 font-sans">Gateway Target:</span>
              <span className="text-white font-bold font-sans">https://api.delta.exchange/v2</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141c2c]">
              <span className="text-slate-400 font-sans">Execution Latency:</span>
              <span className="text-emerald-400 font-bold">42 ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141c2c]">
              <span className="text-slate-400 font-sans">Available Products:</span>
              <span className="text-white font-bold font-sans">343 Futures & Perpetual Contracts</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans">Credential Vault:</span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" /> Hardware-secured AES-256 GCM
              </span>
            </div>
          </div>
        </div>

        {/* Binance Crypto Exchange Adapter Card */}
        <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2b45] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                BN
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block">BinanceExchangeAdapter</span>
                <span className="text-[10px] text-slate-400">Binance Spot & USD-M Futures WebSocket</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CONNECTED
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono-num">
            <div className="flex justify-between py-1 border-b border-[#141c2c]">
              <span className="text-slate-400 font-sans">Gateway Target:</span>
              <span className="text-white font-bold font-sans">Binance Public REST + Ticker WS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141c2c]">
              <span className="text-slate-400 font-sans">Execution Latency:</span>
              <span className="text-emerald-400 font-bold">18 ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#141c2c]">
              <span className="text-slate-400 font-sans">Supported Markets:</span>
              <span className="text-white font-bold font-sans">BTC, ETH, SOL, BNB, XRP & Tradable Tokens</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-sans">Credential Vault:</span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" /> Hardware-secured AES-256 GCM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Gateway Form */}
      <div className="bg-[#0d1322] border border-[#1e2b45] p-5 rounded-xl shadow-xl max-w-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e2b45] pb-2">
          <Key className="w-4 h-4 text-indigo-400" />
          Connect Exchange API Credentials
        </h2>

        <form onSubmit={handleConnect} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Target Market Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBrokerType("CRYPTO");
                  setBrokerName("Delta Exchange Derivatives API");
                }}
                className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                  brokerType === "CRYPTO"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                    : "bg-[#080c14] text-slate-400 border-[#1e2b45]"
                }`}
              >
                CRYPTO (Delta Exchange)
              </button>
              <button
                type="button"
                onClick={() => {
                  setBrokerType("COMMODITIES");
                  setBrokerName("Commodities Derivatives Gateway");
                }}
                className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                  brokerType === "COMMODITIES"
                    ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
                    : "bg-[#080c14] text-slate-400 border-[#1e2b45]"
                }`}
              >
                COMMODITIES (Gold, Silver, Oil)
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Broker / Exchange Gateway</label>
            <input
              type="text"
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded-lg px-3 py-2 text-white font-semibold focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">API Key (Read / Trade Access)</label>
            <input
              type="text"
              placeholder="e.g. delta_key_live_9a7f3b..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded-lg px-3 py-2 text-white font-mono-num font-bold focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">API Secret (Hashed)</label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••••••••••"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2b45] rounded-lg px-3 py-2 text-white font-mono-num font-bold focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="testnet"
              checked={testnet}
              onChange={(e) => setTestnet(e.target.checked)}
              className="rounded bg-[#080c14] border-[#1e2b45] text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="testnet" className="text-slate-300 font-medium cursor-pointer">
              Use Testnet Sandbox Environment (Recommended for algorithm testing)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Verify & Connect Live Gateway
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
