"""
AI Engine & Evaluation Script for SmartDrip
Trains Isolation Forest per tap on normal training data (first 3 days).
Compares Isolation Forest against a simple rule-based baseline.
Reports precision, recall, and F1 against injected ground truth.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score
from config import WASHROOMS, LEAKY_TAPS, RANDOM_SEED

def train_and_evaluate(features_dir="features_data", models_dir="models"):
    os.makedirs(models_dir, exist_ok=True)
    
    tap_to_washroom = {}
    for wr, taps in WASHROOMS.items():
        for t in taps:
            tap_to_washroom[t] = wr
            
    results = []
    
    feature_cols = ['mean', 'max', 'std', 'nonzero_frac', 'min_flow_30min']
    
    for tap_id in tap_to_washroom.keys():
        feat_path = os.path.join(features_dir, f"{tap_id}_features.csv")
        if not os.path.exists(feat_path):
            print(f"Features file {feat_path} not found. Skipping.")
            continue
            
        df = pd.read_csv(feat_path)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Ground truth: is this tap leaky and is timestamp past leak start day?
        is_leaky_tap = tap_id in LEAKY_TAPS
        if is_leaky_tap:
            leak_start_day = LEAKY_TAPS[tap_id]["start_day"]
            start_time = df['timestamp'].min()
            leak_start_time = start_time + pd.Timedelta(days=leak_start_day)
            df['ground_truth'] = (df['timestamp'] >= leak_start_time).astype(int)
        else:
            df['ground_truth'] = 0
            
        # Training data: first 3 days (guaranteed normal for all taps)
        train_end_time = df['timestamp'].min() + pd.Timedelta(days=3)
        train_df = df[df['timestamp'] < train_end_time]
        
        X_train = train_df[feature_cols]
        X_all = df[feature_cols]
        
        # 1. Isolation Forest Model
        iso = IsolationForest(contamination=0.05, random_state=RANDOM_SEED)
        iso.fit(X_train)
        
        # Predict: iso.predict returns 1 for inliers, -1 for outliers
        preds_iso_raw = iso.predict(X_all)
        preds_iso = (preds_iso_raw == -1).astype(int)
        
        # Save model
        model_path = os.path.join(models_dir, f"{tap_id}_iforest.pkl")
        with open(model_path, 'wb') as f:
            pickle.dump(iso, f)
            
        # 2. Rule-based Baseline
        # Rule: min_flow_30min > 0.025 L/min continuously
        preds_rule = (df['min_flow_30min'] > 0.025).astype(int)
        
        y_true = df['ground_truth']
        
        # Metrics for Isolation Forest
        p_iso = precision_score(y_true, preds_iso, zero_division=0)
        r_iso = recall_score(y_true, preds_iso, zero_division=0)
        f1_iso = f1_score(y_true, preds_iso, zero_division=0)
        
        # Metrics for Rule Baseline
        p_rule = precision_score(y_true, preds_rule, zero_division=0)
        r_rule = recall_score(y_true, preds_rule, zero_division=0)
        f1_rule = f1_score(y_true, preds_rule, zero_division=0)
        
        results.append({
            'tap_id': tap_id,
            'washroom': tap_to_washroom[tap_id],
            'is_leaky': is_leaky_tap,
            'iso_precision': round(p_iso, 3),
            'iso_recall': round(r_iso, 3),
            'iso_f1': round(f1_iso, 3),
            'rule_precision': round(p_rule, 3),
            'rule_recall': round(r_rule, 3),
            'rule_f1': round(f1_rule, 3)
        })
        
    results_df = pd.DataFrame(results)
    print("\n--- Model Evaluation Results (Isolation Forest vs Rule Baseline) ---")
    print(results_df.to_string(index=False))
    
    # Save results summary
    results_df.to_csv(os.path.join(models_dir, "evaluation_metrics.csv"), index=False)
    return results_df

if __name__ == "__main__":
    train_and_evaluate()
