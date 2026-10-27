import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Check, 
  Clock, 
  AlertTriangle, 
  Image as ImageIcon, 
  ChevronDown, 
  AlertOctagon,
  RefreshCw,
  ShieldCheck,
  HardHat,
  Crosshair,
  ExternalLink
} from 'lucide-react';
import { analyzeSafetyFile, analyzeSafetyJson } from '../api/client';

const DEFAULT_DETECTIONS = [
  {
    id: "det-1",
    type: "worker",
    label: "OSHA 1926.501(b)(1)",
    severity: "Critical",
    confidence: 0.98,
    bbox: { x: 0.375, y: 0.115, w: 0.215, h: 0.845 },
    description: "Worker positioned within 18 inches of leading edge at 32.4 ft without active fall arrest tie-off.",
    infraction_id: "inf-1"
  },
  {
    id: "det-2",
    type: "ppe",
    label: "Hardhat",
    severity: "OK",
    confidence: 0.96,
    bbox: { x: 0.455, y: 0.115, w: 0.080, h: 0.120 },
    description: "ANSI Z89.1 Type I industrial hardhat worn securely.",
    infraction_id: null
  },
  {
    id: "det-3",
    type: "hazard",
    label: "OSHA 1926.451(g)(1)",
    severity: "Moderate",
    confidence: 0.91,
    bbox: { x: 0.580, y: 0.420, w: 0.250, h: 0.360 },
    description: "Perimeter midrail missing between vertical standards. Missing outward-facing 3.5\" toeboard.",
    infraction_id: "inf-2"
  },
  {
    id: "det-4",
    type: "worker",
    label: "Worker 2 (Distant)",
    severity: "Unverified",
    confidence: 0.94,
    bbox: { x: 0.855, y: 0.215, w: 0.053, h: 0.195 },
    description: "Secondary worker located >60ft away on deck. Distance exceeds optical resolution for tie-off verification.",
    infraction_id: null
  }
];

const SEVERITY_ORDER = { Critical: 4, High: 3, Moderate: 2, Low: 1, OK: 0, Unverified: 0 };

/**
 * Deterministic label collision resolution algorithm:
 * 1. Process detections in descending severity (Critical first)
 * 2. Try positions in order: above, below, inside-bottom, inside-top
 * 3. Choose first position that stays inside image bounds without overlapping any placed label
 */
function computeLabelPlacements(detections) {
  const sorted = [...detections].sort((a, b) => {
    const pA = SEVERITY_ORDER[a.severity] ?? 0;
    const pB = SEVERITY_ORDER[b.severity] ?? 0;
    return pB - pA;
  });

  const placedRects = [];
  const placementMap = {};

  for (const det of sorted) {
    const { x, y, w, h } = det.bbox;
    const isPpeChild = det.type === 'ppe';
    const isShortLabel = isPpeChild || det.severity === 'Unverified';
    const labelW = isShortLabel ? 0.12 : 0.23;
    const labelH = 0.038;

    // Right-edge clamp: if box or label would overflow right margin, anchor right-edge to box right-edge
    const alignRight = (x + labelW) > 0.88 || (x + w > 0.80);
    const labelX = alignRight ? Math.max(0, x + w - labelW) : x;

    // Ordered candidate positions
    let candidatePositions;
    if (isPpeChild) {
      candidatePositions = [
        { name: 'right', topOffset: y, className: 'top-0 left-full ml-1.5' },
        { name: 'inside-bottom', topOffset: y + h - labelH - 0.005, className: 'bottom-0.5 right-0.5' },
        { name: 'below', topOffset: y + h + 0.005, className: 'top-full mt-1 left-0' },
      ];
    } else {
      candidatePositions = [
        { 
          name: 'above', 
          topOffset: y - labelH - 0.005, 
          className: `-top-6 ${alignRight ? 'right-0' : 'left-0'}` 
        },
        { 
          name: 'below', 
          topOffset: y + h + 0.005, 
          className: `top-full mt-1 ${alignRight ? 'right-0' : 'left-0'}` 
        },
        { 
          name: 'inside-top', 
          topOffset: y + 0.005, 
          className: `top-1 ${alignRight ? 'right-1' : 'left-1'}` 
        },
      ];
    }

    let chosen = null;
    for (const cand of candidatePositions) {
      if (cand.topOffset < 0 || (cand.topOffset + labelH) > 1.0) continue;

      const candRect = {
        x1: labelX,
        y1: cand.topOffset,
        x2: labelX + labelW,
        y2: cand.topOffset + labelH,
      };

      const hasCollision = placedRects.some(placed => {
        return !(
          candRect.x2 <= placed.x1 ||
          candRect.x1 >= placed.x2 ||
          candRect.y2 <= placed.y1 ||
          candRect.y1 >= placed.y2
        );
      });

      if (!hasCollision) {
        chosen = { ...cand, rect: candRect };
        break;
      }
    }

    if (!chosen) {
      chosen = candidatePositions[0];
      chosen.rect = {
        x1: labelX,
        y1: chosen.topOffset,
        x2: labelX + labelW,
        y2: chosen.topOffset + labelH,
      };
    }

    placedRects.push(chosen.rect);
    placementMap[det.id] = chosen.className;
  }

  return placementMap;
}

const DEFAULT_INFRACTIONS = [
  {
    id: "inf-1",
    severity: "CRITICAL",
    osha_standard: "OSHA 1926.501(b)(1)",
    location: "Zone B • Level 4",
    description: "Worker positioned within 18 inches of leading edge at 32.4 ft without active fall arrest tie-off."
  },
  {
    id: "inf-2",
    severity: "MODERATE",
    osha_standard: "OSHA 1926.451(g)(1)",
    location: "Bay 4C Standard",
    description: "Perimeter midrail missing between vertical standards. Missing outward-facing 3.5\" toeboard."
  }
];

const DEFAULT_ACTIONS = [
  {
    step_number: "01",
    category: "IMMEDIATE ACTION",
    title: "Halt Leading Edge Work",
    description: "Halt ironwork on Cantilever B-4. Direct worker to connect dual self-retracting lanyard to rated horizontal lifeline immediately."
  },
  {
    step_number: "02",
    category: "ENGINEERING FIX",
    title: "Reinstall Perimeter Guardrails",
    description: "Direct the scaffold contractor to reinstall 42-inch top-rail, 21-inch mid-rail, and 3.5-inch toe-board on Bay 4C prior to resuming concrete work."
  },
  {
    step_number: "03",
    category: "DOCUMENTATION",
    title: "Issue Non-Conformance Report",
    description: "Log a formal non-conformance report and require a toolbox talk sign-off before the next shift."
  }
];

export default function SafetyInspector({ uiState = 'results', onUpdateReport }) {
  const [projectName, setProjectName] = useState('Skyline Heights Tower B (Commercial Core)');
  const [siteZone, setSiteZone] = useState('Scaffolding Zone B - Level 4');
  const [imageFileName, setImageFileName] = useState('Skyline-TowerB-Scaffold4.jpg');
  const [fileSizeStr, setFileSizeStr] = useState('8.4MB');
  const [imageSrc, setImageSrc] = useState('/scaffold_sample.jpg');
  const [uploadedFile, setUploadedFile] = useState(null);

  const [targets, setTargets] = useState({
    fallArrest: true,
    guardrails: true,
    ppe: true,
    plankDeflection: true,
  });

  const [data, setData] = useState({
    hazard_score: 84,
    fall_risk_pct: 88,
    scaffold_defect_pct: 42,
    workers_detected: 2,
    ppe_compliance_pct: 100,
    hazards_count: 2,
    detections: DEFAULT_DETECTIONS,
    infractions: DEFAULT_INFRACTIONS,
    actions: DEFAULT_ACTIONS,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runListener = () => handleRunAudit();
    const demoListener = () => handleDemoData();
    window.addEventListener('run_active_audit', runListener);
    window.addEventListener('load_preset_sample', demoListener);
    return () => {
      window.removeEventListener('run_active_audit', runListener);
      window.removeEventListener('load_preset_sample', demoListener);
    };
  }, [uploadedFile, imageSrc, projectName, siteZone, targets]);

  const toggleTarget = (key) => {
    setTargets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDemoData = () => {
    setProjectName('Skyline Heights Tower B (Commercial Core)');
    setSiteZone('Scaffolding Zone B - Level 4');
    setImageFileName('Skyline-TowerB-Scaffold4.jpg');
    setFileSizeStr('8.4MB');
    setImageSrc('/scaffold_sample.jpg');
    setUploadedFile(null);
    setData({
      hazard_score: 84,
      fall_risk_pct: 88,
      scaffold_defect_pct: 42,
      workers_detected: 2,
      ppe_compliance_pct: 100,
      hazards_count: 2,
      detections: DEFAULT_DETECTIONS,
      infractions: DEFAULT_INFRACTIONS,
      actions: DEFAULT_ACTIONS,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setImageFileName(file.name);
      setFileSizeStr(`${(file.size / (1024 * 1024)).toFixed(1)}MB`);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      let res;
      if (uploadedFile) {
        res = await analyzeSafetyFile(uploadedFile, projectName, siteZone, targets);
      } else {
        res = await analyzeSafetyJson({
          project_name: projectName,
          site_zone: siteZone,
          image_base64: imageSrc,
          target_fall_arrest: targets.fallArrest,
          target_guardrails: targets.guardrails,
          target_ppe: targets.ppe,
          target_plank_deflection: targets.plankDeflection,
        });
      }

      if (res && res.detections) {
        setData(res);
        if (onUpdateReport) onUpdateReport('safety', res);
      }
    } catch (err) {
      console.warn('Audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [hoveredDetId, setHoveredDetId] = useState(null);

  const getBoxStyle = (severity, isHovered) => {
    const hoverGlow = isHovered 
      ? 'ring-2 ring-white/90 shadow-2xl shadow-black/90 z-30 brightness-110' 
      : 'z-10';

    switch (severity) {
      case 'Critical':
        return {
          border: `border-2 border-rose-500 bg-rose-500/15 ${hoverGlow}`,
          badge: 'bg-rose-600 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-lg border border-rose-400/50 tracking-tight backdrop-blur-md',
        };
      case 'High':
        return {
          border: `border-2 border-orange-500 bg-orange-500/15 ${hoverGlow}`,
          badge: 'bg-orange-600 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-lg border border-orange-400/50 tracking-tight backdrop-blur-md',
        };
      case 'Moderate':
        return {
          border: `border-2 border-amber-400 bg-amber-400/15 ${hoverGlow}`,
          badge: 'bg-amber-400 text-slate-950 font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-lg border border-amber-500 tracking-tight',
        };
      case 'Unverified':
        return {
          border: `border-2 border-dashed border-slate-400/80 bg-slate-500/15 ${hoverGlow}`,
          badge: 'bg-slate-800 text-slate-200 font-mono text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg border border-slate-600 tracking-tight backdrop-blur-md',
        };
      default:
        return {
          border: `border-2 border-emerald-400 bg-emerald-400/15 ${hoverGlow}`,
          badge: 'bg-emerald-600 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-lg border border-emerald-400/50 tracking-tight backdrop-blur-md',
        };
    }
  };

  const activeDetections = (uiState === 'results' && !loading) ? (data.detections || []) : [];
  const labelPlacements = computeLabelPlacements(activeDetections);
  const activeWorkersCount = activeDetections.filter(d => d.type === 'worker').length || data.workers_detected || 2;
  const activeHazardsCount = activeDetections.filter(d => d.severity in { Critical: 1, High: 1, Moderate: 1 }).length || data.hazards_count || 2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* ================= LEFT COLUMN (4 / 12) ================= */}
      <div className="lg:col-span-4 space-y-4">
        {/* Card 1: Site Imagery Ingestion */}
        <div className="tactical-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase font-mono">
                Site Imagery Ingestion
              </span>
            </div>
            <button
              type="button"
              onClick={handleDemoData}
              className="px-2.5 py-1 rounded bg-[#0e172a] hover:bg-[#16233d] text-slate-300 hover:text-white text-[11px] font-medium border border-[#223558] transition duration-150 cursor-pointer shadow-sm"
            >
              Demo Data
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => document.getElementById('file-upload-input').click()}
            className="border-2 border-dashed border-[#243962] hover:border-amber-400/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition duration-150 bg-[#090f1f]/80 group"
          >
            <input
              id="file-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-10 h-10 rounded-full bg-[#121d38] group-hover:bg-[#19284d] flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition mb-2.5 border border-[#203259]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs text-center font-medium">
              <span className="text-amber-400 group-hover:underline">Click to upload</span>
              <span className="text-slate-400"> or drag site image</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">JPEG, PNG, WebP up to 25MB</p>

            {/* Active File Pill */}
            {imageFileName && (
              <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#0e172a] border border-[#203358] text-[11px] text-slate-200 flex items-center space-x-2 w-full justify-between shadow-inner">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="truncate font-medium">{imageFileName}</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">({fileSizeStr})</span>
              </div>
            )}
          </div>

          {/* Project & Zone Inputs */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Project / Structure Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="eng-input"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Site Work Zone</label>
              <input
                type="text"
                value={siteZone}
                onChange={(e) => setSiteZone(e.target.value)}
                className="eng-input"
              />
            </div>
          </div>

          {/* OSHA Verification Targets Checklist */}
          <div className="space-y-2 pt-2 border-t border-[#1c2d4f]">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block font-mono">
              OSHA VERIFICATION TARGETS
            </span>

            <div className="space-y-1.5">
              <div
                onClick={() => toggleTarget('fallArrest')}
                className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2e477e] flex items-start space-x-2.5 cursor-pointer transition select-none"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition ${
                  targets.fallArrest ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'border border-slate-600 bg-transparent'
                }`}>
                  {targets.fallArrest && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Worker Fall Arrest &amp; Tie-Off</span>
                  <span className="text-[11px] font-mono text-slate-400">OSHA 1926.501(b)(1) 6ft threshold</span>
                </div>
              </div>

              <div
                onClick={() => toggleTarget('guardrails')}
                className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2e477e] flex items-start space-x-2.5 cursor-pointer transition select-none"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition ${
                  targets.guardrails ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'border border-slate-600 bg-transparent'
                }`}>
                  {targets.guardrails && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Guardrails, Mid-rails &amp; Toe-boards</span>
                  <span className="text-[11px] font-mono text-slate-400">OSHA 1926.451(g)(1) perimeter integrity</span>
                </div>
              </div>

              <div
                onClick={() => toggleTarget('ppe')}
                className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2e477e] flex items-start space-x-2.5 cursor-pointer transition select-none"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition ${
                  targets.ppe ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'border border-slate-600 bg-transparent'
                }`}>
                  {targets.ppe && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Hardhat &amp; High-Visibility PPE</span>
                  <span className="text-[11px] font-mono text-slate-400">OSHA 1926.100 &amp; ANSI/ISEA 107</span>
                </div>
              </div>

              <div
                onClick={() => toggleTarget('plankDeflection')}
                className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2e477e] flex items-start space-x-2.5 cursor-pointer transition select-none"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition ${
                  targets.plankDeflection ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'border border-slate-600 bg-transparent'
                }`}>
                  {targets.plankDeflection && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Scaffold Plank Deflection &amp; Locking Pins</span>
                  <span className="text-[11px] font-mono text-slate-400">OSHA 1926.451(a) structural load limit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Recent Audits */}
        <div className="tactical-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold tracking-wider uppercase text-[11px] font-mono">Recent Audits</span>
            </div>
            <span className="text-slate-400 text-[11px] font-mono">Last 3 audits</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Skyline Heights Tower B</span>
                <span className="text-[10px] text-slate-400 font-mono">Today, 14:32</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                84 FAIL
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Hudson Yards Core C</span>
                <span className="text-[10px] text-slate-400 font-mono">Yesterday</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                22 PASS
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Pacific Bay Pier 14</span>
                <span className="text-[10px] text-slate-400 font-mono">2 days ago</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                68 MODERATE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN (8 / 12) ================= */}
      <div className="lg:col-span-8 space-y-4">
        {/* Main Vision Display Card */}
        <div className="tactical-card overflow-hidden">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-[#090f1f] border-b border-[#1c2d4f] flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-2 text-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px] font-medium text-slate-100">{imageFileName}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 flex items-center space-x-2">
              <span className="px-1.5 py-0.5 rounded bg-[#131d36] border border-[#203258]">3840 &times; 2160 UHD</span>
              <span className="text-slate-600">&bull;</span>
              <span>Analyzed: 14:32:08 UTC</span>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative w-full overflow-hidden select-none bg-slate-950">
            <img
              src={imageSrc}
              alt="Site Inspection Scan"
              className="w-full h-auto block object-cover"
            />

            {/* Collision-Free Detections Layer with Tooltips and Hover States */}
            {activeDetections.map((det) => {
              const isHovered = hoveredDetId === det.id || (det.infraction_id && hoveredDetId === det.infraction_id);
              const style = getBoxStyle(det.severity, isHovered);
              const placementClass = labelPlacements[det.id] || '-top-6 left-0';
              
              const labelText = det.type === 'ppe'
                ? `${det.label} • ${det.severity}`
                : det.severity === 'Unverified'
                  ? `${det.label} • Unverified`
                  : `${det.label} • ${det.severity} • ${Math.round(det.confidence * 100)}%`;

              return (
                <div
                  key={det.id}
                  onMouseEnter={() => setHoveredDetId(det.id)}
                  onMouseLeave={() => setHoveredDetId(null)}
                  className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 ${style.border}`}
                  style={{
                    left: `${det.bbox.x * 100}%`,
                    top: `${det.bbox.y * 100}%`,
                    width: `${det.bbox.w * 100}%`,
                    height: `${det.bbox.h * 100}%`,
                  }}
                >
                  {/* Fixed 11px font badge placed with deterministic collision-free positioning */}
                  <span
                    className={`absolute text-[11px] font-mono font-bold leading-none py-1 px-1.5 whitespace-nowrap ${style.badge} ${placementClass}`}
                  >
                    {labelText}
                  </span>

                  {/* Interactive Finding Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute top-full mt-2 left-0 z-40 w-72 p-3 rounded-lg bg-[#080e1e]/95 backdrop-blur-md border border-[#2a4175] shadow-2xl text-[11px] text-slate-100 pointer-events-none space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold border-b border-[#1c2d4f] pb-1">
                        <span className={
                          det.severity === 'Critical' ? 'text-rose-400' :
                          det.severity === 'Moderate' ? 'text-amber-400' :
                          det.severity === 'Unverified' ? 'text-slate-300' : 'text-emerald-400'
                        }>
                          {det.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{Math.round(det.confidence * 100)}% Conf.</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        {det.description || "Active object detection identified by OSHA vision inference."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Overlay */}
            {(loading || uiState === 'loading') && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-20">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-100 block">EXECUTING MULTIMODAL VISION INFERENCE</span>
                  <span className="text-[11px] text-slate-400">Evaluating OSHA 1926 fall hazards &amp; perimeter safety bounds...</span>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {uiState === 'error' && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 p-6 text-center z-20">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <AlertOctagon className="w-6 h-6 text-rose-400" />
                </div>
                <span className="text-sm font-semibold text-slate-100">Inspection Scan Interrupted</span>
                <span className="text-xs text-slate-400 max-w-sm">Failed to connect to multimodal inference endpoint. Please verify payload formatting or network access.</span>
              </div>
            )}

            {/* Empty Overlay */}
            {uiState === 'empty' && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 p-6 text-center z-20">
                <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-sm font-semibold text-slate-100">No Imagery Loaded</span>
                <span className="text-xs text-slate-400 max-w-sm">Upload a construction site photograph or click "Demo Data" on the left to start.</span>
              </div>
            )}
          </div>

          {/* Bottom Detection Stats Strip */}
          <div className="px-4 py-3 bg-[#090f1f] border-t border-[#1c2d4f] flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-medium">Workers:</span>
                <span className="px-2 py-0.5 rounded bg-[#101b33] border border-[#21345d] font-mono text-[11px] font-bold text-slate-100">
                  {activeWorkersCount} Active
                </span>
              </div>

              <div 
                className="flex items-center space-x-2 cursor-help"
                title="OSHA 1926.100 PPE Compliant: Hardhat & high-vis verified on assessable worker. Missing tie-off is tracked under Fall Protection (OSHA 1926.501). Worker 2 is distant/unverified."
              >
                <span className="text-slate-400 font-medium">PPE Compliance:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                  data.ppe_compliance_pct === 100
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                }`}>
                  {data.ppe_compliance_pct}% {data.ppe_compliance_pct === 100 ? 'Pass' : 'Warning'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(1 of 1 assessable, 1 unverified)</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-medium">Hazards:</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 font-mono text-[11px] font-bold text-rose-400">
                  {activeHazardsCount} Flagged
                </span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">Hover box or infraction for details</span>
          </div>
        </div>

        {/* Mid Section: Risk Score & Infraction Analysis Log */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card A: TOTAL HAZARD RISK SCORE */}
          <div className="md:col-span-5 tactical-card p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
                <span className="font-semibold text-xs tracking-wider text-slate-200 uppercase font-mono">
                  TOTAL HAZARD RISK SCORE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  FAIL
                </span>
              </div>

              {/* Big Score Readout */}
              <div className="flex items-baseline space-x-2 mt-3">
                <span className="text-4xl font-extrabold font-mono text-rose-400 tracking-tight">
                  {data.hazard_score}
                </span>
                <span className="text-xs font-mono text-slate-400">/ 100 Risk Index</span>
              </div>

              <p className="text-xs text-rose-200/90 leading-relaxed mt-2.5">
                High Severity Fall Risk detected. Immediate supervisor intervention required prior to continued work.
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-3 border-t border-[#1c2d4f]">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Fall Risk</span>
                  <span className="text-rose-400 font-bold">{data.fall_risk_pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#090f1f] rounded-full overflow-hidden border border-[#1b2b4d]">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" style={{ width: `${data.fall_risk_pct}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Scaffold Structure Defect</span>
                  <span className="text-amber-400 font-bold">{data.scaffold_defect_pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#090f1f] rounded-full overflow-hidden border border-[#1b2b4d]">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${data.scaffold_defect_pct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: OSHA INFRACTION ANALYSIS LOG */}
          <div className="md:col-span-7 tactical-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
              <div className="flex items-center space-x-2 text-slate-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-xs tracking-wider uppercase font-mono">OSHA Infraction Analysis Log</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{data.infractions.length} Items Flagged</span>
            </div>

            <div className="space-y-2.5">
              {data.infractions.map((inf) => {
                const isHighlighted = hoveredDetId === inf.id || (inf.id === 'inf-1' && hoveredDetId === 'det-1') || (inf.id === 'inf-2' && hoveredDetId === 'det-3');

                return (
                  <div
                    key={inf.id}
                    onMouseEnter={() => setHoveredDetId(inf.id === 'inf-1' ? 'det-1' : 'det-3')}
                    onMouseLeave={() => setHoveredDetId(null)}
                    className={`p-3 rounded-lg space-y-1.5 transition duration-150 cursor-pointer ${
                      isHighlighted
                        ? inf.severity === 'CRITICAL'
                          ? 'bg-[#1b1c2b] border-2 border-rose-500 shadow-md shadow-rose-950/60 ring-1 ring-rose-500/40'
                          : 'bg-[#22201d] border-2 border-amber-400 shadow-md shadow-amber-950/60 ring-1 ring-amber-400/40'
                        : inf.severity === 'CRITICAL'
                          ? 'bg-[#111626] border border-rose-900/40 hover:border-rose-700/60'
                          : 'bg-[#111724] border border-amber-900/40 hover:border-amber-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          inf.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {inf.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-100">{inf.osha_standard}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{inf.location}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{inf.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Card: Recommended Actions & Corrective Protocol */}
        <div className="tactical-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="font-semibold text-xs tracking-wide text-slate-100">
                Recommended Actions &amp; Corrective Protocol <span className="text-slate-400 font-normal">({data.actions.length} Structured Steps)</span>
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {data.actions.map((act, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2b4172] transition space-y-1.5">
                <span className={`text-[11px] font-mono font-bold block tracking-wider uppercase ${
                  i === 0 ? 'text-rose-400' : i === 1 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {act.step_number}. {act.category}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
