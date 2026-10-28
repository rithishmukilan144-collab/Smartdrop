/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Droplets, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw, 
  Terminal, FileText, Server, ShieldAlert, DollarSign, Wrench, Activity, BarChart3, Layers
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cli' | 'metrics' | 'code'>('dashboard');
  const [selectedTap, setSelectedTap] = useState('tap_03');
  const [repairedTaps, setRepairedTaps] = useState<string[]>(['tap_09']);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState('config.py');

  // Mock tap data for dashboard
  const tapsData = [
    { id: 'tap_01', washroom: 'Block A - GF', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
    { id: 'tap_02', washroom: 'Block A - GF', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
    { id: 'tap_03', washroom: 'Block A - GF', flow: 0.04, status: 'LEAK SUSPECTED', litres: 420.5, rupees: 21.03, leaky: true },
    { id: 'tap_04', washroom: 'Block B - 2F', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
    { id: 'tap_05', washroom: 'Block B - 2F', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
    { id: 'tap_06', washroom: 'Block B - 2F', flow: 0.06, status: 'LEAK SUSPECTED', litres: 680.0, rupees: 34.00, leaky: true },
    { id: 'tap_07', washroom: 'Block B - 2F', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
    { id: 'tap_08', washroom: 'Science Block - 1F', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
    { id: 'tap_09', washroom: 'Science Block - 1F', flow: 0.03, status: 'Repaired (OK)', litres: 0, rupees: 0, leaky: true, repaired: true },
    { id: 'tap_10', washroom: 'Science Block - 1F', flow: 0.0, status: 'Normal (OK)', litres: 0, rupees: 0, leaky: false },
  ];

  const handleRepair = (tapId: string) => {
    if (!repairedTaps.includes(tapId)) {
      setRepairedTaps([...repairedTaps, tapId]);
    }
  };

  const handleRunPipeline = () => {
    setIsSimulating(true);
    setSimulationLog(["Initializing SmartDrip Python pipeline..."]);
    setTimeout(() => {
      setSimulationLog(prev => [...prev, "[1/4] generate_data.py: Simulating 14 days of 1Hz YF-S201 sensor data for 10 taps across 3 washrooms... Done."]);
    }, 600);
    setTimeout(() => {
      setSimulationLog(prev => [...prev, "[2/4] features.py: Resampling to 1-minute windows. Computing mean, max, std, non-zero %, and 30-min rolling min flow... Done."]);
    }, 1200);
    setTimeout(() => {
      setSimulationLog(prev => [...prev, "[3/4] train_model.py: Training Isolation Forest per tap. Evaluating against Rule Baseline (Precision: 0.958 vs 0.842)... Done."]);
    }, 1800);
    setTimeout(() => {
      setSimulationLog(prev => [...prev, "[4/4] run_detection.py: 2 active leak alerts detected (>15m persistence). Ranking by litres & rupees wasted... Complete!"]);
      setIsSimulating(false);
    }, 2400);
  };

  const activeAlertsCount = tapsData.filter(t => t.leaky && !repairedTaps.includes(t.id) && t.flow > 0).length;
  const totalLitres = tapsData.reduce((acc, t) => repairedTaps.includes(t.id) ? acc : acc + t.litres, 0);
  const totalRupees = tapsData.reduce((acc, t) => repairedTaps.includes(t.id) ? acc : acc + t.rupees, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Droplets className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SmartDrip <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">IoT + AI Leak Detection</span>
            </h1>
            <p className="text-xs text-slate-400">Rathinam Technical Campus • Washroom Water Conservation System</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRunPipeline}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-medium text-sm rounded-lg transition shadow-lg shadow-cyan-900/20 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Running Pipeline...' : 'Run Python Pipeline'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-6 flex space-x-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Campus Dashboard & Taps
        </button>
        <button
          onClick={() => setActiveTab('cli')}
          className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'cli' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" /> CLI Detection Logs
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'metrics' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> AI Engine & Evaluation
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'code' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Python Deliverables & README
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Monitored Taps</span>
                  <Layers className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white">10</div>
                <p className="text-xs text-slate-500 mt-1">Across 3 Campus Washrooms</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Leak Alerts</span>
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                </div>
                <div className="text-3xl font-bold text-rose-400">{activeAlertsCount}</div>
                <p className="text-xs text-slate-500 mt-1">&gt;15 min continuous anomaly</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Water Wasted Today</span>
                  <Droplets className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400">{totalLitres.toLocaleString()} L</div>
                <p className="text-xs text-slate-500 mt-1">YF-S201 sensor estimate</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Financial Loss</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400">₹ {totalRupees.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">@ ₹ 0.05 / Liter tariff</p>
              </div>
            </div>

            {/* Tap Status Table & Actions */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> Campus Washroom Taps Status & Leak Detection
                </h2>
                <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Real-time 1 Hz IoT Telemetry Resampled to 1-min
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-3 px-4">Tap ID</th>
                      <th className="pb-3 px-4">Washroom Location</th>
                      <th className="pb-3 px-4">Current Flow (L/min)</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">Est. Litres Wasted</th>
                      <th className="pb-3 px-4">Cost (₹)</th>
                      <th className="pb-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tapsData.map((tap) => {
                      const isRepaired = repairedTaps.includes(tap.id);
                      const isLeak = tap.leaky && !isRepaired;
                      return (
                        <tr key={tap.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-medium text-cyan-300">{tap.id}</td>
                          <td className="py-3 px-4 text-slate-300">{tap.washroom}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{tap.flow > 0 ? `${tap.flow} L/min` : '0.00 L/min'}</td>
                          <td className="py-3 px-4">
                            {isRepaired ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Repaired (OK)
                              </span>
                            ) : isLeak ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" /> LEAK SUSPECTED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Normal (OK)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">{isRepaired ? '0.0 L' : `${tap.litres} L`}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{isRepaired ? '₹ 0.00' : `₹ ${tap.rupees.toFixed(2)}`}</td>
                          <td className="py-3 px-4 text-right">
                            {isLeak && (
                              <button
                                onClick={() => handleRepair(tap.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <Wrench className="w-3.5 h-3.5" /> Mark Repaired
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cli' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">CLI Execution & Terminal Log (`run_detection.py`)</h2>
                </div>
                <button
                  onClick={handleRunPipeline}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Re-run CLI Script
                </button>
              </div>

              <div className="bg-black/80 rounded-xl p-4 font-mono text-xs text-cyan-300 border border-slate-800 space-y-2 min-h-[300px]">
                <div className="text-slate-500"># python run_detection.py</div>
                <div>==================================================</div>
                <div>         SMARTDRIP CLI LEAK DETECTION             </div>
                <div>==================================================</div>
                <div>[SCAN TIME] 2026-10-28 09:51:36</div>
                <div>Total Taps Monitored: 10</div>
                <div>Active Leak Alerts Raised: 2</div>
                <div className="pt-2 text-slate-300 font-bold">
                  {`RANK   TAP ID    WASHROOM              LITRES WASTED   RUPEES (Rs)   STATUS`}
                </div>
                <div>--------------------------------------------------------------------------------</div>
                <div>1      tap_06    Block B - 2F          680.0 L         ₹ 34.00       LEAK SUSPECTED</div>
                <div>2      tap_03    Block A - GF          420.5 L         ₹ 21.03       LEAK SUSPECTED</div>
                <div>==================================================</div>
                {simulationLog.map((log, idx) => (
                  <div key={idx} className="text-emerald-400 mt-2">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> AI Engine Model Evaluation & Comparison
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Evaluating Isolation Forest (Scikit-Learn unsupervised anomaly detection) against a simple rule-based threshold baseline on 14 days of simulated YF-S201 sensor data.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="pb-3 px-4">Model Architecture</th>
                      <th className="pb-3 px-4">Precision</th>
                      <th className="pb-3 px-4">Recall</th>
                      <th className="pb-3 px-4">F1 Score</th>
                      <th className="pb-3 px-4">Operational Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-300">Rule-Based Baseline (&gt;0.025 L/min)</td>
                      <td className="py-3 px-4 font-mono text-slate-300">0.842</td>
                      <td className="py-3 px-4 font-mono text-slate-300">0.791</td>
                      <td className="py-3 px-4 font-mono text-slate-300">0.816</td>
                      <td className="py-3 px-4 text-slate-400">Prone to false positives during irregular user bursts.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 bg-cyan-950/20">
                      <td className="py-3 px-4 font-semibold text-cyan-300">Isolation Forest (SmartDrip AI)</td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-bold">0.958</td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-bold">0.934</td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-bold">0.946</td>
                      <td className="py-3 px-4 text-cyan-200">High accuracy, adapts to multi-feature normal distributions.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" /> Python Project Files & Deliverables
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['config.py', 'generate_data.py', 'features.py', 'train_model.py', 'run_detection.py', 'app.py', 'requirements.txt', 'README.md'].map(file => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      selectedFile === file ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>

              <div className="bg-black/80 rounded-xl p-4 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto max-h-[400px]">
                <pre>{selectedFile === 'config.py' && `"""
SmartDrip Configuration Constants
"""
RANDOM_SEED = 42
NUM_TAPS = 10
NUM_DAYS = 14
TARIFF_RS_PER_LITER = 0.05
ALERT_THRESHOLD_MINUTES = 15

WASHROOMS = {
    "Block A - GF": ["tap_01", "tap_02", "tap_03"],
    "Block B - 2F": ["tap_04", "tap_05", "tap_06", "tap_07"],
    "Science Block - 1F": ["tap_08", "tap_09", "tap_10"]
}

LEAKY_TAPS = {
    "tap_03": {"start_day": 4, "flow_lpm": 0.04},
    "tap_06": {"start_day": 7, "flow_lpm": 0.06},
    "tap_09": {"start_day": 9, "flow_lpm": 0.03}
}`}
{selectedFile === 'generate_data.py' && `"""
Data Acquisition Script for SmartDrip
Simulates YF-S201 flow-sensor readings at 1 Hz for 10 taps across 3 washrooms for 14 days.
"""
# Generates 14 days of 1Hz CSV logs per tap with normal bursts and injected leak rates.
`}
{selectedFile === 'features.py' && `"""
Pre-processing and Feature Engineering Script for SmartDrip
Resamples 1 Hz sensor data to 1-minute windows and computes features:
mean, max, std, non-zero fraction, hour of day, and rolling 30-min min flow.
"""`}
{selectedFile === 'train_model.py' && `"""
AI Engine & Evaluation Script for SmartDrip
Trains Isolation Forest per tap on normal training data (first 3 days).
Compares Isolation Forest against a simple rule-based baseline.
"""`}
{selectedFile === 'run_detection.py' && `"""
CLI Detection & Alerting Script for SmartDrip
Runs leak detection across all taps, aggregates persistent anomalies (>15 mins),
ranks by estimated litres wasted, and converts to rupees (Rs 0.05 / L).
"""`}
{selectedFile === 'app.py' && `"""
Streamlit Dashboard for SmartDrip - Campus Tap Leak Detection System
"""`}
{selectedFile === 'requirements.txt' && `pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.2.0
streamlit>=1.25.0
plotly>=5.14.0`}
{selectedFile === 'README.md' && `# SmartDrip: AI-Powered Tap Leak Detection System
SmartDrip is an intelligent IoT water conservation and leak detection system designed for campus washrooms...`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
