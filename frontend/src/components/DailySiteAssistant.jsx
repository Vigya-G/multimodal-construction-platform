import React, { useState, useEffect } from 'react';
import { ClipboardList, AlertCircle, CheckCircle2, Clock, Sparkles, RefreshCw, Users, ShieldAlert, Calendar, UserCheck } from 'lucide-react';
import { processDailyLog } from '../api/client';

export default function DailySiteAssistant({ onUpdateReport }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supervisor, setSupervisor] = useState('Marcus Vance');
  const [headcount, setHeadcount] = useState(34);
  const [weatherObserved, setWeatherObserved] = useState('Clear, 28°C');
  const [fieldNotes, setFieldNotes] = useState(
    'Poured 120 cubic yards of concrete on Floor 3 slab. Ready-mix transit mixer delayed 1.5 hours due to highway accident. 4 masons absent today. Steel delivery arrived at 2 PM. Minor scaffold tie wire loose on north bay, fixed on spot. Rebar crew completed column cages for Floor 4.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    handleProcess();
  }, []);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const data = await processDailyLog({
        date,
        supervisor_name: supervisor,
        workforce_headcount: Number(headcount),
        weather_observed: weatherObserved,
        raw_field_notes: fieldNotes,
      });
      setResult(data);
      if (onUpdateReport) onUpdateReport('daily_log', data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* Left Column: Field Form */}
      <div className="lg:col-span-4 space-y-4">
        <div className="tactical-card p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase font-mono">
                Daily Field Ingestion
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#101b33] border border-[#1e2f54] text-slate-300">
              Shift Log
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="eng-input font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Supervisor</label>
              <input
                type="text"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="eng-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Headcount</label>
              <input
                type="number"
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                className="eng-input font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Weather Observed</label>
              <input
                type="text"
                value={weatherObserved}
                onChange={(e) => setWeatherObserved(e.target.value)}
                className="eng-input"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-slate-400">Raw Field Notes</label>
              <span className="text-[10px] text-slate-400 font-mono">Speech / Text Log</span>
            </div>
            <textarea
              rows="6"
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="eng-input font-sans leading-relaxed resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleProcess}
            disabled={loading}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <ClipboardList className="w-3.5 h-3.5 text-slate-950" />}
            <span>{loading ? 'Processing Natural Language...' : 'Process Field Notes'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Extracted Intelligence */}
      <div className="lg:col-span-8 space-y-4">
        {result ? (
          <>
            {/* Executive Summary Card */}
            <div className="tactical-card p-5 space-y-2.5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  EXECUTIVE SUMMARY
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {date} &bull; {supervisor} ({headcount} Crew)
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{result.executive_summary}</p>
            </div>

            {/* Verified Progress Highlights */}
            <div className="tactical-card p-5 space-y-3">
              <span className="font-semibold text-xs tracking-wider uppercase text-emerald-400 flex items-center space-x-2 pb-2 border-b border-[#1c2d4f] font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Progress Highlights</span>
              </span>
              <ul className="space-y-2 pt-1 text-xs text-slate-300">
                {result.progress_highlights.map((p, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade Delays & Bottlenecks */}
            <div className="tactical-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
                <span className="font-semibold text-xs tracking-wider uppercase text-amber-400 flex items-center space-x-2 font-mono">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Trade Delays &amp; Bottlenecks</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {result.delays_and_bottlenecks.reduce((acc, curr) => acc + (curr.delay_hours || 0), 0)}h Total Delay
                </span>
              </div>
              <div className="space-y-2.5 pt-1">
                {result.delays_and_bottlenecks.map((d, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2b4172] transition flex flex-wrap justify-between items-center text-xs gap-2">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-100 block">{d.issue}</span>
                      <span className="text-[11px] text-slate-400">{d.impact}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs shrink-0">
                      +{d.delay_hours} hrs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next-Day Action Punch List */}
            <div className="tactical-card p-5 space-y-3">
              <span className="font-semibold text-xs tracking-wider uppercase text-slate-100 font-mono block pb-2 border-b border-[#1c2d4f]">
                Next-Day Action Punch List (Priority Sequence)
              </span>
              <ol className="space-y-2.5 pt-1 text-xs text-slate-300">
                {result.next_day_punch_list.map((task, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-md bg-[#131d36] text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#233863] shadow-sm">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{task}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <div className="tactical-card p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-semibold text-slate-200 block">No Daily Log Processed</span>
              <span className="text-xs text-slate-400 max-w-sm block">Click &quot;Process Field Notes&quot; to synthesize progress, bottlenecks, and punch list.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
