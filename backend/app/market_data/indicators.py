import numpy as np
import pandas as pd
from typing import Dict, Any, List

def calculate_ema(df: pd.DataFrame, length: int = 20, column: str = "close") -> List[float]:
    series = df[column].ewm(span=length, adjust=False).mean()
    return series.replace({np.nan: None}).tolist()

def calculate_sma(df: pd.DataFrame, length: int = 50, column: str = "close") -> List[float]:
    series = df[column].rolling(window=length).mean()
    return series.replace({np.nan: None}).tolist()

def calculate_rsi(df: pd.DataFrame, length: int = 14) -> List[float]:
    delta = df["close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=length).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=length).mean()
    rs = gain / (loss + 1e-10)
    rsi = 100 - (100 / (1 + rs))
    return rsi.replace({np.nan: None}).tolist()

def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, List[float]]:
    ema_fast = df["close"].ewm(span=fast, adjust=False).mean()
    ema_slow = df["close"].ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return {
        "macd": macd_line.replace({np.nan: None}).tolist(),
        "signal": signal_line.replace({np.nan: None}).tolist(),
        "hist": histogram.replace({np.nan: None}).tolist(),
    }

def calculate_atr(df: pd.DataFrame, length: int = 14) -> List[float]:
    high = df["high"]
    low = df["low"]
    close = df["close"]
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=length).mean()
    return atr.replace({np.nan: None}).tolist()

def calculate_bollinger_bands(df: pd.DataFrame, length: int = 20, std_dev: float = 2.0) -> Dict[str, List[float]]:
    middle = df["close"].rolling(window=length).mean()
    std = df["close"].rolling(window=length).std()
    upper = middle + (std * std_dev)
    lower = middle - (std * std_dev)
    return {
        "upper": upper.replace({np.nan: None}).tolist(),
        "middle": middle.replace({np.nan: None}).tolist(),
        "lower": lower.replace({np.nan: None}).tolist(),
    }

def calculate_vwap(df: pd.DataFrame) -> List[float]:
    typical_price = (df["high"] + df["low"] + df["close"]) / 3.0
    vol = df["volume"].replace(0, 1.0)
    vwap = (typical_price * vol).cumsum() / vol.cumsum()
    return vwap.replace({np.nan: None}).tolist()

def calculate_supertrend(df: pd.DataFrame, length: int = 10, multiplier: float = 3.0) -> Dict[str, List[float]]:
    high = df["high"]
    low = df["low"]
    close = df["close"]
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=length).mean().fillna(0)
    
    hl2 = (high + low) / 2.0
    upper_band = hl2 + (multiplier * atr)
    lower_band = hl2 - (multiplier * atr)
    
    supertrend = [0.0] * len(df)
    direction = [1] * len(df)
    
    for i in range(1, len(df)):
        c_close = close.iloc[i]
        p_close = close.iloc[i-1]
        
        if lower_band.iloc[i] > lower_band.iloc[i-1] or p_close < lower_band.iloc[i-1]:
            pass
        else:
            lower_band.iloc[i] = lower_band.iloc[i-1]
            
        if upper_band.iloc[i] < upper_band.iloc[i-1] or p_close > upper_band.iloc[i-1]:
            pass
        else:
            upper_band.iloc[i] = upper_band.iloc[i-1]
            
        if direction[i-1] == 1:
            if c_close < lower_band.iloc[i]:
                direction[i] = -1
                supertrend[i] = upper_band.iloc[i]
            else:
                direction[i] = 1
                supertrend[i] = lower_band.iloc[i]
        else:
            if c_close > upper_band.iloc[i]:
                direction[i] = 1
                supertrend[i] = lower_band.iloc[i]
            else:
                direction[i] = -1
                supertrend[i] = upper_band.iloc[i]
                
    return {
        "supertrend": supertrend,
        "direction": direction,
    }

def calculate_adx(df: pd.DataFrame, length: int = 14) -> List[float]:
    high = df["high"]
    low = df["low"]
    close = df["close"]
    
    up_move = high.diff()
    down_move = -low.diff()
    
    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)
    
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    
    atr = tr.rolling(window=length).mean()
    plus_di = 100 * (pd.Series(plus_dm).rolling(window=length).mean() / (atr + 1e-10))
    minus_di = 100 * (pd.Series(minus_dm).rolling(window=length).mean() / (atr + 1e-10))
    dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di + 1e-10))
    adx = dx.rolling(window=length).mean()
    return adx.replace({np.nan: None}).tolist()

def calculate_stochastic(df: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> Dict[str, List[float]]:
    low_min = df["low"].rolling(window=k_period).min()
    high_max = df["high"].rolling(window=k_period).max()
    k = 100 * ((df["close"] - low_min) / (high_max - low_min + 1e-10))
    d = k.rolling(window=d_period).mean()
    return {
        "k": k.replace({np.nan: None}).tolist(),
        "d": d.replace({np.nan: None}).tolist(),
    }
