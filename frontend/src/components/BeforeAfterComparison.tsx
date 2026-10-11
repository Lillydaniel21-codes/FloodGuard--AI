import React, { useState } from 'react';
import {
  Satellite,
  Layers,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Maximize2,
  Info,
  ExternalLink,
} from 'lucide-react';

interface BeforeAfterComparisonProps {
  onNavigateToMap?: () => void;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  onNavigateToMap,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [activePreset, setActivePreset] = useState<'trishuli' | 'koshi' | 'melamchi'>('trishuli');
  const [displayMode, setDisplayMode] = useState<'slider' | 'side-by-side'>('slider');

  const presetData = {
    trishuli: {
      title: 'Trishuli River Valley Flash Flood',
      region: 'Bagmati Province, Nepal (EMSR927)',
      eventDate: 'August 26, 2026',
      preDate: 'August 12, 2026 (Pre-Event)',
      postDate: 'August 26, 2026 18:00 UTC (Post-Event)',
      preWaterArea: '1.12 km²',
      postWaterArea: '5.99 km²',
      netInundation: '4.87 km²',
      cloudCoverDuringEvent: '100% (Dense Monsoon Cloud Layer)',
      sarPenetration: '100% (Microwave C-Band 5.405 GHz)',
      bridgesSevered: 4,
      settlementsCutOff: 3,
      description:
        'Extreme cloud cover completely blinded optical satellites (Sentinel-2, Landsat-9). Sentinel-1 C-band Synthetic Aperture Radar penetrated all cloud layers, isolating specular microwave absorption from standing surface water with high precision.',
      // High-res realistic satellite imagery for realistic display
      preImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      postImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    },
    koshi: {
      title: 'Koshi River Embankment Breach',
      region: 'Koshi Province, Nepal',
      eventDate: 'September 14, 2026',
      preDate: 'September 01, 2026 (Pre-Event)',
      postDate: 'September 14, 2026 (Post-Event)',
      preWaterArea: '18.40 km²',
      postWaterArea: '47.20 km²',
      netInundation: '28.80 km²',
      cloudCoverDuringEvent: '94% Cloud Cover',
      sarPenetration: '100% All-Weather Radar',
      bridgesSevered: 2,
      settlementsCutOff: 8,
      description:
        'Massive alluvial lowland inundation resulting from seasonal monsoon embankment collapse. Combined Sentinel-1 SAR and Sentinel-2 NDWI analysis mapped widespread agricultural and village inundation.',
      preImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      postImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    },
    melamchi: {
      title: 'Melamchi River Debris & Sediment Flood',
      region: 'Sindhupalchok, Nepal',
      eventDate: 'July 18, 2026',
      preDate: 'July 05, 2026 (Pre-Event)',
      postDate: 'July 18, 2026 (Post-Event)',
      preWaterArea: '0.85 km²',
      postWaterArea: '3.40 km²',
      netInundation: '2.55 km²',
      cloudCoverDuringEvent: '98% Cloud Cover',
      sarPenetration: '100% All-Weather Radar',
      bridgesSevered: 5,
      settlementsCutOff: 4,
      description:
        'Catastrophic sediment and debris flow in steep V-shaped Himalayan gorge. DEM-assisted slope filtering prevented false shadow positives while detecting severed suspension bridges.',
      preImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      postImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    },
  };

  const current = presetData[activePreset];

  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 text-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Satellite className="w-4 h-4" />
              <span>Multi-Temporal Earth Observation Intelligence</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Before & After Satellite Flood Comparison
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Compare baseline pre-event imagery against post-event Sentinel-1 radar backscatter and flood extents.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center space-x-2 bg-dark-900 p-1 rounded-xl border border-dark-800 text-xs">
            <button
              onClick={() => setActivePreset('trishuli')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activePreset === 'trishuli'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trishuli Valley
            </button>
            <button
              onClick={() => setActivePreset('koshi')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activePreset === 'koshi'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Koshi Plains
            </button>
            <button
              onClick={() => setActivePreset('melamchi')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activePreset === 'melamchi'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Melamchi Debris
            </button>
          </div>
        </div>

        {/* View Mode Toggle & Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-dark-900 border border-dark-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Pre-Event Water</div>
            <div className="text-lg font-bold text-slate-200">{current.preWaterArea}</div>
            <div className="text-[10px] text-slate-500">{current.preDate.split(' ')[0]}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Post-Event Water</div>
            <div className="text-lg font-bold text-cyan-400">{current.postWaterArea}</div>
            <div className="text-[10px] text-cyan-500">Sentinel-1 Peak Flood</div>
          </div>
          <div className="bg-dark-900 border border-cyan-800/40 p-3.5 rounded-xl bg-cyan-950/20">
            <div className="text-[11px] text-cyan-300">Net Flood Surge</div>
            <div className="text-lg font-bold text-white">+{current.netInundation}</div>
            <div className="text-[10px] text-cyan-400">Specular SAR Anomaly</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Severed Bridges</div>
            <div className="text-lg font-bold text-rose-400">{current.bridgesSevered} Crossings</div>
            <div className="text-[10px] text-rose-500">Critical Red Beacons</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 p-3.5 rounded-xl col-span-2 md:col-span-1">
            <div className="text-[11px] text-slate-400">Cloud Penetration</div>
            <div className="text-lg font-bold text-emerald-400">100% SAR</div>
            <div className="text-[10px] text-emerald-500">All-Weather Microwaves</div>
          </div>
        </div>

        {/* Interactive Comparison Window */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Controls Bar */}
          <div className="bg-dark-850 px-4 py-3 border-b border-dark-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">Display Format:</span>
              <button
                onClick={() => setDisplayMode('slider')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  displayMode === 'slider'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Split Reveal Slider
              </button>
              <button
                onClick={() => setDisplayMode('side-by-side')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  displayMode === 'side-by-side'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Side-by-Side Dual
              </button>
            </div>

            {displayMode === 'slider' && (
              <div className="flex items-center space-x-3 w-64 max-w-full">
                <span className="text-[11px] text-slate-400">Pre</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[11px] text-cyan-400">Post</span>
              </div>
            )}

            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition"
              >
                <span>Open in Live Command Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Interactive Viewer Body */}
          {displayMode === 'slider' ? (
            <div className="relative h-[480px] sm:h-[560px] w-full overflow-hidden select-none bg-dark-950">
              {/* Post-Event (Background Layer) */}
              <div className="absolute inset-0">
                <img
                  src={current.postImage}
                  alt="Post-event flood inundation"
                  className="w-full h-full object-cover brightness-95"
                />
                {/* Simulated Flood Mask Overlay with high-tech cyan gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/70 via-blue-900/50 to-transparent pointer-events-none mix-blend-color-dodge"></div>
                <div className="absolute top-4 right-4 bg-dark-950/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 shadow-lg flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>POST-EVENT: Sentinel-1 SAR Detected Flood ({current.postDate})</span>
                </div>

                {/* Severed Bridge Indicators */}
                <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 bg-rose-600/90 text-white px-2 py-1 rounded text-[10px] font-bold border border-rose-400 shadow animate-pulse flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>SEVERED BRIDGE (Betrawati)</span>
                </div>
              </div>

              {/* Pre-Event (Clipped Layer controlled by sliderPosition) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={current.preImage}
                  alt="Pre-event normal landscape"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute top-4 left-4 bg-dark-950/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 shadow-lg flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>PRE-EVENT: Baseline Optical Surface ({current.preDate})</span>
                </div>
              </div>

              {/* Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-dark-950 shadow-xl">
                  <Sliders className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ) : (
            /* Side by Side Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 h-[480px] sm:h-[560px] w-full bg-dark-950">
              {/* Pre-event */}
              <div className="relative h-full border-b md:border-b-0 md:border-r border-dark-800 overflow-hidden">
                <img
                  src={current.preImage}
                  alt="Pre-event baseline"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-dark-950/80 backdrop-blur border border-slate-700 px-2.5 py-1 rounded text-xs font-semibold text-slate-200">
                  Pre-Event: {current.preDate}
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-dark-950/85 backdrop-blur p-2.5 rounded-lg text-xs border border-dark-750 text-slate-300">
                  Normal river flow, intact bridges, stable slope topography.
                </div>
              </div>

              {/* Post-event */}
              <div className="relative h-full overflow-hidden">
                <img
                  src={current.postImage}
                  alt="Post-event flood"
                  className="w-full h-full object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/60 to-transparent pointer-events-none"></div>
                <div className="absolute top-3 left-3 bg-dark-950/80 backdrop-blur border border-cyan-500/50 px-2.5 py-1 rounded text-xs font-semibold text-cyan-300">
                  Post-Event SAR Inundation: {current.postDate}
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-dark-950/85 backdrop-blur p-2.5 rounded-lg text-xs border border-cyan-800/40 text-slate-200">
                  <span className="text-cyan-400 font-bold">+{current.netInundation}</span> flooded area identified by low radar backscatter (&lt; -16 dB).
                </div>
              </div>
            </div>
          )}

          {/* Explanation Footer Card */}
          <div className="p-4 bg-dark-850 border-t border-dark-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Multimodal Sensor Fusion Physics:</span>{' '}
                {current.description}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 shrink-0 font-mono">
              <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-700">Copernicus Sentinel-1</span>
              <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-700">WorldDEM-30</span>
              <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-700">OpenStreetMap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
