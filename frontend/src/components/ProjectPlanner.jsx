import React, { useState, useEffect } from 'react';
import { Calendar, Layers, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, Clock, Users, DollarSign, Building } from 'lucide-react';
import { generateProjectPlan } from '../api/client';

export default function ProjectPlanner({ onUpdateReport }) {
  const [projectName, setProjectName] = useState('Apex Commercial Complex');
  const [projectType, setProjectType] = useState('Commercial');
  const [areaSqft, setAreaSqft] = useState(45000);
  const [budgetUsd, setBudgetUsd] = useState(3200000);
  const [durationMonths, setDurationMonths] = useState(14);
  const [location, setLocation] = useState('Dallas, TX');
  const [soilCondition, setSoilCondition] = useState('Standard Clay / Sandy Silt');
  const [floors, setFloors] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateProjectPlan({
        project_name: projectName,
        project_type: projectType,
        total_built_up_area_sqft: Number(areaSqft),
        target_budget_usd: Number(budgetUsd),
        target_duration_months: Number(durationMonths),
        location,
        soil_condition: soilCondition,
        floors: Number(floors),
      });
      setResult(data);
      if (onUpdateReport) onUpdateReport('planning', data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* Left Column: Parameters */}
      <div className="lg:col-span-4 space-y-4">
        <div className="tactical-card p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase font-mono">
                Project Parameters
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#101b33] border border-[#1e2f54] text-slate-300">
              CPM Scheduler
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Project Title</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="eng-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Typology</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="eng-select"
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Industrial">Industrial</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Floors</label>
              <input
                type="number"
                min="1"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                className="eng-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Gross Area (sqft)</label>
              <input
                type="number"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                className="eng-input font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Duration (Months)</label>
              <input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                className="eng-input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Budget ($ USD)</label>
            <input
              type="number"
              value={budgetUsd}
              onChange={(e) => setBudgetUsd(e.target.value)}
              className="eng-input font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="eng-input"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Soil / Geotech Condition</label>
            <input
              type="text"
              value={soilCondition}
              onChange={(e) => setSoilCondition(e.target.value)}
              className="eng-input"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Layers className="w-3.5 h-3.5 text-slate-950" />}
            <span>{loading ? 'Synthesizing Schedule...' : 'Generate CPM Project Plan'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Schedule & WBS */}
      <div className="lg:col-span-8 space-y-4">
        {result ? (
          <>
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="tactical-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Total Duration</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-xl font-bold font-mono text-slate-100 block">{result.estimated_total_weeks} Weeks</span>
                <span className="text-[10px] text-slate-400 font-mono">{(result.estimated_total_weeks / 4.33).toFixed(1)} Months</span>
              </div>
              <div className="tactical-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Total Budget</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-xl font-bold font-mono text-amber-400 block">${(result.estimated_budget_usd / 1e6).toFixed(2)}M</span>
                <span className="text-[10px] text-slate-400 font-mono">${(result.estimated_budget_usd / areaSqft).toFixed(0)} / sqft</span>
              </div>
              <div className="tactical-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">WBS Stages</span>
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-xl font-bold font-mono text-slate-100 block">{result.phases.length} Phases</span>
                <span className="text-[10px] text-slate-400 font-mono">Sequential Tasks</span>
              </div>
              <div className="tactical-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase">Peak Workforce</span>
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400 block">
                  {Math.max(...result.phases.map(p => p.labor_headcount))} Workers
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Concurrent Trades</span>
              </div>
            </div>

            {/* WBS & Gantt Timeline Card */}
            <div className="tactical-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1c2d4f] gap-2">
                <div className="space-y-0.5">
                  <span className="font-semibold text-xs tracking-wider uppercase text-slate-100 font-mono block">
                    Work Breakdown Structure &amp; Gantt Timeline
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">Critical Path Method (CPM) Schedule Decomposition</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-300">Critical Path</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-300">Standard Float</span>
                  </div>
                </div>
              </div>

              {/* Timeline Axis Header */}
              <div className="px-2 py-1 rounded bg-[#090f1f] border border-[#1a2947] text-[10px] font-mono text-slate-400 flex justify-between">
                <span>Start: Week 1</span>
                <span>Midpoint: Week {Math.round(result.estimated_total_weeks / 2)}</span>
                <span>Completion: Week {result.estimated_total_weeks}</span>
              </div>

              <div className="space-y-3">
                {result.phases.map((ph) => (
                  <div key={ph.phase_id} className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2b4172] transition space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#131d36] text-amber-300 border border-[#21345d]">
                          {ph.phase_id}
                        </span>
                        <span className="font-bold text-slate-100">{ph.phase_name}</span>
                        {ph.critical_path && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Critical Path
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                        <span>{ph.labor_headcount} workers</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="font-bold text-slate-200">Weeks {ph.start_week}&ndash;{ph.end_week}</span>
                        <span className="text-slate-400">({ph.duration_weeks}w)</span>
                      </div>
                    </div>

                    {/* Calibrated Gantt Bar Container */}
                    <div className="w-full h-2.5 bg-[#0e162a] rounded-full overflow-hidden p-0.5 border border-[#1b2b4d] relative">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ph.critical_path 
                            ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-sm shadow-rose-500/30' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/30'
                        }`}
                        style={{
                          marginLeft: `${(ph.start_week / result.estimated_total_weeks) * 100}%`,
                          width: `${Math.max(6, (ph.duration_weeks / result.estimated_total_weeks) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="tactical-card p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-semibold text-slate-200 block">No Project Schedule Loaded</span>
              <span className="text-xs text-slate-400 max-w-sm block">Click &quot;Generate CPM Project Plan&quot; to compute critical path decomposition.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
