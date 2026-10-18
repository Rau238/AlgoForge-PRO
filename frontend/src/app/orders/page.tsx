"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAlgoForgeStore } from "@/lib/store";
import { OrdersSkeleton } from "@/components/common/PageSkeletons";
import {
  FileSpreadsheet,
  PlusCircle,
  XCircle,
  Clock,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";

export default function OrdersPage() {
  const { liveQuotes } = useAlgoForgeStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // New Order Modal State
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("LIMIT");
  const [price, setPrice] = useState(81950);
  const [quantity, setQuantity] = useState(0.004);
  const [sl, setSl] = useState(80800);
  const [tp, setTp] = useState(83200);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // When symbol changes or modal opens, sync price with live quote
  const handleSymbolChange = (newSym: string) => {
    setSymbol(newSym);
    const curPrice = liveQuotes[newSym]?.price || (newSym === "BTCUSDT" ? 81950 : newSym === "ETHUSDT" ? 2435 : newSym === "SOLUSDT" ? 104.35 : newSym === "XAUUSD" ? 4180.35 : 99.02);
    setPrice(curPrice);
    const defaultQty = newSym.includes("BTC") ? 0.004 : newSym.includes("ETH") ? 0.12 : newSym.includes("SOL") ? 1.5 : newSym.includes("XAU") ? 0.06 : 1.2;
    setQuantity(defaultQty);
    if (side === "BUY") {
      setSl(Math.round(curPrice * 0.985 * 100) / 100);
      setTp(Math.round(curPrice * 1.025 * 100) / 100);
    } else {
      setSl(Math.round(curPrice * 1.015 * 100) / 100);
      setTp(Math.round(curPrice * 0.975 * 100) / 100);
    }
  };

  const syncPriceToMarket = () => {
    const curPrice = liveQuotes[symbol]?.price;
    if (curPrice) {
      setPrice(curPrice);
      if (side === "BUY") {
        setSl(Math.round(curPrice * 0.985 * 100) / 100);
        setTp(Math.round(curPrice * 1.025 * 100) / 100);
      } else {
        setSl(Math.round(curPrice * 1.015 * 100) / 100);
        setTp(Math.round(curPrice * 0.975 * 100) / 100);
      }
    }
  };

  const handleCancel = async (id: number) => {
    await api.cancelOrder(id);
    await loadOrders();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createOrder({
      symbol,
      side,
      order_type: orderType,
      quantity,
      price,
      stop_loss: sl,
      take_profit: tp,
      strategy: "Delta Limit Execution",
    });
    setShowNewOrder(false);
    await loadOrders();
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const filledOrders = orders.filter((o) => o.status === "FILLED");
  const totalWorkingValue = pendingOrders.reduce((sum, o) => sum + (o.price || 0) * (o.quantity || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  if (loading && orders.length === 0) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-3.5 max-w-7xl mx-auto w-full overflow-y-auto select-none font-sans bg-[#080c14]">
      {/* Title & Place Order Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            Working Orders
          </h1>
          <p className="text-[10.5px] text-slate-400">
            Active bracket orders & pending algorithmic triggers
          </p>
        </div>

        <button
          onClick={() => {
            setShowNewOrder(true);
            handleSymbolChange(symbol);
          }}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Place New Order</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-num tabular-nums">
        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
            Working (Pending)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-white">{pendingOrders.length}</span>
            <span className="text-[9.5px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-bold font-sans">ACTIVE</span>
          </div>
        </div>

        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
            Working Notional Value
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-indigo-300">
              ${totalWorkingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9.5px] text-slate-400 font-sans">USD</span>
          </div>
        </div>

        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
            Filled Today
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-emerald-400">{filledOrders.length}</span>
            <span className="text-[9.5px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded font-bold font-sans">SETTLED</span>
          </div>
        </div>

        <div className="bg-[#0c1220] border border-[#18263f] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[9.5px] text-slate-400 font-sans uppercase font-semibold block mb-0.5 tracking-wider">
            Total Logged
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-white">{orders.length}</span>
            <span className="text-[9.5px] text-slate-400 font-sans">Orders</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 bg-[#0c1220] border border-[#18263f] p-1 rounded-lg">
          {["ALL", "PENDING", "FILLED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer text-xs font-sans ${
                statusFilter === st ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {st === "PENDING" ? "WORKING" : st}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400 font-mono-num tabular-nums">
          {filteredOrders.length} / {orders.length} orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0c1220] border border-[#18263f] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono-num tabular-nums">
            <thead>
              <tr className="bg-[#0a0f1d] text-slate-400 font-sans font-bold text-[9.5px] uppercase border-b border-[#18263f]">
                <th className="text-left py-2 px-2.5">ID</th>
                <th className="text-left py-2 px-2.5">Symbol</th>
                <th className="text-left py-2 px-2.5">Type</th>
                <th className="text-center py-2 px-2.5">Side</th>
                <th className="text-right py-2 px-2.5">Quantity</th>
                <th className="text-right py-2 px-2.5">Price</th>
                <th className="text-right py-2 px-2.5">Stop Loss</th>
                <th className="text-right py-2 px-2.5">Take Profit</th>
                <th className="text-left py-2 px-2.5">Strategy</th>
                <th className="text-right py-2 px-2.5">Time</th>
                <th className="text-center py-2 px-2.5">Status</th>
                <th className="text-center py-2 px-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141e30]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 font-medium font-sans">
                    No orders matching filter. Place a new order using the button above.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isBuy = o.side === "BUY";
                  return (
                    <tr key={o.id} className="hover:bg-[#121b2f]/60 transition-colors">
                      <td className="text-slate-400 font-mono-num py-2 px-2.5">#{o.id}</td>
                      <td className="font-bold text-white py-2 px-2.5">
                        <Link href={`/chart/${o.symbol}`} className="hover:underline text-indigo-300">
                          {o.symbol}
                        </Link>
                      </td>
                      <td className="text-slate-300 font-sans py-2 px-2.5">{o.order_type}</td>
                      <td className="text-center py-2 px-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isBuy
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {o.side}
                        </span>
                      </td>
                      <td className="text-right text-white py-2 px-2.5">{o.quantity}</td>
                      <td className="text-right font-bold text-white py-2 px-2.5">
                        ${o.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="text-right text-rose-400 py-2 px-2.5">
                        {o.stop_loss
                          ? `$${o.stop_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "-"}
                      </td>
                      <td className="text-right text-emerald-400 py-2 px-2.5">
                        {o.take_profit
                          ? `$${o.take_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "-"}
                      </td>
                      <td className="text-slate-300 text-[11px] font-sans py-2 px-2.5">{o.strategy || "Manual"}</td>
                      <td className="text-right text-slate-400 text-[10.5px] py-2 px-2.5">
                        {o.created_at ? o.created_at.substring(11, 19) : "12:00:00"}
                      </td>
                      <td className="text-center py-2 px-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold inline-block min-w-[55px] ${
                            o.status === "FILLED"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : o.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {o.status === "PENDING" ? "WORKING" : o.status}
                        </span>
                      </td>
                      <td className="text-center py-2 px-2.5">
                        {o.status === "PENDING" ? (
                          <button
                            onClick={() => handleCancel(o.id)}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono-num">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Order Modal */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-[#18263f] rounded-xl w-full max-w-md p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#18263f] pb-3">
              <div>
                <span className="font-bold text-white text-sm">Place Working Order</span>
                <p className="text-[11px] text-slate-400 font-mono-num tabular-nums">Delta Exchange Derivatives Execution</p>
              </div>
              <button
                onClick={() => setShowNewOrder(false)}
                className="w-7 h-7 rounded-lg bg-[#141e30] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Symbol</label>
                  <select
                    value={symbol}
                    onChange={(e) => handleSymbolChange(e.target.value)}
                    className="w-full bg-[#080c14] border border-[#18263f] rounded-lg px-2.5 py-2 text-white font-bold cursor-pointer focus:border-indigo-500 font-sans"
                  >
                    <option value="BTCUSDT">BTCUSDT</option>
                    <option value="ETHUSDT">ETHUSDT</option>
                    <option value="SOLUSDT">SOLUSDT</option>
                    <option value="BNBUSDT">BNBUSDT</option>
                    <option value="XRPUSDT">XRPUSDT</option>
                    <option value="XAUUSD">XAUUSD (Gold)</option>
                    <option value="XAGUSD">XAGUSD (Silver)</option>
                    <option value="USOIL">USOIL (Crude Oil)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Side</label>
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={`flex-1 py-2 rounded-lg font-black transition-all cursor-pointer ${
                        side === "BUY"
                          ? "bg-emerald-600 text-white"
                          : "bg-[#080c14] text-slate-400 border border-[#18263f]"
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={`flex-1 py-2 rounded-lg font-black transition-all cursor-pointer ${
                        side === "SELL"
                          ? "bg-rose-600 text-white"
                          : "bg-[#080c14] text-slate-400 border border-[#18263f]"
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full bg-[#080c14] border border-[#1e2b45] rounded-lg px-2.5 py-2 text-white font-bold cursor-pointer focus:border-indigo-500"
                  >
                    <option value="LIMIT">LIMIT</option>
                    <option value="MARKET">MARKET</option>
                    <option value="STOP">STOP</option>
                    <option value="STOP_LIMIT">STOP LIMIT</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Quantity (Contracts)</label>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080c14] border border-[#1e2b45] rounded-lg px-2.5 py-2 text-white font-mono-num font-bold focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Order Price ($)</label>
                    <button
                      type="button"
                      onClick={syncPriceToMarket}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sync Live Price ({liveQuotes[symbol]?.price ? `$${liveQuotes[symbol].price.toLocaleString()}` : "Market"})</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080c14] border border-[#1e2b45] rounded-lg px-3 py-2 text-white font-mono-num font-bold focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-rose-400 block mb-1 font-semibold">Stop Loss ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={sl}
                    onChange={(e) => setSl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080c14] border border-rose-500/40 rounded-lg px-2.5 py-2 text-rose-300 font-mono-num font-bold focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="text-emerald-400 block mb-1 font-semibold">Take Profit Target ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={tp}
                    onChange={(e) => setTp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080c14] border border-emerald-500/40 rounded-lg px-2.5 py-2 text-emerald-300 font-mono-num font-bold focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#1e2b45]">
                <button
                  type="button"
                  onClick={() => setShowNewOrder(false)}
                  className="px-3.5 py-2 bg-[#17233c] hover:bg-[#1f3052] text-slate-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-all cursor-pointer"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
