export type MarketType = "CRYPTO" | "COMMODITIES" | "FOREX";
export type DirectionType = "LONG" | "SHORT";

export interface Instrument {
  symbol: string;
  name: string;
  market_type: MarketType;
  base_currency: string;
  quote_currency: string;
  category: string;
  pip_size: number;
  tick_size: number;
  precision: number;
  lot_size: number;
  base_price: number;
  spread_pips: number;
}

export interface LiveQuote {
  symbol: string;
  name: string;
  market_type: MarketType;
  price: number;
  bid: number;
  ask: number;
  spread_pips: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  change_24h: number;
  timestamp: string;
}

export interface Candle {
  time: number;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  timeframe: string;
}

export interface TradeLevel {
  type: "ENTRY" | "SL" | "TP1" | "TP2" | "TP3" | "TP4" | "TP5";
  level_number: number;
  name: string;
  price: number;
  distance_pips: number;
  distance_pct: number;
  potential_pnl: number;
  tier_pnl?: number;
  rr: number;
  percentage: number;
}

export interface TradePlan {
  symbol: string;
  direction: DirectionType;
  entry: number;
  stop_loss: number;
  stop_distance_points: number;
  stop_distance_pips: number;
  stop_distance_pct: number;
  risk_amount: number;
  potential_reward: number;
  risk_reward: string;
  risk_reward_ratio: number;
  position_size: number;
  lot_size: number;
  units: number;
  margin_required: number;
  confidence: number;
  strategy_name: string;
  levels: TradeLevel[];
}

export interface Position {
  id: number;
  symbol: string;
  market_type: MarketType;
  direction: DirectionType;
  quantity: number;
  original_quantity: number;
  entry_price: number;
  current_price: number;
  stop_loss: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  tp4?: number;
  tp5?: number;
  tp1_hit: boolean;
  tp2_hit: boolean;
  tp3_hit: boolean;
  tp4_hit: boolean;
  remaining_pct: number;
  breakeven_moved: boolean;
  trailing_stop: boolean;
  pnl: number;
  pnl_pct: number;
  rr: number;
  status: "OPEN" | "PARTIALLY_CLOSED" | "CLOSED";
  strategy: string;
  opened_at: string;
}

export interface Order {
  id: number;
  symbol: string;
  order_type: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  stop_loss?: number;
  take_profit?: number;
  strategy: string;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  created_at: string;
}

export interface CompletedTrade {
  id: number;
  symbol: string;
  direction: DirectionType;
  strategy: string;
  leverage?: number;
  exchange?: string;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  risk_amount: number;
  reward_amount: number;
  pnl: number;
  rr: number;
  duration_minutes: number;
  result: "WIN" | "LOSS" | "BREAKEVEN";
  closed_at: string;
  targets_taken?: string;
  exit_reason?: string;
  is_automated?: boolean;
}

export interface ScannerItem {
  symbol: string;
  name: string;
  market_type: MarketType;
  category: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  trend: "Bullish" | "Bearish" | "Neutral";
  rsi: number;
  atr: number;
  signal: "BUY" | "SELL" | "WATCH";
  rr: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  category: "SIGNALS" | "ORDERS" | "RISK" | "SYSTEM" | string;
  title: string;
  message: string;
  level: "success" | "warning" | "info" | "error";
  symbol: string;
  read: boolean;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
}

