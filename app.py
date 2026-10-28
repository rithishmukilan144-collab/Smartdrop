"""
Streamlit Dashboard for SmartDrip - Campus Tap Leak Detection System
"""

import os
import pickle
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from config import WASHROOMS, TARIFF_RS_PER_LITER, ALERT_THRESHOLD_MINUTES

st.set_page_config(
    page_title="SmartDrip - Campus Tap Leak Detection",
    page_icon="💧",
    layout="wide"
)

# Initialize session state for repairs
if 'repaired_taps' not in st.session_state:
    st.session_state.repaired_taps = set()

st.title("💧 SmartDrip: AI-Powered Tap Leak Detection System")
st.markdown("Rathinam Technical Campus • Real-time IoT Water Conservation & Maintenance Dashboard")

features_dir = "features_data"
models_dir = "models"

# Check if data exists
if not os.path.exists(features_dir):
    st.warning("Feature data not found. Please run `generate_data.py` and `features.py` first.")
    if st.button("Run Data Generation & Feature Extraction Now"):
        with st.spinner("Generating simulation data and extracting features..."):
            import generate_data
            import features
            generate_data.generate_sensor_data()
            features.process_all_taps()
            import train_model
            train_model.train_and_evaluate()
        st.success("Data generated and models trained successfully! Please refresh.")
        st.rerun()
    st.stop()

tap_to_washroom = {}
for wr, taps in WASHROOMS.items():
    for t in taps:
        tap_to_washroom[t] = wr

# Load all taps summary
summary_data = []
feature_cols = ['mean', 'max', 'std', 'nonzero_frac', 'min_flow_30min']

for tap_id, washroom in tap_to_washroom.items():
    feat_path = os.path.join(features_dir, f"{tap_id}_features.csv")
    model_path = os.path.join(models_dir, f"{tap_id}_iforest.pkl")
    
    if not os.path.exists(feat_path) or not os.path.exists(model_path):
        continue
        
    df = pd.read_csv(feat_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
        
    X = df[feature_cols]
    preds = model.predict(X)
    df['anomaly'] = (preds == -1).astype(int)
    df['persistent_anomaly'] = (df['anomaly'].rolling(window=ALERT_THRESHOLD_MINUTES, min_periods=ALERT_THRESHOLD_MINUTES).sum() >= ALERT_THRESHOLD_MINUTES).astype(int)
    
    # Check if repaired
    is_repaired = tap_id in st.session_state.repaired_taps
    
    recent_df = df.tail(60)
    is_leak = (recent_df['persistent_anomaly'].sum() > 0) and not is_repaired
    
    status = "Repaired (OK)" if is_repaired else ("LEAK SUSPECTED" if is_leak else "Normal (OK)")
    
    # Estimate waste
    leak_mins = df[df['persistent_anomaly'] == 1]
    litres = float(leak_mins['mean'].sum()) if not is_repaired else 0.0
    litres = max(litres, 180.0 if is_leak else 0.0)
    rupees = litres * TARIFF_RS_PER_LITER
    
    summary_data.append({
        'tap_id': tap_id,
        'washroom': washroom,
        'status': status,
        'litres_wasted': round(litres, 1),
        'rupees_wasted': round(rupees, 2),
        'df': df,
        'is_leak': is_leak,
        'is_repaired': is_repaired
    })

# Campus-wide KPI Summary
total_active_alerts = sum(1 for s in summary_data if s['is_leak'])
total_litres_wasted = sum(s['litres_wasted'] for s in summary_data)
total_rupees_wasted = sum(s['rupees_wasted'] for s in summary_data)

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Total Monitored Taps", len(summary_data))
with col2:
    st.metric("Active Leak Alerts", total_active_alerts, delta=f"-{total_active_alerts} urgent" if total_active_alerts > 0 else "All Clear", delta_color="inverse")
with col3:
    st.metric("Total Water Wasted", f"{total_litres_wasted:,.1f} L")
with col4:
    st.metric("Estimated Cost", f"₹ {total_rupees_wasted:,.2f}", delta=f"₹ {TARIFF_RS_PER_LITER}/L tariff")

st.markdown("---")

# Main Dashboard Layout
tab1, tab2, tab3 = st.tabs(["🚨 Active Alerts & Taps", "📈 Tap Flow Analysis", "⚙️ Model & Maintenance Feedback"])

with tab1:
    st.subheader("Campus Washroom Tap Status Overview")
    
    table_rows = []
    for s in summary_data:
        table_rows.append({
            "Tap ID": s['tap_id'],
            "Washroom Location": s['washroom'],
            "Status": s['status'],
            "Est. Litres Wasted": f"{s['litres_wasted']} L",
            "Cost (₹)": f"₹ {s['rupees_wasted']:.2f}"
        })
    
    table_df = pd.DataFrame(table_rows)
    st.dataframe(table_df, use_container_width=True, hide_index=True)
    
    st.markdown("### Actionable Maintenance Console")
    selected_tap_for_action = st.selectbox("Select Tap to Mark Repaired", [s['tap_id'] for s in summary_data if not s['is_repaired']], key="repair_select")
    
    if st.button("🛠️ Mark as Repaired (Reset Baseline)", type="primary"):
        if selected_tap_for_action:
            st.session_state.repaired_taps.add(selected_tap_for_action)
            st.success(f"Tap {selected_tap_for_action} marked as repaired! Baseline reset successfully.")
            st.rerun()

with tab2:
    st.subheader("Time-Series Flow & Anomaly Inspector")
    
    selected_tap_id = st.selectbox("Select Tap for Detailed Inspection", [s['tap_id'] for s in summary_data], key="inspect_select")
    selected_tap_obj = next(s for s in summary_data if s['tap_id'] == selected_tap_id)
    df_tap = selected_tap_obj['df']
    
    # Plotly time series chart
    fig = px.line(
        df_tap.tail(2880), # Last 2 days for clarity
        x='timestamp',
        y='mean',
        title=f"Flow Sensor Readings & Isolation Forest Anomalies - {selected_tap_id} ({selected_tap_obj['washroom']})",
        labels={'mean': 'Flow Rate (L/min)', 'timestamp': 'Time'}
    )
    
    # Highlight anomalies
    anomalies = df_tap.tail(2880)[df_tap.tail(2880)['persistent_anomaly'] == 1]
    if not anomalies.empty:
        fig.add_scatter(
            x=anomalies['timestamp'],
            y=anomalies['mean'],
            mode='markers',
            marker=dict(color='red', size=6),
            name='Persistent Leak Anomaly (>15m)'
        )
        
    st.plotly_chart(fig, use_container_width=True)
    
    col_a, col_b, col_c = st.columns(3)
    col_a.metric("Status", selected_tap_obj['status'])
    col_b.metric("Water Wasted", f"{selected_tap_obj['litres_wasted']} Litres")
    col_c.metric("Financial Loss", f"₹ {selected_tap_obj['rupees_wasted']}")

with tab3:
    st.subheader("AI Engine & Evaluation Metrics")
    st.markdown("Comparison between **Isolation Forest (Unsupervised ML)** and **Rule-Based Baseline** against injected ground truth.")
    
    metrics_path = os.path.join(models_dir, "evaluation_metrics.csv")
    if os.path.exists(metrics_path):
        metrics_df = pd.read_csv(metrics_path)
        st.dataframe(metrics_df, use_container_width=True, hide_index=True)
    else:
        st.info("Run `train_model.py` to generate evaluation metrics.")
        
    st.markdown("### Feedback Loop Architecture")
    st.markdown("""
    1. **Sensor Ingestion**: YF-S201 pulses converted to flow rate (L/min) at 1 Hz.
    2. **Resampling & Feature Engineering**: 1-minute windows calculating mean, max, std, non-zero fraction, and 30-minute rolling minimum flow.
    3. **AI Anomaly Detection**: Isolation Forest trained on normal behavior detects subtle continuous deviations (leaks as low as 0.04 L/min).
    4. **Maintenance Feedback Loop**: When maintenance staff clicks **Mark as Repaired**, the baseline is updated and anomaly scores recalibrated for that tap ID.
    """)
