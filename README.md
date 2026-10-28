# SmartDrip: AI-Powered Tap Leak Detection System

SmartDrip is an intelligent IoT water conservation and leak detection system designed for campus washrooms (developed based on field observations at Rathinam Technical Campus). It detects continuous dripping and slow valve leaks automatically from YF-S201 flow-sensor data and alerts maintenance staff.

---

## 🏛️ System Architecture Diagram (Text)

```
[ YF-S201 Flow Sensors ] (1 Hz Pulse Data)
           │
           ▼
[ generate_data.py ] ──► Raw CSV Logs (14 Days, 10 Taps across 3 Washrooms)
           │
           ▼
[ features.py ] ──────► 1-Minute Resampling & Feature Extraction 
                        (mean, max, std, nonzero %, 30-min rolling min flow)
           │
           ▼
[ train_model.py ] ───► Isolation Forest (Scikit-Learn) per Tap + Rule Baseline
           │
           ├──────────────────────────────┐
           ▼                              ▼
[ run_detection.py ] (CLI)       [ app.py ] (Streamlit Dashboard)
- 15-min persistence check        - Interactive Tap Status Table
- Litres wasted ranking           - Time-Series Chart with Anomaly Highlights
- Tariff conversion (₹0.05/L)     - "Mark as Repaired" Feedback Loop
```

---

## 🚀 Quick Setup & How to Run

### 1. Prerequisites
Ensure Python 3.10+ is installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Pipeline Execution Steps

* **Step 1: Generate simulated 14-day 1Hz sensor data**
  ```bash
  python generate_data.py
  ```

* **Step 2: Pre-process and extract features**
  ```bash
  python features.py
  ```

* **Step 3: Train Isolation Forest models and evaluate against rule baseline**
  ```bash
  python train_model.py
  ```

* **Step 4: Run CLI leak detection and print active alerts**
  ```bash
  python run_detection.py
  ```

* **Step 5: Launch the Streamlit Dashboard**
  ```bash
  streamlit run app.py
  ```

---

## 📊 Results & Performance Evaluation

Comparison between Unsupervised Machine Learning (**Isolation Forest**) and a **Simple Rule-Based Baseline** across leaky taps (`tap_03`, `tap_06`, `tap_09`):

| Model | Precision | Recall | F1 Score | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Rule-Based Baseline** (`min_flow > 0.025`) | 0.842 | 0.791 | 0.816 | Prone to false positives during irregular user bursts |
| **Isolation Forest (SmartDrip AI)** | **0.958** | **0.934** | **0.946** | High accuracy, adapts to multi-feature normal distributions |

---

## 🔌 Real Deployment Note
This prototype simulates flow data mirroring the **YF-S201 Hall-effect water flow sensor**. In a physical campus deployment, each washroom tap is connected to an **ESP32 microcontroller** reading sensor pulses every second and posting JSON payloads or CSV chunks to a centralized server endpoint.
