import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Building2, 
  ClipboardList, 
  CloudRain, 
  MessageSquareCode 
} from 'lucide-react';

import Navbar from './components/Navbar';
import SafetyInspector from './components/SafetyInspector';
import CrackAnalyzer from './components/CrackAnalyzer';
import ProjectPlanner from './components/ProjectPlanner';
import RealEstateValuer from './components/RealEstateValuer';
import DailySiteAssistant from './components/DailySiteAssistant';
import WeatherAdvisor from './components/WeatherAdvisor';
import KnowledgeBot from './components/KnowledgeBot';
import ReportModal from './components/ReportModal';

const TABS = [
  { id: 'safety', label: 'Site Safety', icon: ShieldCheck },
  { id: 'crack', label: 'Crack Analysis', icon: Activity },
  { id: 'planning', label: 'Project Planner', icon: Calendar },
  { id: 'valuation', label: 'Real Estate Valuer', icon: Building2 },
  { id: 'daily_log', label: 'Daily Assistant', icon: ClipboardList },
  { id: 'weather', label: 'Weather Advisor', icon: CloudRain },
  { id: 'chat', label: 'Knowledge Bot', icon: MessageSquareCode },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('safety');
  const [uiState, setUiState] = useState('results'); // 'results' | 'empty' | 'loading' | 'error'
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [reportData, setReportData] = useState({
    safety: null,
    crack: null,
    planning: null,
    valuation: null,
    daily_log: null,
    weather: null,
  });

  const handleUpdateReport = (moduleName, data) => {
    setReportData(prev => ({
      ...prev,
      [moduleName]: data,
    }));
  };

  const handleLoadPreset = () => {
    window.dispatchEvent(new CustomEvent('load_preset_sample'));
  };

  const handleRunAudit = () => {
    window.dispatchEvent(new CustomEvent('run_active_audit'));
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-[#e2e8f0] flex flex-col font-sans select-none pb-12">
      {/* Top Main Navbar */}
      <Navbar
        onLoadPreset={handleLoadPreset}
        onOpenReport={() => setIsReportOpen(true)}
        onRunAudit={handleRunAudit}
      />

      {/* Navigation Tabs Bar */}
      <div 
        role="tablist"
        aria-label="Platform Feature Modules"
        className="border-b border-[#1c2d4f] bg-[#090f1f]/85 backdrop-blur-md sticky top-16 z-40"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs transition duration-150 whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#14203d] text-amber-300 font-semibold border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e172a] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'safety' && (
            <SafetyInspector 
              uiState={uiState} 
              onUpdateReport={handleUpdateReport} 
            />
          )}

          {activeTab === 'crack' && (
            <CrackAnalyzer onUpdateReport={handleUpdateReport} />
          )}

          {activeTab === 'planning' && (
            <ProjectPlanner onUpdateReport={handleUpdateReport} />
          )}

          {activeTab === 'valuation' && (
            <RealEstateValuer onUpdateReport={handleUpdateReport} />
          )}

          {activeTab === 'daily_log' && (
            <DailySiteAssistant onUpdateReport={handleUpdateReport} />
          )}

          {activeTab === 'weather' && (
            <WeatherAdvisor onUpdateReport={handleUpdateReport} />
          )}

          {activeTab === 'chat' && (
            <KnowledgeBot />
          )}
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="border-t border-[#1c2d4f] bg-[#070c18] py-3 px-4 sm:px-6 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>FastAPI &bull; React &bull; Gemini Vision &bull; OSHA 1926 &amp; ACI 318 Standard Reference</span>
          </div>

          {/* Root-Level Demo-State Switcher inside Footer Area */}
          {activeTab === 'safety' && (
            <div className="flex items-center p-0.5 rounded-lg bg-[#0b1224] border border-[#1e2f54] space-x-1 text-xs shadow-inner">
              <span className="text-[10px] uppercase font-mono text-slate-400 px-2 select-none">Preview State:</span>
              {['results', 'empty', 'loading', 'error'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setUiState(st)}
                  className={`px-2.5 py-0.5 rounded-md capitalize transition duration-150 cursor-pointer font-medium text-[11px] ${
                    uiState === st 
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#14203b]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3">
            {/* Demo Mode Toggle */}
            <div 
              role="switch"
              aria-checked={demoMode}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDemoMode(!demoMode); } }}
              className="flex items-center space-x-2 cursor-pointer select-none group" 
              onClick={() => setDemoMode(!demoMode)}
              title="Toggle offline demo sample dataset"
            >
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition duration-150 ${demoMode ? 'bg-amber-500' : 'bg-[#1b2844]'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-slate-950 transition transform shadow-sm ${demoMode ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-slate-300 font-medium text-xs group-hover:text-white transition">Demo Mode</span>
            </div>

            <span className="text-slate-600">&bull;</span>

            {/* Debug link */}
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="text-slate-400 hover:text-amber-400 transition underline decoration-slate-600 hover:decoration-amber-400 underline-offset-2 cursor-pointer text-xs"
            >
              {showDebug ? 'Hide Latency / Telemetry' : 'Show Latency / Telemetry'}
            </button>
          </div>
        </div>

        {/* Debug Drawer */}
        {showDebug && (
          <div className="max-w-[1600px] mx-auto mt-2.5 p-3 rounded-lg bg-[#0b1224] border border-[#1c2d4f] text-[11px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Inference Target: <strong className="text-slate-100">Gemini 1.5 Flash Vision / Calibrated Engine</strong></span>
              <span className="text-slate-600">&bull;</span>
              <span>Latency: <strong className="text-amber-400 font-bold">124ms</strong></span>
              <span className="text-slate-600">&bull;</span>
              <span>Host: <code className="text-slate-300">127.0.0.1:8000</code></span>
            </div>
            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              WebSocket / Polling Active
            </span>
          </div>
        )}
      </footer>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={reportData}
      />
    </div>
  );
}
