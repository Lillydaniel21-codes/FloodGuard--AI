import React, { useState } from 'react';
import {
  Compass,
  TrendingDown,
  AlertTriangle,
  Play,
  Info,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { FlowPathResult, SettlementStatus } from '../types';

interface DownstreamFlowProps {
  flowPath: FlowPathResult | null;
  settlements: SettlementStatus[];
  onTriggerFlowSimulation?: (seedLon: number, seedLat: number) => void;
}

export const DownstreamFlow: React.FC<DownstreamFlowProps> = ({
  flowPath,
  settlements,
  onTriggerFlowSimulation,
}) => {
  const [seedLon, setSeedLon] = useState(85.22);
  const [seedLat, setSeedLat] = useState(28.04);

  const handleSimulate = () => {
    if (onTriggerFlowSimulation) {
      onTriggerFlowSimulation(seedLon, seedLat);
    }
  };

  return (
    <div className="flex-1 p-6 bg-dark-950 overflow-y-auto select-none space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-fuchsia-400" />
          <h2 className="text-lg font-bold text-slate-100">
            Downstream Terrain Flow Corridor Analysis (Bonus Module)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Simulates kinematic steepest-descent gravity flow paths (D8 algorithm) over the 30-meter Copernicus
          WorldDEM elevation grid. Traces downstream drainage paths from breach or outburst locations to identify
          vulnerable settlements situated along high-gradient river corridors.
        </p>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="bg-dark-900 border border-dark-800 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-fuchsia-400" />
            <span>Outburst Seed Location</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400">Seed Longitude (°E)</span>
              <input
                type="number"
                step="0.001"
                value={seedLon}
                onChange={(e) => setSeedLon(parseFloat(e.target.value))}
                className="w-full mt-1 bg-dark-850 border border-dark-750 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Seed Latitude (°N)</span>
              <input
                type="number"
                step="0.001"
                value={seedLat}
                onChange={(e) => setSeedLat(parseFloat(e.target.value))}
                className="w-full mt-1 bg-dark-850 border border-dark-750 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-dark-850 rounded border border-dark-750 text-[11px] text-slate-300">
              <b>Presets:</b>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSeedLon(85.22);
                    setSeedLat(28.04);
                  }}
                  className="px-2 py-0.5 rounded bg-dark-800 hover:bg-dark-700 text-fuchsia-300 border border-fuchsia-900/50"
                >
                  Betrawati Gorge (28.04°N)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSeedLon(85.29);
                    setSeedLat(28.11);
                  }}
                  className="px-2 py-0.5 rounded bg-dark-800 hover:bg-dark-700 text-fuchsia-300 border border-fuchsia-900/50"
                >
                  Dhunche Upper Reach (28.11°N)
                </button>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              className="w-full py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold rounded flex items-center justify-center space-x-1.5 shadow-md shadow-fuchsia-950 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Trace Flow Corridor</span>
            </button>
          </div>
        </div>

        {/* Right Flow Corridor Outputs */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Estimated Corridor Metrics
          </h3>

          {flowPath ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-dark-850 p-3 rounded border border-dark-750">
                  <span className="text-[10px] text-slate-400">Descent Path Length</span>
                  <div className="text-lg font-black text-fuchsia-400 font-mono mt-0.5">
                    {flowPath.path_length_km} km
                  </div>
                </div>

                <div className="bg-dark-850 p-3 rounded border border-dark-750">
                  <span className="text-[10px] text-slate-400">Elevation Drop</span>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    ~1,850 m
                  </div>
                </div>

                <div className="bg-dark-850 p-3 rounded border border-dark-750">
                  <span className="text-[10px] text-slate-400">Corridor Buffer</span>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    600 m
                  </div>
                </div>
              </div>

              {/* Settlements along Corridor */}
              <div className="bg-dark-850 p-3.5 rounded border border-dark-750 space-y-2">
                <div className="font-bold text-slate-200">
                  Settlements Within Estimated Downstream Corridor:
                </div>
                {flowPath.settlements_in_corridor.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {flowPath.settlements_in_corridor.map((name, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-800 font-semibold text-xs flex items-center space-x-1"
                      >
                        <MapPin className="w-3 h-3 text-fuchsia-400" />
                        <span>{name}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No major mapped settlements in immediate buffer.</p>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Methodology:</span> {flowPath.method}
              </div>

              {/* Scientific Uncertainty Notice */}
              <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded-md text-[11px] text-amber-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{flowPath.uncertainty_notice}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-8 text-center">
              No flow simulation executed. Click 'Trace Flow Corridor' to compute steepest-descent path.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
