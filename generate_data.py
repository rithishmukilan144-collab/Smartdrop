"""
Data Acquisition Script for SmartDrip
Simulates YF-S201 flow-sensor readings at 1 Hz for 10 taps across 3 washrooms for 14 days.
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from config import RANDOM_SEED, NUM_TAPS, NUM_DAYS, WASHROOMS, LEAKY_TAPS

def generate_sensor_data(output_dir="data"):
    random.seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)
    
    os.makedirs(output_dir, exist_ok=True)
    start_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=NUM_DAYS)
    
    # Flatten tap list and reverse map tap -> washroom
    tap_to_washroom = {}
    for wr, taps in WASHROOMS.items():
        for t in taps:
            tap_to_washroom[t] = wr
            
    taps = list(tap_to_washroom.keys())
    
    print(f"Generating 14 days of 1Hz data for {len(taps)} taps...")
    
    # To keep file size manageable for 14 days at 1Hz (1,209,600 rows per tap),
    # we can generate per tap and save to CSV, or generate in chunks.
    # 14 days * 86400 seconds = 1,209,600 records per tap.
    
    total_seconds = NUM_DAYS * 24 * 3600
    timestamps = [start_time + timedelta(seconds=i) for i in range(total_seconds)]
    
    # We will generate CSV files per tap in data/
    for tap_id in taps:
        washroom = tap_to_washroom[tap_id]
        print(f"Generating data for {tap_id} ({washroom})...")
        
        # Base flow: mostly 0
        flow = np.zeros(total_seconds)
        
        # Normal usage bursts during day hours (7am to 10pm)
        # We can simulate burst intervals using random state
        hours = np.array([ts.hour for ts in timestamps])
        is_day = (hours >= 7) & (hours <= 22)
        
        # Add random bursts during day
        # Probability of starting a burst in a given second during day
        burst_starts = np.random.rand(total_seconds) < 0.0008
        burst_indices = np.where(burst_starts & is_day)[0]
        
        for idx in burst_indices:
            duration = random.randint(5, 60)
            end_idx = min(idx + duration, total_seconds)
            burst_flow = np.random.uniform(0.5, 6.0, size=(end_idx - idx))
            flow[idx:end_idx] = burst_flow
            
        # Add slight sensor noise / minor drips in normal behavior (0.0 to 0.01)
        noise = np.random.uniform(0.0, 0.01, size=total_seconds)
        flow = flow + noise
        
        # Inject leak if applicable
        if tap_id in LEAKY_TAPS:
            leak_info = LEAKY_TAPS[tap_id]
            leak_start_second = leak_info["start_day"] * 24 * 3600
            leak_rate = leak_info["flow_lpm"]
            
            # Continuous low flow starting from leak_start_second onwards (24/7)
            # Add small fluctuations around leak rate
            leak_mask = np.arange(total_seconds) >= leak_start_second
            leak_values = np.random.normal(leak_rate, 0.005, size=total_seconds)
            leak_values = np.clip(leak_values, 0.01, 0.15)
            
            # Where there's normal high flow, normal flow takes precedence; where normal is 0, leak flow persists
            flow[leak_mask & (flow < 0.02)] = leak_values[leak_mask & (flow < 0.02)]
            
        df = pd.DataFrame({
            "timestamp": timestamps,
            "tap_id": tap_id,
            "washroom": washroom,
            "flow_lpm": np.round(flow, 3)
        })
        
        file_path = os.path.join(output_dir, f"{tap_id}.csv")
        df.to_csv(file_path, index=False)
        print(f"Saved {file_path}")

if __name__ == "__main__":
    generate_sensor_data()
