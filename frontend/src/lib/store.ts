import { create } from "zustand";
import { LiveQuote, Position, Order, TradePlan, DirectionType, MarketType, NotificationItem, UserProfile } from "./types";

interface IndicatorsState {
  ema20: boolean;
  ema50: boolean;
  ema200: boolean;
  vwap: boolean;
  rsi: boolean;
  macd: boolean;
  atr: boolean;
  supertrend: boolean;
  bollinger: boolean;
  stochastic: boolean;
}

interface TradeSetupState {
  active: boolean;
  direction: DirectionType;
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  tpAllocations: number[];
  riskPct: number;
  calculatedPlan: TradePlan | null;
  isDraggingLevel: string | null;
}

interface AlgoForgeStore {
  activeMarket: "ALL" | MarketType;
  selectedSymbol: string;
  timeframe: string;
  chartType: "candles" | "line" | "area";
  liveQuotes: Record<string, LiveQuote>;
  wsConnected: boolean;
  isTradePlannerOpen: boolean;
  isAiChatOpen: boolean;
  isWorkstationFullscreen: boolean;
  multiChartCount: 1 | 2 | 4;
  searchQuery: string;

  // Authentication & Session
  user: UserProfile | null;
  login: (user: Partial<UserProfile>) => void;
  logout: () => void;

  // Real-Time Notification Center
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  toastNotification: NotificationItem | null;
  setNotifications: (items: NotificationItem[]) => void;
  addNotification: (item: NotificationItem) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  dismissToast: () => void;

  // Auto-Trader Controls ($100 Capital Autonomous Execution)
  autoTraderEnabled: boolean;
  setAutoTraderEnabled: (enabled: boolean) => void;

  account: {
    balance: number;
    equity: number;
    freeMargin: number;
    usedMargin: number;
    todaysPnl: number;
    unrealizedPnl?: number;
    realizedPnl?: number;
    openPositionsCount: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    activeStrategiesCount: number;
  };

  positions: any[];
  setPositions: (positions: any[]) => void;

  indicators: IndicatorsState;
  activeDrawingTool: string | null;
  tradeSetup: TradeSetupState;

  // Actions
  setActiveMarket: (market: "ALL" | MarketType) => void;
  setSelectedSymbol: (symbol: string) => void;
  setTimeframe: (tf: string) => void;
  setChartType: (type: "candles" | "line" | "area") => void;
  setWsConnected: (connected: boolean) => void;
  updateQuote: (quote: LiveQuote) => void;
  setSearchQuery: (query: string) => void;
  setMultiChartCount: (count: 1 | 2 | 4) => void;
  setIsTradePlannerOpen: (open: boolean) => void;
  setIsAiChatOpen: (open: boolean) => void;
  setIsWorkstationFullscreen: (fs: boolean) => void;
  toggleIndicator: (key: keyof IndicatorsState) => void;
  setActiveDrawingTool: (tool: string | null) => void;

  // Trade Setup actions
  initTradeSetupForPrice: (price: number, symbol: string) => void;
  setTradeLevel: (level: "entry" | "stopLoss" | "tp1" | "tp2" | "tp3" | "tp4", price: number) => void;
  setTradeDirection: (dir: DirectionType) => void;
  setRiskPct: (pct: number) => void;
  setTpAllocation: (index: number, val: number) => void;
  setDraggingLevel: (level: string | null) => void;
  toggleTradeSetupActive: (active?: boolean) => void;
  updateAccount: (account: Partial<AlgoForgeStore["account"]> & Record<string, any>) => void;
}

export const useAlgoForgeStore = create<AlgoForgeStore>((set, get) => ({
  activeMarket: "ALL",
  selectedSymbol: "BTCUSDT",
  timeframe: "1H",
  chartType: "candles",
  liveQuotes: {},
  positions: [],
  wsConnected: false,
  isTradePlannerOpen: false,
  isAiChatOpen: false,
  isWorkstationFullscreen: false,
  multiChartCount: 1,
  searchQuery: "",

  // User session
  user: {
    id: "usr_quant_01",
    name: "Raunak",
    email: "raunak@algoforge.io",
    role: "INSTITUTIONAL_ALGO_TRADER",
    isAuthenticated: true,
  },
  login: (user) =>
    set({
      user: {
        id: user.id || "usr_quant_01",
        name: user.name || "Algo Trader",
        email: user.email || "trader@algoforge.io",
        role: user.role || "INSTITUTIONAL_ALGO_TRADER",
        isAuthenticated: true,
      },
    }),
  logout: () => set({ user: null }),

  // Notification center
  notifications: [
    {
      id: "notif-1",
      category: "TRADES",
      title: "Take Profit 1 Scaled & Breakeven Protected",
      message: "BTCUSDT reached TP1 ($82,150.00). Scaled 25% profit (+$3.28). Stop loss automatically moved to entry (Breakeven).",
      level: "success",
      symbol: "BTCUSDT",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: "notif-2",
      category: "ORDERS",
      title: "Delta Order Executed: BTCUSDT",
      message: "Automated LONG order filled: 0.004 BTC @ $80,920.00 (25x Isolated). Initial SL: $80,100.00.",
      level: "info",
      symbol: "BTCUSDT",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "notif-3",
      category: "ORDERS",
      title: "Commodity Order Filled: XAUUSD",
      message: "LONG 0.06 oz Gold Futures filled @ $4,145.20 (20x Isolated). Delta margin allocated: $12.54.",
      level: "info",
      symbol: "XAUUSD",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    },
    {
      id: "notif-4",
      category: "SIGNALS",
      title: "Momentum Breakout Signal: ETHUSDT",
      message: "Delta Momentum Breakout detected on 15m. EMA(20) > EMA(50) crossover with 82% confidence.",
      level: "success",
      symbol: "ETHUSDT",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    },
    {
      id: "notif-5",
      category: "RISK",
      title: "Risk Guard Active (Delta Compliance)",
      message: "Automated risk sizing active. Total portfolio margin at 25.5% of $100 balance. Drawdown limit: 5.0%.",
      level: "info",
      symbol: "SYSTEM",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    },
  ],
  unreadNotificationCount: 2,
  toastNotification: null,

  setNotifications: (items) =>
    set({
      notifications: items,
      unreadNotificationCount: items.filter((n) => !n.read).length,
    }),
  addNotification: (item) =>
    set((state) => ({
      notifications: [item, ...state.notifications].slice(0, 50),
      unreadNotificationCount: state.unreadNotificationCount + 1,
      toastNotification: item,
    })),
  markNotificationRead: (id) =>
    set((state) => {
      const next = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: next,
        unreadNotificationCount: next.filter((n) => !n.read).length,
      };
    }),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    })),
  clearNotifications: () =>
    set({
      notifications: [],
      unreadNotificationCount: 0,
      toastNotification: null,
    }),
  dismissToast: () => set({ toastNotification: null }),

  // Auto-trader
  autoTraderEnabled: true,
  setAutoTraderEnabled: (enabled) => set({ autoTraderEnabled: enabled }),

  account: {
    balance: 100.0,
    equity: 103.55,
    freeMargin: 78.04,
    usedMargin: 25.51,
    todaysPnl: 5.95,
    openPositionsCount: 2,
    winRate: 75.0,
    profitFactor: 2.45,
    maxDrawdown: 3.8,
    activeStrategiesCount: 4,
  },

  indicators: {
    ema20: true,
    ema50: true,
    ema200: false,
    vwap: false,
    rsi: true,
    macd: false,
    atr: false,
    supertrend: false,
    bollinger: false,
    stochastic: false,
  },
  activeDrawingTool: null,

  tradeSetup: {
    active: true,
    direction: "LONG",
    entry: 81750.0,
    stopLoss: 80900.0,
    tp1: 82550.0,
    tp2: 83600.0,
    tp3: 84900.0,
    tp4: 86500.0,
    tpAllocations: [25, 25, 25, 25],
    riskPct: 1.0,
    calculatedPlan: null,
    isDraggingLevel: null,
  },

  setActiveMarket: (market) => set({ activeMarket: market }),
  setSelectedSymbol: (symbol) => {
    const sym = symbol.toUpperCase();
    set({ selectedSymbol: sym });
    const currentPrice = get().liveQuotes[sym]?.price;
    if (currentPrice) {
      get().initTradeSetupForPrice(currentPrice, sym);
    }
  },
  setTimeframe: (tf) => set({ timeframe: tf }),
  setChartType: (type) => set({ chartType: type }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  setPositions: (pos) => set({ positions: pos || [] }),

  updateQuote: (quote) =>
    set((state) => {
      const newQuotes = {
        ...state.liveQuotes,
        [quote.symbol]: quote,
      };

      // Automatically sync tradeSetup with live price if still at placeholder
      let updatedTradeSetup = state.tradeSetup;
      if (
        state.selectedSymbol === quote.symbol &&
        (state.tradeSetup.entry === 104250.0 || Math.abs(state.tradeSetup.entry - quote.price) / (quote.price || 1) > 0.15)
      ) {
        const delta = quote.price * 0.01;
        const isLong = state.tradeSetup.direction === "LONG";
        updatedTradeSetup = {
          ...state.tradeSetup,
          entry: quote.price,
          stopLoss: Math.round((isLong ? quote.price - delta : quote.price + delta) * 100) / 100,
          tp1: Math.round((isLong ? quote.price + delta * 1.5 : quote.price - delta * 1.5) * 100) / 100,
          tp2: Math.round((isLong ? quote.price + delta * 2.8 : quote.price - delta * 2.8) * 100) / 100,
          tp3: Math.round((isLong ? quote.price + delta * 4.2 : quote.price - delta * 4.2) * 100) / 100,
          tp4: Math.round((isLong ? quote.price + delta * 6.0 : quote.price - delta * 6.0) * 100) / 100,
        };
      }

      // Live update positions current price and unrealized P&L
      const updatedPositions = state.positions.map((pos) => {
        if (pos.symbol === quote.symbol) {
          const diff = pos.direction === "LONG" ? (quote.price - pos.entry_price) : (pos.entry_price - quote.price);
          const pnl = Math.round(diff * pos.quantity * 100) / 100;
          const pnl_pct = Math.round((diff / (pos.entry_price || 1)) * 10000) / 100;
          return {
            ...pos,
            current_price: quote.price,
            pnl,
            pnl_pct,
          };
        }
        return pos;
      });

      return {
        liveQuotes: newQuotes,
        tradeSetup: updatedTradeSetup,
        positions: updatedPositions,
      };
    }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMultiChartCount: (count) => set({ multiChartCount: count }),
  setIsTradePlannerOpen: (open) => set({ isTradePlannerOpen: open }),
  setIsAiChatOpen: (open) => set({ isAiChatOpen: open }),
  setIsWorkstationFullscreen: (fs) => set({ isWorkstationFullscreen: fs }),
  toggleIndicator: (key) =>
    set((state) => ({
      indicators: {
        ...state.indicators,
        [key]: !state.indicators[key],
      },
    })),
  setActiveDrawingTool: (tool) => set({ activeDrawingTool: tool }),

  initTradeSetupForPrice: (price, symbol) => {
    const isCrypto = symbol.includes("USDT") || symbol.includes("BTC") || symbol.includes("ETH");
    const delta = isCrypto ? price * 0.007 : price * 0.004;
    set((state) => {
      const isLong = state.tradeSetup.direction === "LONG";
      return {
        tradeSetup: {
          ...state.tradeSetup,
          entry: price,
          stopLoss: isLong ? price - delta : price + delta,
          tp1: isLong ? price + delta * 1.0 : price - delta * 1.0,
          tp2: isLong ? price + delta * 2.0 : price - delta * 2.0,
          tp3: isLong ? price + delta * 3.0 : price - delta * 3.0,
          tp4: isLong ? price + delta * 4.5 : price - delta * 4.5,
        },
      };
    });
  },

  setTradeLevel: (level, price) => {
    set((state) => ({
      tradeSetup: {
        ...state.tradeSetup,
        [level]: price,
      },
    }));
  },

  setTradeDirection: (dir) => {
    set((state) => {
      const { entry, stopLoss, tp1, tp2, tp3, tp4 } = state.tradeSetup;
      const risk = Math.abs(entry - stopLoss);
      if (dir === "LONG") {
        return {
          tradeSetup: {
            ...state.tradeSetup,
            direction: "LONG",
            stopLoss: entry - risk,
            tp1: entry + risk * 1.0,
            tp2: entry + risk * 2.0,
            tp3: entry + risk * 3.0,
            tp4: entry + risk * 4.5,
          },
        };
      } else {
        return {
          tradeSetup: {
            ...state.tradeSetup,
            direction: "SHORT",
            stopLoss: entry + risk,
            tp1: entry - risk * 1.0,
            tp2: entry - risk * 2.0,
            tp3: entry - risk * 3.0,
            tp4: entry - risk * 4.5,
          },
        };
      }
    });
  },

  setRiskPct: (pct) =>
    set((state) => ({
      tradeSetup: { ...state.tradeSetup, riskPct: pct },
    })),

  setTpAllocation: (index, val) =>
    set((state) => {
      const allocs = [...state.tradeSetup.tpAllocations];
      allocs[index] = val;
      return {
        tradeSetup: { ...state.tradeSetup, tpAllocations: allocs },
      };
    }),

  setDraggingLevel: (level) =>
    set((state) => ({
      tradeSetup: { ...state.tradeSetup, isDraggingLevel: level },
    })),

  toggleTradeSetupActive: (active) =>
    set((state) => ({
      tradeSetup: {
        ...state.tradeSetup,
        active: active !== undefined ? active : !state.tradeSetup.active,
      },
    })),

  updateAccount: (newAcc) =>
    set((state) => ({
      account: {
        ...state.account,
        balance: newAcc.balance !== undefined ? newAcc.balance : state.account.balance,
        equity: newAcc.equity !== undefined ? newAcc.equity : state.account.equity,
        freeMargin: newAcc.free_margin !== undefined ? newAcc.free_margin : (newAcc.freeMargin !== undefined ? newAcc.freeMargin : state.account.freeMargin),
        usedMargin: newAcc.used_margin !== undefined ? newAcc.used_margin : (newAcc.usedMargin !== undefined ? newAcc.usedMargin : state.account.usedMargin),
        todaysPnl: newAcc.daily_pnl !== undefined ? newAcc.daily_pnl : (newAcc.todaysPnl !== undefined ? newAcc.todaysPnl : state.account.todaysPnl),
        openPositionsCount: newAcc.open_positions_count !== undefined ? newAcc.open_positions_count : (newAcc.openPositionsCount !== undefined ? newAcc.openPositionsCount : state.account.openPositionsCount),
        winRate: newAcc.win_rate !== undefined ? newAcc.win_rate : (newAcc.winRate !== undefined ? newAcc.winRate : state.account.winRate),
        profitFactor: newAcc.profit_factor !== undefined ? newAcc.profit_factor : (newAcc.profitFactor !== undefined ? newAcc.profitFactor : state.account.profitFactor),
        maxDrawdown: newAcc.max_drawdown !== undefined ? newAcc.max_drawdown : (newAcc.maxDrawdown !== undefined ? newAcc.maxDrawdown : state.account.maxDrawdown),
      },
    })),
}));
