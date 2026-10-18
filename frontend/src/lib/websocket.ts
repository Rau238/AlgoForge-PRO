import { useAlgoForgeStore } from "./store";

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private url: string;

  constructor() {
    const defaultWs = process.env.NODE_ENV === "production"
      ? "wss://algoforge-pro-dl74.onrender.com/ws"
      : "ws://localhost:8000/ws";
    this.url = process.env.NEXT_PUBLIC_WS_URL || defaultWs;
  }

  connect() {
    if (typeof window === "undefined") return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        useAlgoForgeStore.getState().setWsConnected(true);
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "market:ticks" && message.data) {
            useAlgoForgeStore.getState().updateQuote(message.data);
          } else if (message.type === "account:update" && message.data) {
            useAlgoForgeStore.getState().updateAccount(message.data);
          } else if (message.type === "positions:update" && message.data) {
            useAlgoForgeStore.getState().setPositions(message.data);
          } else if (message.type === "notification" && message.data) {
            useAlgoForgeStore.getState().addNotification(message.data);
          } else if (message.type === "auto_trader:scan" && message.data?.account) {
            useAlgoForgeStore.getState().updateAccount(message.data.account);
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      this.ws.onclose = () => {
        useAlgoForgeStore.getState().setWsConnected(false);
        this.stopPing();
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        useAlgoForgeStore.getState().setWsConnected(false);
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: "ping" }));
      }
    }, 15000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  disconnect() {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    useAlgoForgeStore.getState().setWsConnected(false);
  }
}

export const wsClient = new WebSocketClient();
