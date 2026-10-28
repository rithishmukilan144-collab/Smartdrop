"""
Pre-processing and Feature Engineering Script for SmartDrip
Resamples 1 Hz sensor data to 1-minute windows and computes features:
mean, max, std, non-zero fraction, hour of day, and rolling 30-min min flow (key leak signal).
"""

import os
import pandas as pd
import numpy as np
from config import WASHROOMS

def process_tap_data(csv_path, output_csv_path=None):
    df = pd.read_csv(csv_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df.set_index('timestamp', inplace=True)
    
    # Resample to 1-minute windows
    # mean, max, std of flow_lpm
    resampled = df['flow_lpm'].resample('1min').agg(['mean', 'max', 'std']).fillna(0)
    
    # Fraction of non-zero seconds in the minute
    nonzero = df['flow_lpm'].resample('1min').apply(lambda x: (x > 0.01).mean())
    resampled['nonzero_frac'] = nonzero
    
    # Hour of day
    resampled['hour'] = resampled.index.hour
    
    # Key leak signal: minimum flow over the last 30 minutes
    # Rolling min of the minute mean over 30 windows
    resampled['min_flow_30min'] = resampled['mean'].rolling(window=30, min_periods=1).min()
    
    # Preserve metadata columns
    resampled['tap_id'] = df['tap_id'].iloc[0]
    resampled['washroom'] = df['washroom'].iloc[0]
    
    resampled.reset_index(inplace=True)
    
    if output_csv_path:
        os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
        resampled.to_csv(output_csv_path, index=False)
        
    return resampled

def process_all_taps(data_dir="data", output_dir="features_data"):
    os.makedirs(output_dir, exist_ok=True)
    tap_to_washroom = {}
    for wr, taps in WASHROOMS.items():
        for t in taps:
            tap_to_washroom[t] = wr
            
    processed_dfs = []
    for tap_id in tap_to_washroom.keys():
        csv_path = os.path.join(data_dir, f"{tap_id}.csv")
        out_path = os.path.join(output_dir, f"{tap_id}_features.csv")
        if os.path.exists(csv_path):
            print(f"Processing features for {tap_id}...")
            feat_df = process_tap_data(csv_path, out_path)
            processed_dfs.append(feat_df)
        else:
            print(f"Warning: {csv_path} not found. Run generate_data.py first.")
            
    return processed_dfs

if __name__ == "__main__":
    process_all_taps()
