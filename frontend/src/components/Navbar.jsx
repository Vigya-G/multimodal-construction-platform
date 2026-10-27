import React from 'react';
import { ShieldCheck, Star, FileText, Eye, RefreshCw } from 'lucide-react';

export default function Navbar({ onLoadPreset, onOpenReport, onRunAudit, isAuditing }) {
  return (
    <header className="border-b border-[#1c2d4f] bg-[#090f1f]/95 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Gemini Engine Badge */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/35 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="font-bold text-xs sm:text-[13px] tracking-wider text-slate-100 uppercase truncate">
                Multimodal Construction Intelligence
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Powered by Gemini</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Site Safety Vision &amp; OSHA Compliance Auditor &bull; 29 CFR 1926 Reference
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onLoadPreset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#0e172a] hover:bg-[#16233d] active:bg-[#1a2a49] text-slate-200 border border-[#223558] hover:border-[#324d7d] text-xs font-medium transition duration-150 cursor-pointer shadow-sm"
            title="Load standard scaffolding site sample"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden md:inline">Load Preset Sample</span>
            <span className="md:hidden">Sample</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#0e172a] hover:bg-[#16233d] active:bg-[#1a2a49] text-slate-200 border border-[#223558] hover:border-[#324d7d] text-xs font-medium transition duration-150 cursor-pointer shadow-sm"
            title="View executive summary and export dossier"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Export Audit Report (PDF/JSON)</span>
            <span className="lg:hidden">Dossier</span>
          </button>

          <button
            type="button"
            onClick={onRunAudit}
            disabled={isAuditing}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuditing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{isAuditing ? 'Auditing...' : 'Run Safety Audit'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
