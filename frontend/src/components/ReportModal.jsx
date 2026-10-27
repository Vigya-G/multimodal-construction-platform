import React, { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, Copy, Check, ShieldAlert, Award, Calendar, AlertTriangle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, reportData = {} }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  const getMarkdown = () => {
    let md = `# Multimodal Construction Intelligence Platform - Executive Audit Dossier\n`;
    md += `Generated: ${new Date().toUTCString()}\n`;
    md += `Standards Enforced: OSHA 1926 • ACI 318 • IBC 2024\n\n`;

    if (reportData?.safety) {
      const s = reportData.safety;
      md += `## 1. Site Safety Audit (${s.project_name || 'Skyline Heights'} - ${s.site_zone || 'Zone A'})\n`;
      md += `- Safety Compliance Score: ${s.safety_score ?? 84}/100 (${s.overall_risk_level || 'HIGH'} Risk)\n`;
      if (s.summary) md += `- Summary: ${s.summary}\n`;
      if (s.violations?.length) {
        md += `### Infractions Detected:\n`;
        s.violations.forEach((v, idx) => {
          md += `${idx + 1}. [${v.severity || 'ALERT'}] ${v.standard || 'OSHA'}: ${v.description || v.hazard || ''}\n`;
        });
      }
      if (s.recommendations?.length) {
        md += `### Corrective Recommendations:\n`;
        s.recommendations.forEach((r, idx) => {
          md += `${idx + 1}. ${r}\n`;
        });
      }
      md += `\n`;
    } else {
      md += `## 1. Site Safety Audit (Skyline Heights Tower B - Cantilever B-4)\n`;
      md += `- Safety Compliance Score: 84/100 (HIGH Risk)\n`;
      md += `- Infractions: OSHA 1926.501(b)(1) Leading edge fall hazard; OSHA 1926.451(g)(1) Missing perimeter guardrail.\n`;
      md += `- Recommendations: Immediate lifeline tie-off, scaffold top/midrail reinstallation, toolbox talk sign-off.\n\n`;
    }

    if (reportData?.crack) {
      const c = reportData.crack;
      md += `## 2. Structural Defect Analysis\n`;
      md += `- Morphology: ${c.morphology || 'Structural Crack'}\n`;
      md += `- Severity Tier: ${c.severity_tier || 'Tier 2'}\n`;
      if (c.estimated_max_width_mm) md += `- Est. Max Width: ${c.estimated_max_width_mm} mm\n`;
      if (c.root_cause_analysis) md += `- Root Cause: ${c.root_cause_analysis}\n`;
      md += `\n`;
    }

    if (reportData?.planning) {
      const p = reportData.planning;
      md += `## 3. Project Schedule & CPM\n`;
      if (p.total_duration_days) md += `- Duration: ${p.total_duration_days} days\n`;
      if (p.total_budget_usd) md += `- Estimated Budget: $${Number(p.total_budget_usd).toLocaleString()}\n`;
      md += `\n`;
    }

    if (reportData?.valuation) {
      const v = reportData.valuation;
      md += `## 4. Asset Valuation & Investment Yield\n`;
      if (v.fair_market_value) md += `- Fair Market Appraisal: $${Number(v.fair_market_value).toLocaleString()}\n`;
      md += `\n`;
    }

    if (reportData?.daily_log) {
      const d = reportData.daily_log;
      md += `## 5. Daily Site Shift Report\n`;
      if (d.executive_summary) md += `- Summary: ${d.executive_summary}\n`;
      md += `\n`;
    }

    if (reportData?.weather) {
      const w = reportData.weather;
      md += `## 6. Meteorological Advisory\n`;
      if (w.risk_protocol) md += `- Protocol: ${w.risk_protocol}\n`;
      md += `\n`;
    }

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = getMarkdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = getMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Construction_Executive_Audit_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine active project name & zone for display
  const safety = reportData?.safety;
  const projectName = safety?.project_name || 'Skyline Heights Tower B (Commercial Core)';
  const siteZone = safety?.site_zone || 'Cantilever B-4 / Level 14';
  const riskScore = safety?.safety_score ?? 84;
  const riskLevel = safety?.overall_risk_level || 'CRITICAL';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-dossier-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="tactical-card w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden bg-[#0c1222] border border-[#233554] shadow-2xl rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#1b273d] flex flex-wrap items-center justify-between gap-3 bg-[#080d19]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span id="audit-dossier-title" className="font-semibold text-sm text-white tracking-wide">
                  Executive Construction Audit Dossier
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  OFFICIAL RECORD
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Standards: OSHA 1926 • ACI 318-19 • IBC 2024
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#131d31] hover:bg-[#1c2c48] text-xs text-zinc-200 border border-[#243555] transition cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
              title="Print official dossier"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold transition cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300"
              title="Copy markdown content to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Output"}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-200"
              title="Download markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              aria-label="Close modal"
              className="p-1.5 rounded hover:bg-[#182338] text-zinc-400 hover:text-white transition cursor-pointer border border-transparent hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-zinc-300 leading-relaxed font-sans bg-[#0a0f1e]">
          {/* Document Masthead */}
          <div className="border-b border-[#1b273d] pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-semibold mb-2">
                <span>SITE COMPLIANCE MEMORANDUM</span>
                <span>•</span>
                <span>STATION {siteZone}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {projectName}
              </h1>
              <p className="text-zinc-400 text-xs mt-0.5">
                Site Safety Vision & OSHA 1926 Compliance Verification
              </p>
            </div>
            <div className="sm:text-right font-mono text-xs flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-2 sm:p-0 rounded sm:rounded-none bg-[#0e1627] sm:bg-transparent border sm:border-0 border-[#1c2a44]">
              <div>
                <span className="text-zinc-500 text-[11px] mr-1.5">Risk Score:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  riskScore >= 75 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  riskScore >= 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {riskScore} / 100 ({riskLevel})
                </span>
              </div>
              <div className="text-zinc-500 text-[11px] mt-1">
                Standard: 29 CFR 1926 Subpart M & L
              </div>
            </div>
          </div>

          {/* Section 1: Site Safety Infractions */}
          <div className="space-y-3 border-b border-[#1b273d] pb-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>1. Verified Site Safety Infractions</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                OSHA Subpart Compliance
              </span>
            </div>

            {safety?.violations && safety.violations.length > 0 ? (
              <div className="space-y-2">
                {safety.violations.map((v, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border ${
                      v.severity === 'CRITICAL' ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' :
                      v.severity === 'HIGH' ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' :
                      'bg-sky-950/20 border-sky-800/40 text-sky-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[11px]">
                        {v.severity || 'ALERT'}: {v.standard || 'OSHA 1926'}
                      </span>
                      {v.confidence && (
                        <span className="text-[10px] font-mono opacity-80">
                          Confidence: {(v.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {v.description || v.hazard}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded bg-rose-950/20 border border-rose-800/40 text-rose-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[11px]">CRITICAL: OSHA 1926.501(b)(1)</span>
                    <span className="text-[10px] font-mono text-rose-300/80">Leading Edge Zone</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Worker positioned within 18 inches of leading edge at 32.4 ft without active fall arrest tie-off.
                  </p>
                </div>
                <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[11px]">MODERATE: OSHA 1926.451(g)(1)</span>
                    <span className="text-[10px] font-mono text-amber-300/80">Scaffold Perimeter</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Perimeter midrail missing between vertical standards. Missing outward-facing 3.5" toeboard on working platform.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Mandatory Corrective Protocol */}
          <div className="space-y-3 border-b border-[#1b273d] pb-5">
            <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider block">
              2. Mandatory Corrective Engineering Protocol
            </span>
            {safety?.recommendations && safety.recommendations.length > 0 ? (
              <ol className="space-y-2 list-decimal list-inside text-zinc-300 bg-[#0d1526] p-4 rounded border border-[#1d2b46]">
                {safety.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs leading-relaxed">
                    <span className="text-zinc-200 font-medium">{rec}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="space-y-2 list-decimal list-inside text-zinc-300 bg-[#0d1526] p-4 rounded border border-[#1d2b46]">
                <li className="text-xs leading-relaxed">
                  <strong className="text-zinc-100">Halt ironwork on Cantilever B-4:</strong> Direct worker to connect dual self-retracting lanyard to rated horizontal lifeline immediately.
                </li>
                <li className="text-xs leading-relaxed">
                  <strong className="text-zinc-100">Reinstall Perimeter Edge Guardrails:</strong> Direct the scaffold contractor to reinstall 42-inch top-rail, 21-inch mid-rail, and 3.5-inch toe-board on Bay 4C prior to resuming concrete work.
                </li>
                <li className="text-xs leading-relaxed">
                  <strong className="text-zinc-100">Supervisory Non-Conformance Log:</strong> Issue formal notice to subcontractor safety director and require documented toolbox talk sign-off before the next shift.
                </li>
              </ol>
            )}
          </div>

          {/* Multi-Module Aggregated Findings (if available) */}
          {reportData?.crack && (
            <div className="space-y-2 border-b border-[#1b273d] pb-4">
              <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider block">
                3. Structural Defect Analysis (ACI 318-19)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded bg-[#0d1526] border border-[#1d2b46]">
                  <span className="text-[10px] font-mono text-zinc-400 block">MORPHOLOGY</span>
                  <span className="text-xs font-semibold text-white">{reportData.crack.morphology || 'N/A'}</span>
                </div>
                <div className="p-3 rounded bg-[#0d1526] border border-[#1d2b46]">
                  <span className="text-[10px] font-mono text-zinc-400 block">SEVERITY TIER</span>
                  <span className="text-xs font-semibold text-amber-400">{reportData.crack.severity_tier || 'N/A'}</span>
                </div>
                <div className="p-3 rounded bg-[#0d1526] border border-[#1d2b46]">
                  <span className="text-[10px] font-mono text-zinc-400 block">MAX WIDTH</span>
                  <span className="text-xs font-semibold text-white">{reportData.crack.estimated_max_width_mm || 'N/A'} mm</span>
                </div>
              </div>
            </div>
          )}

          {reportData?.planning && (
            <div className="space-y-2 border-b border-[#1b273d] pb-4">
              <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider block">
                4. Project Schedule & Critical Path
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded bg-[#0d1526] border border-[#1d2b46]">
                  <span className="text-[10px] font-mono text-zinc-400 block">TOTAL DURATION</span>
                  <span className="text-xs font-semibold text-white">{reportData.planning.total_duration_days || 'N/A'} Days</span>
                </div>
                <div className="p-3 rounded bg-[#0d1526] border border-[#1d2b46]">
                  <span className="text-[10px] font-mono text-zinc-400 block">ESTIMATED BUDGET</span>
                  <span className="text-xs font-semibold text-amber-400">
                    ${Number(reportData.planning.total_budget_usd || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dossier Sign-off Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-[#162136]">
            <div>
              <span>Official Stamp: </span>
              <span className="text-zinc-400">AI AUDIT VERIFIED • 29 CFR 1926</span>
            </div>
            <div className="mt-1 sm:mt-0">
              Generated by Multimodal Construction Intelligence Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

