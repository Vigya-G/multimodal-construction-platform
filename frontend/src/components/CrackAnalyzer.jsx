import React, { useState } from 'react';
import { UploadCloud, AlertTriangle, Shield, RefreshCw, Eye, Sparkles, Hammer, Check, AlertOctagon } from 'lucide-react';
import { analyzeCrackFile, analyzeCrackJson } from '../api/client';

export default function CrackAnalyzer({ onUpdateReport }) {
  const [structuralElement, setStructuralElement] = useState('Beam');
  const [concreteGrade, setConcreteGrade] = useState('M25 / 3500 PSI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState({
    structural_element: 'Reinforced Concrete Transfer Beam',
    crack_detected: true,
    crack_classification: 'Shear Crack',
    estimated_width_mm: 2.4,
    severity: 'Severe',
    structural_risk_rating: 'High',
    cause_analysis: 'Distinct 45-degree diagonal tension fracture propagating from support toward neutral axis. Indicates primary shear stress exceedance and potential undersized shear stirrup reinforcement or excessive concentrated live load.',
    code_reference: 'ACI 318-19 Section 9.5 (Design Shear Strength) & ACI 224R-01 (Tolerable Crack Widths: Limit 0.40mm for interior exposure)',
    immediate_actions: [
      'Erect temporary heavy-duty hydraulic screw jacks (shore props) beneath the beam at one-third span immediately.',
      'Cordon off the floor area directly above and beneath the affected bay to eliminate transient live loads.',
      'Affix calibrated acrylic tell-tale crack motion monitors across the crack face to record active movement.'
    ],
    remediation_protocol: [
      'Perform ultrasonic pulse velocity (UPV) or core sampling to map internal crack depth and rebar debonding.',
      'Surface preparation and low-viscosity epoxy pressure injection conforming to ASTM C881 Type I/IV.',
      'Structural strengthening via high-modulus Carbon Fiber Reinforced Polymer (CFRP) U-wrap laminate jackets around the shear span.'
    ]
  });

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCrackJson({
        structural_element: structuralElement,
        concrete_grade: concreteGrade,
        image_base64: 'demo_beam',
      });
      setResult(data);
      if (onUpdateReport) onUpdateReport('crack', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* Left Column: Form & Scan Config */}
      <div className="lg:col-span-4 space-y-4">
        <div className="tactical-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase font-mono">
                Structural Image Ingestion
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#101b33] border border-[#1e2f54] text-slate-300">
              ACI 318 Triage
            </span>
          </div>

          <div className="border-2 border-dashed border-[#243962] hover:border-amber-400/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#090f1f]/80 group transition duration-150">
            <div className="w-10 h-10 rounded-full bg-[#121d38] group-hover:bg-[#19284d] flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition mb-2.5 border border-[#203259]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-200 font-medium">Click to upload structural surface photo</span>
            <span className="text-[11px] text-slate-400 mt-1">High-resolution concrete or masonry close-up</span>

            <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#0e172a] border border-[#203358] text-[11px] text-slate-200 flex items-center space-x-2 w-full justify-between shadow-inner">
              <div className="flex items-center space-x-2 truncate">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="truncate font-medium">RC_Transfer_Beam_B4.jpg</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">(6.2MB)</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Structural Element</label>
              <select
                value={structuralElement}
                onChange={(e) => setStructuralElement(e.target.value)}
                className="eng-select"
              >
                <option value="Beam">Reinforced Concrete Beam</option>
                <option value="Column">Reinforced Concrete Column</option>
                <option value="Slab">Suspended Two-Way Slab</option>
                <option value="Retaining Wall">Basement Retaining Wall</option>
                <option value="Foundation">Foundation Footing / Raft</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Concrete Design Grade</label>
              <input
                type="text"
                value={concreteGrade}
                onChange={(e) => setConcreteGrade(e.target.value)}
                className="eng-input font-mono"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={loading}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Eye className="w-3.5 h-3.5 text-slate-950" />}
              <span>{loading ? 'Analyzing Morphology...' : 'Run Forensic Crack Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Forensic Diagnosis */}
      <div className="lg:col-span-8 space-y-4">
        {result && (
          <>
            {/* Banner Card */}
            <div className="tactical-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1c2d4f] gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    DIAGNOSED CRACK MORPHOLOGY
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 tracking-tight mt-0.5">{result.crack_classification}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>{result.structural_risk_rating} Risk</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54]">
                  <span className="text-[10px] text-slate-400 block font-mono">Est. Max Width</span>
                  <span className="text-xl font-mono font-extrabold text-rose-400 mt-0.5 block">{result.estimated_width_mm} mm</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">ACI Limit: 0.40 mm</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54]">
                  <span className="text-[10px] text-slate-400 block font-mono">Severity Tier</span>
                  <span className="text-base font-bold text-slate-100 mt-1 block">{result.severity}</span>
                  <span className="text-[10px] text-amber-400/90 font-mono block mt-1">Requires Shoring</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54]">
                  <span className="text-[10px] text-slate-400 block font-mono">Component</span>
                  <span className="text-xs font-semibold text-slate-200 mt-1 block truncate" title={result.structural_element}>
                    {result.structural_element}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">Critical Transfer</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wide block">
                  Root Cause Mechanism:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.cause_analysis}</p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-[#1c2d4f] flex flex-wrap justify-between items-center gap-2">
                <span className="font-medium">Design Code Reference:</span>
                <span className="font-mono text-slate-300 bg-[#090f1f] px-2 py-0.5 rounded border border-[#1e2f54]">
                  {result.code_reference}
                </span>
              </div>
            </div>

            {/* Shoring & Safety Actions */}
            <div className="tactical-card p-4 space-y-2.5">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wide flex items-center space-x-2 pb-1 border-b border-[#1c2d4f]">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Immediate Structural Safety Actions (Priority 1)</span>
              </span>
              <ul className="space-y-2 pt-1">
                {result.immediate_actions.map((act, i) => (
                  <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5"></span>
                    <span className="leading-relaxed">{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Remediation Protocol */}
            <div className="tactical-card p-4 space-y-2.5">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-2 pb-1 border-b border-[#1c2d4f]">
                <Hammer className="w-4 h-4 text-amber-400" />
                <span>Permanent Remediation Protocol (Engineered Repairs)</span>
              </span>
              <ol className="space-y-2.5 pt-1">
                {result.remediation_protocol.map((step, i) => (
                  <li key={i} className="flex items-start space-x-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-md bg-[#131d36] text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#233863] shadow-sm">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
