const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Instruments & Scanner
  getInstruments: (market?: string) =>
    fetchJson<any[]>(`${API_V1}/instruments${market ? `?market_type=${market}` : ""}`),
  getScannerData: (market?: string, filterType?: string) =>
    fetchJson<any[]>(
      `${API_V1}/market/scanner?${market ? `market=${market}&` : ""}${filterType ? `filter_type=${filterType}` : ""}`
    ),
  getQuote: (symbol: string) => fetchJson<any>(`${API_V1}/market/quote/${symbol}`),

  // Chart & Indicators
  getCandles: (symbol: string, timeframe: string = "1H", count: number = 250) =>
    fetchJson<{ symbol: string; timeframe: string; candles: any[] }>(
      `${API_V1}/chart/${symbol}/candles?timeframe=${timeframe}&count=${count}`
    ),
  getIndicators: (symbol: string, timeframe: string = "1H") =>
    fetchJson<{ symbol: string; indicators: any; times: number[] }>(
      `${API_V1}/chart/${symbol}/indicators?timeframe=${timeframe}`
    ),
  saveDrawings: (symbol: string, drawings: any[]) =>
    fetchJson<any>(`${API_V1}/chart/${symbol}/drawings`, {
      method: "POST",
      body: JSON.stringify(drawings),
    }),
  getDrawings: (symbol: string) => fetchJson<any[]>(`${API_V1}/chart/${symbol}/drawings`),

  // Trade Planner
  calculateTradePlan: (data: any) =>
    fetchJson<any>(`${API_V1}/trade-planner/calculate`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Orders & Positions
  getOrders: () => fetchJson<any[]>(`${API_V1}/orders`),
  createOrder: (order: any) =>
    fetchJson<any>(`${API_V1}/orders`, {
      method: "POST",
      body: JSON.stringify(order),
    }),
  cancelOrder: (orderId: number) =>
    fetchJson<any>(`${API_V1}/orders/${orderId}`, { method: "DELETE" }),

  getPositions: () => fetchJson<any[]>(`${API_V1}/positions`),
  modifyPosition: (posId: number, data: any) =>
    fetchJson<any>(`${API_V1}/positions/${posId}/modify`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Strategies & Backtest
  getStrategies: () => fetchJson<any[]>(`${API_V1}/strategies`),
  createStrategy: (strat: any) =>
    fetchJson<any>(`${API_V1}/strategies`, {
      method: "POST",
      body: JSON.stringify(strat),
    }),
  getStrategySignal: (stratId: string, symbol = "BTCUSDT", timeframe = "1H") =>
    fetchJson<any>(
      `${API_V1}/strategies/${stratId}/signal?symbol=${symbol}&timeframe=${timeframe}`,
      { method: "POST" }
    ),
  runBacktest: (params: any) =>
    fetchJson<any>(`${API_V1}/backtest/run`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // Portfolio, Analytics & History
  getPortfolio: () => fetchJson<any>(`${API_V1}/portfolio/summary`),
  getAnalytics: () => fetchJson<any>(`${API_V1}/analytics/performance`),
  getTradeHistory: () => fetchJson<any[]>(`${API_V1}/trade-history`),
  clearTradeHistory: () =>
    fetchJson<any>(`${API_V1}/trade-history`, { method: "DELETE" }),
  deleteTradeHistoryItem: (tradeId: number | string) =>
    fetchJson<any>(`${API_V1}/trade-history/${tradeId}`, { method: "DELETE" }),

  // Live Trading, Alerts & Settings
  getLiveStatus: () => fetchJson<any>(`${API_V1}/live-trading/status`),
  connectBroker: (data: any) =>
    fetchJson<any>(`${API_V1}/live-trading/connect`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAlerts: (symbol?: string) =>
    fetchJson<any[]>(`${API_V1}/alerts${symbol ? `?symbol=${symbol}` : ""}`),
  createAlert: (alert: any) =>
    fetchJson<any>(`${API_V1}/alerts`, {
      method: "POST",
      body: JSON.stringify(alert),
    }),
  getSettings: () => fetchJson<any>(`${API_V1}/settings`),
  updateRiskSettings: (settings: any) =>
    fetchJson<any>(`${API_V1}/settings/risk`, {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // Delta Exchange & Paper Engine Controls
  resetPaperTrading: (initialBalance = 100.0) =>
    fetchJson<any>(`${API_V1}/paper-trading/reset?initial_balance=${initialBalance}`, {
      method: "POST",
    }),
  seedDeltaTrades: () =>
    fetchJson<any>(`${API_V1}/paper-trading/seed-delta-trades`, {
      method: "POST",
    }),
  testAlgoCycle: (
    symbol = "BTCUSDT",
    strategy = "Delta Momentum Breakout",
    leverage = 25,
    direction = "LONG"
  ) =>
    fetchJson<any>(
      `${API_V1}/paper-trading/test-algo-cycle?symbol=${symbol}&strategy_name=${encodeURIComponent(
        strategy
      )}&leverage=${leverage}&direction=${direction}`,
      { method: "POST" }
    ),
  getDeltaSpecs: () => fetchJson<Record<string, any>>(`${API_V1}/delta-exchange/specs`),
  checkDeltaExchange: () => fetchJson<any>(`${API_V1}/delta-exchange/check`),
  calculateDeltaMargin: (
    symbol: string,
    quantity: number,
    price: number,
    leverage = 20,
    marginMode = "ISOLATED"
  ) =>
    fetchJson<any>(
      `${API_V1}/delta-exchange/calculate-margin?symbol=${symbol}&quantity=${quantity}&price=${price}&leverage=${leverage}&margin_mode=${marginMode}`
    ),
  getDeltaMarketsByVolume: () =>
    fetchJson<any[]>(`${API_V1}/delta-exchange/markets-by-volume`),

  // Auto-Trader Controls ($100 Capital Autonomous Execution)
  getAutoTraderStatus: () => fetchJson<any>(`${API_V1}/auto-trader/status`),
  toggleAutoTrader: () => fetchJson<any>(`${API_V1}/auto-trader/toggle`, { method: "POST" }),
  triggerAutoTraderScan: () => fetchJson<any>(`${API_V1}/auto-trader/scan-now`, { method: "POST" }),
  getDeployedStrategies: () => fetchJson<any[]>(`${API_V1}/auto-trader/deployed-strategies`),
  deployAllStrategies: () => fetchJson<any>(`${API_V1}/auto-trader/deploy-all`, { method: "POST" }),
  undeployAllStrategies: () => fetchJson<any>(`${API_V1}/auto-trader/undeploy-all`, { method: "POST" }),
  toggleAutoTraderStrategy: (strategyId: string) =>
    fetchJson<any>(`${API_V1}/auto-trader/toggle-strategy?strategy_id=${encodeURIComponent(strategyId)}`, {
      method: "POST",
    }),
  executeRiskyTrade: (symbol = "BTCUSDT", leverage = 100, strategyId = "hyper_scalper_100x") =>
    fetchJson<any>(
      `${API_V1}/auto-trader/execute-risky-trade?symbol=${symbol}&leverage=${leverage}&strategy_id=${strategyId}`,
      { method: "POST" }
    ),
  resetCapital: (capital = 100.0) =>
    fetchJson<any>(`${API_V1}/auto-trader/reset-capital?capital=${capital}`, { method: "POST" }),
  getAutoTraderExecutionHistory: () =>
    fetchJson<any[]>(`${API_V1}/auto-trader/execution-history`),

  // Real-Time Crypto Intelligence, Liquidation Map & Sentiment
  getLiquidationMap: (symbol = "BTCUSDT") =>
    fetchJson<any>(`${API_V1}/crypto-intelligence/liquidation-map?symbol=${symbol}`),
  getMarketSentiment: () =>
    fetchJson<any>(`${API_V1}/crypto-intelligence/market-sentiment`),
  getCryptoNewsFeed: () =>
    fetchJson<any>(`${API_V1}/crypto-intelligence/news-feed`),

  // Real-Time Notification System
  getNotifications: (category?: string, unreadOnly?: boolean) =>
    fetchJson<{ notifications: any[]; unread_count: number; total: number }>(
      `${API_V1}/notifications?${category ? `category=${category}&` : ""}${unreadOnly ? "unread_only=true" : ""}`
    ),
  markAllNotificationsRead: () =>
    fetchJson<any>(`${API_V1}/notifications/mark-all-read`, { method: "POST" }),
  markNotificationRead: (id: string) =>
    fetchJson<any>(`${API_V1}/notifications/${id}/mark-read`, { method: "POST" }),
  clearNotifications: () =>
    fetchJson<any>(`${API_V1}/notifications`, { method: "DELETE" }),
  triggerTestNotification: (symbol = "BTCUSDT") =>
    fetchJson<any>(`${API_V1}/notifications/test-trigger?symbol=${symbol}`, { method: "POST" }),
};


