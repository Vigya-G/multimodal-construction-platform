import React, { useState, useEffect } from 'react';
import { Building2, DollarSign, TrendingUp, Sparkles, RefreshCw, PieChart, Check, Percent, Home } from 'lucide-react';
import { calculateValuation } from '../api/client';

const ALL_AMENITIES = [
  'Underground Parking',
  'Swimming Pool',
  '24/7 Power Backup',
  'Gymnasium',
  'LEED Certified',
  'Rooftop Lounge',
  'EV Charging Stations',
];

export default function RealEstateValuer({ onUpdateReport }) {
  const [propertyType, setPropertyType] = useState('Residential High-Rise');
  const [areaSqft, setAreaSqft] = useState(2400);
  const [quality, setQuality] = useState('Premium');
  const [locationTier, setLocationTier] = useState('Prime Urban Core');
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Underground Parking',
    'Swimming Pool',
    '24/7 Power Backup',
    'LEED Certified'
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    handleCalculate();
  }, []);

  const toggleAmenity = (item) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data = await calculateValuation({
        property_type: propertyType,
        built_up_area_sqft: Number(areaSqft),
        construction_quality: quality,
        location_tier: locationTier,
        amenities: selectedAmenities,
        bedrooms: 3,
        bathrooms: 3,
        age_years: 0,
        land_area_sqft: areaSqft * 1.2,
      });
      setResult(data);
      if (onUpdateReport) onUpdateReport('valuation', data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* Left Column: Form Controls */}
      <div className="lg:col-span-4 space-y-4">
        <div className="tactical-card p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase font-mono">
                Property Specification
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#101b33] border border-[#1e2f54] text-slate-300">
              DCF &amp; Cap Rate
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Typology</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="eng-select"
            >
              <option value="Residential High-Rise">Residential High-Rise</option>
              <option value="Residential Single-Family">Residential Single-Family</option>
              <option value="Commercial Office">Commercial Office</option>
              <option value="Retail Storefront">Retail Storefront</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Built-Up Area (sqft)</label>
            <input
              type="number"
              value={areaSqft}
              onChange={(e) => setAreaSqft(e.target.value)}
              className="eng-input font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Finish Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="eng-select"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Ultra-Luxury">Ultra-Luxury</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Location Tier</label>
              <select
                value={locationTier}
                onChange={(e) => setLocationTier(e.target.value)}
                className="eng-select"
              >
                <option value="Prime Urban Core">Prime Urban</option>
                <option value="Suburban Growth Corridor">Suburban</option>
                <option value="Outer Metropolitan">Outer Metro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-2">Amenities &amp; Value Drivers</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_AMENITIES.map((a) => {
                const isSelected = selectedAmenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition duration-150 border cursor-pointer flex items-center space-x-1 select-none ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border-amber-500/50 shadow-sm'
                        : 'bg-[#090f1f] text-slate-400 border-[#1e2f54] hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-amber-400 shrink-0" />}
                    <span>{a}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-semibold shadow-sm transition duration-150 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <DollarSign className="w-3.5 h-3.5 text-slate-950" />}
            <span>{loading ? 'Evaluating Model...' : 'Calculate Valuation & Cap Rate'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Appraisal & Metrics */}
      <div className="lg:col-span-8 space-y-4">
        {result ? (
          <>
            {/* Hero Appraisal Card */}
            <div className="tactical-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1c2d4f] gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    FAIR MARKET APPRAISAL
                  </span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <h3 className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
                      {formatCurrency(result.estimated_market_value.median_value)}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block font-mono">
                    Valuation Range: {formatCurrency(result.estimated_market_value.min_value)} &ndash; {formatCurrency(result.estimated_market_value.max_value)}
                  </span>
                </div>
                <div className="text-right p-3 rounded-lg bg-[#090f1f] border border-[#1e2f54]">
                  <span className="text-xs text-slate-400 block font-mono">Unit Rate</span>
                  <span className="text-lg font-mono font-bold text-emerald-400 block mt-0.5">
                    ${result.price_per_sqft.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">USD / sqft</span>
                </div>
              </div>

              {/* Investment Yield Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Projected Rent</span>
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-base font-mono font-bold text-slate-100 block">
                    {formatCurrency(result.investment_metrics.projected_monthly_rental)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">Monthly Rental</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Gross Yield</span>
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-base font-mono font-bold text-emerald-400 block">
                    {result.investment_metrics.gross_rental_yield_pct}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">Annual Yield</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#090f1f] border border-[#1e2f54] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Cap Rate (NOI)</span>
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-base font-mono font-bold text-amber-400 block">
                    {result.investment_metrics.estimated_cap_rate_pct}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">Capitalization Rate</span>
                </div>
              </div>
            </div>

            {/* Cost & Land Equity Breakdown Card */}
            <div className="tactical-card p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2d4f]">
                <span className="font-semibold text-xs tracking-wider uppercase text-slate-100 font-mono">
                  Cost &amp; Land Equity Breakdown
                </span>
                <span className="text-[11px] font-mono text-slate-400">Component Decomposition</span>
              </div>

              {/* Segmented Proportional Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#090f1f] flex border border-[#1e2f54]">
                  <div 
                    className="h-full bg-cyan-500" 
                    style={{ width: `${(result.cost_breakdown.construction_cost / result.estimated_market_value.median_value) * 100}%` }}
                    title="Direct Construction Cost"
                  />
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${(result.cost_breakdown.land_share_value / result.estimated_market_value.median_value) * 100}%` }}
                    title="Land Share Equity"
                  />
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(result.cost_breakdown.developer_margin_overhead / result.estimated_market_value.median_value) * 100}%` }}
                    title="Developer Margin & Overhead"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span>Construction ({Math.round((result.cost_breakdown.construction_cost / result.estimated_market_value.median_value) * 100)}%)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Land Share ({Math.round((result.cost_breakdown.land_share_value / result.estimated_market_value.median_value) * 100)}%)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Developer Margin ({Math.round((result.cost_breakdown.developer_margin_overhead / result.estimated_market_value.median_value) * 100)}%)</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-[#090f1f] border border-[#1e2f54] text-slate-300">
                  <span className="font-medium">Direct Construction Cost</span>
                  <span className="font-mono font-bold text-slate-100">{formatCurrency(result.cost_breakdown.construction_cost)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-[#090f1f] border border-[#1e2f54] text-slate-300">
                  <span className="font-medium">Land Share Equity</span>
                  <span className="font-mono font-bold text-slate-100">{formatCurrency(result.cost_breakdown.land_share_value)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-[#090f1f] border border-[#1e2f54] text-slate-300">
                  <span className="font-medium">Developer Margin &amp; Overhead</span>
                  <span className="font-mono font-bold text-emerald-400">{formatCurrency(result.cost_breakdown.developer_margin_overhead)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="tactical-card p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-semibold text-slate-200 block">No Valuation Computed</span>
              <span className="text-xs text-slate-400 max-w-sm block">Click &quot;Calculate Valuation &amp; Cap Rate&quot; to view financial analytics.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
