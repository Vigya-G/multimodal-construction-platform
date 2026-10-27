import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, Sun, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Umbrella } from 'lucide-react';
import { getWeatherAdvisory } from '../api/client';

export default function WeatherAdvisor({ onUpdateReport }) {
  const [tempC, setTempC] = useState(36.5);
  const [humidity, setHumidity] = useState(32);
  const [rainChance, setRainChance] = useState(10);
  const [windKmh, setWindKmh] = useState(28);
  const [uvIndex, setUvIndex] = useState(9);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    handleRunAdvisory();
  }, []);

  const applyScenario = (t, h, r, w, uv) => {
    setTempC(t);
    setHumidity(h);
    setRainChance(r);
    setWindKmh(w);
    setUvIndex(uv);
  };

  const handleRunAdvisory = async () => {
    setLoading(true);
    try {
      const data = await getWeatherAdvisory({
        temperature_c: Number(tempC),
        humidity_pct: Number(humidity),
        precipitation_chance_pct: Number(rainChance),
        wind_speed_kmh: Number(windKmh),
        uv_index: Number(uvIndex),
        scheduled_trades: [
          'Concrete Pouring & Curing',
          'Tower Crane & Aerial Hoists',
          'External Painting & Waterproofing',
          'Deep Excavation & Earthwork',
        ],
      });
      setResult(data);
      if (onUpdateReport) onUpdateReport('weather', data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* Left Column: Atmospheric Controls */}
      <div className="lg:col-span-4 space-y-4">
        <div className="tactical-card p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase font-mono">
                Meteorological Parameters
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#101b33] border border-[#1e2f54] text-slate-300">
              Site Microclimate
            </span>
          </div>

          {/* Scenario Presets */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Preset Scenarios</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyScenario(36.5, 32, 10, 28, 9)}
                className="text-[11px] px-2 py-1.5 rounded-lg bg-[#090f1f] text-slate-300 border border-[#1e2f54] hover:border-amber-400/60 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center space-x-1"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Heatwave</span>
              </button>
              <button
                type="button"
                onClick={() => applyScenario(18, 60, 20, 58, 3)}
                className="text-[11px] px-2 py-1.5 rounded-lg bg-[#090f1f] text-slate-300 border border-[#1e2f54] hover:border-cyan-400/60 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center space-x-1"
              >
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>Gale Wind</span>
              </button>
              <button
                type="button"
                onClick={() => applyScenario(20, 85, 75, 20, 2)}
                className="text-[11px] px-2 py-1.5 rounded-lg bg-[#090f1f] text-slate-300 border border-[#1e2f54] hover:border-indigo-400/60 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center space-x-1"
              >
                <CloudRain className="w-3 h-3 text-indigo-400" />
                <span>Heavy Rain</span>
              </button>
            </div>
          </div>

          {/* Range Sliders with Numerical Readouts */}
          <div className="space-y-3.5 pt-1">
            <div className="p-3 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ambient Temperature</span>
                </span>
                <span className="font-mono text-slate-100 font-bold px-2 py-0.5 rounded bg-[#131d36] border border-[#21345d]">
                  {tempC}&deg;C
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                value={tempC}
                onChange={(e) => setTempC(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>-10&deg;C (Freezing)</span>
                <span>50&deg;C (Extreme)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sustained Wind Speed</span>
                </span>
                <span className="font-mono text-slate-100 font-bold px-2 py-0.5 rounded bg-[#131d36] border border-[#21345d]">
                  {windKmh} km/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={windKmh}
                onChange={(e) => setWindKmh(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 km/h (Calm)</span>
                <span>48+ (Crane Cut-Off)</span>
                <span>80 km/h</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Precipitation Probability</span>
                </span>
                <span className="font-mono text-slate-100 font-bold px-2 py-0.5 rounded bg-[#131d36] border border-[#21345d]">
                  {rainChance}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rainChance}
                onChange={(e) => setRainChance(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0% (Dry)</span>
                <span>100% (Continuous Rain)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Umbrella className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Relative Humidity</span>
                </span>
                <span className="font-mono text-slate-100 font-bold px-2 py-0.5 rounded bg-[#131d36] border border-[#21345d]">
                  {humidity}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>5% (Arid)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunAdvisory}
            disabled={loading}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <CloudRain className="w-3.5 h-3.5 text-slate-950" />}
            <span>{loading ? 'Evaluating Atmospheric Load...' : 'Evaluate Weather Impact'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Advisory Findings */}
      <div className="lg:col-span-8 space-y-4">
        {result ? (
          <>
            {/* Meteorological Advisory Hero Banner */}
            <div className="tactical-card p-5 space-y-3">
              <div className="flex flex-wrap justify-between items-center pb-2.5 border-b border-[#1c2d4f] gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  METEOROLOGICAL ADVISORY
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5 ${
                  result.risk_level === 'Unsafe' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  result.risk_level === 'Caution' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    result.risk_level === 'Unsafe' ? 'bg-rose-500 animate-pulse' :
                    result.risk_level === 'Caution' ? 'bg-amber-400' :
                    'bg-emerald-400'
                  }`}></span>
                  <span>{result.risk_level} Protocol</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 tracking-tight">{result.overall_site_condition}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.worker_safety_advisory}</p>
            </div>

            {/* Trade Safeguards & Code Thresholds */}
            <div className="tactical-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1c2d4f]">
                <span className="font-semibold text-xs tracking-wider uppercase text-slate-100 font-mono block">
                  Trade Safeguards &amp; Code Thresholds
                </span>
                <span className="text-[11px] font-mono text-slate-400">{result.trade_advisories.length} Trades Analyzed</span>
              </div>

              <div className="space-y-3">
                {result.trade_advisories.map((ta, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[#090f1f] border border-[#1e2f54] hover:border-[#2b4172] transition space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-[#142038]">
                      <span className="font-bold text-slate-100 text-[13px]">{ta.trade}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        ta.status === 'Unsafe' ? 'text-rose-300 bg-rose-500/15 border border-rose-500/30' :
                        ta.status === 'Caution' ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30' :
                        'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
                      }`}>
                        {ta.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Active Risk Drivers:</span>
                      {ta.risk_factors.map((rf, rIdx) => (
                        <div key={rIdx} className="flex items-start space-x-2">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
                          <span className="leading-relaxed text-slate-300">{rf}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] space-y-1.5 pt-2 border-t border-[#142038]">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">Mandatory Measures:</span>
                      {ta.mandatory_measures.map((mm, mIdx) => (
                        <div key={mIdx} className="flex items-start space-x-2 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="text-slate-200 leading-relaxed">{mm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="tactical-card p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center">
              <CloudRain className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-semibold text-slate-200 block">No Advisory Generated</span>
              <span className="text-xs text-slate-400 max-w-sm block">Click &quot;Evaluate Weather Impact&quot; to compute trade workability and safety thresholds.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
