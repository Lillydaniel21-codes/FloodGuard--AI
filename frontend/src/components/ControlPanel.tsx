import React from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Layers,
  Calendar,
  Satellite,
  Compass,
  Cpu,
  Info,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { AnalysisRequest, BBox } from '../types';

interface ControlPanelProps {
  requestParams: AnalysisRequest;
  onChangeParams: (params: AnalysisRequest) => void;
  onRunAnalysis: () => void;
  isProcessing: boolean;
  progressPercent: number;
  stageMessage: string;
  onResetParams: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  requestParams,
  onChangeParams,
  onRunAnalysis,
  isProcessing,
  progressPercent,
  stageMessage,
  onResetParams,
}) => {
  const bbox = requestParams.aoi_bbox || {
    min_lon: 85.08,
    min_lat: 27.88,
    max_lon: 85.35,
    max_lat: 28.18,
  };

  const updateBBox = (field: keyof BBox, value: number) => {
    onChangeParams({
      ...requestParams,
      aoi_bbox: {
        ...bbox,
        [field]: value,
      },
    });
  };

  return (
    <aside className="w-80 bg-dark-900 border-r border-dark-800 flex flex-col h-full overflow-y-auto select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Pipeline Parameters
          </h2>
        </div>
        <button
          onClick={onResetParams}
          disabled={isProcessing}
          title="Reset to Case Study Defaults"
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-3.5 space-y-4 flex-1 text-xs">
        {/* 1. Area of Interest (AOI) Bounds */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 font-semibold space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Area of Interest (BBox WGS84)</span>
          </label>
          <div className="grid grid-cols-2 gap-2 bg-dark-850 p-2.5 rounded-md border border-dark-750">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">Min Lon</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-dark-900 border border-dark-700 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                value={bbox.min_lon}
                onChange={(e) => updateBBox('min_lon', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono">Max Lon</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-dark-900 border border-dark-700 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                value={bbox.max_lon}
                onChange={(e) => updateBBox('max_lon', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono">Min Lat</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-dark-900 border border-dark-700 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                value={bbox.min_lat}
                onChange={(e) => updateBBox('min_lat', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono">Max Lat</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-dark-900 border border-dark-700 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                value={bbox.max_lat}
                onChange={(e) => updateBBox('max_lat', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* 2. Flood Event Date & Temporal Windows */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 font-semibold space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Event Date & Windows</span>
          </label>
          <div className="space-y-2 bg-dark-850 p-2.5 rounded-md border border-dark-750">
            <div>
              <span className="text-[10px] text-slate-400">Flood Event Date</span>
              <input
                type="date"
                className="w-full bg-dark-900 border border-dark-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                value={requestParams.event_date}
                onChange={(e) =>
                  onChangeParams({ ...requestParams, event_date: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">Pre-window</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="w-full bg-dark-900 border border-dark-700 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    value={requestParams.pre_event_window_days}
                    onChange={(e) =>
                      onChangeParams({
                        ...requestParams,
                        pre_event_window_days: parseInt(e.target.value) || 14,
                      })
                    }
                  />
                  <span className="text-[10px] text-slate-400">days</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Post-window</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="w-full bg-dark-900 border border-dark-700 rounded px-1.5 py-1 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    value={requestParams.post_event_window_days}
                    onChange={(e) =>
                      onChangeParams({
                        ...requestParams,
                        post_event_window_days: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                  <span className="text-[10px] text-slate-400">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Satellite Constellation Selection */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 font-semibold space-x-1.5">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>Satellite Sensor Source</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-dark-850 p-1 rounded-md border border-dark-750">
            {(['combined', 'sentinel-1', 'sentinel-2'] as const).map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() =>
                  onChangeParams({ ...requestParams, satellite_platform: plat })
                }
                className={`py-1.5 px-2 rounded text-[11px] font-medium capitalize transition-all ${
                  requestParams.satellite_platform === plat
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-900'
                }`}
              >
                {plat === 'combined' ? 'S1 + S2' : plat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Threshold Sliders */}
        <div className="space-y-3 bg-dark-850 p-2.5 rounded-md border border-dark-750">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 font-medium">SAR Backscatter Threshold</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {requestParams.radar_threshold_db.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-6.0"
              max="-1.5"
              step="0.1"
              value={requestParams.radar_threshold_db}
              onChange={(e) =>
                onChangeParams({
                  ...requestParams,
                  radar_threshold_db: parseFloat(e.target.value),
                })
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Drop below threshold indicates specular water attenuation.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 font-medium">Optical NDWI Threshold</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {requestParams.ndwi_threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={requestParams.ndwi_threshold}
              onChange={(e) =>
                onChangeParams({
                  ...requestParams,
                  ndwi_threshold: parseFloat(e.target.value),
                })
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 5. Toggles */}
        <div className="space-y-2 bg-dark-850 p-2.5 rounded-md border border-dark-750">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-300">DEM Downstream Flow Bonus</span>
            <input
              type="checkbox"
              checked={requestParams.include_dem_analysis}
              onChange={(e) =>
                onChangeParams({
                  ...requestParams,
                  include_dem_analysis: e.target.checked,
                })
              }
              className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">AI Segmentation Interface</span>
            </div>
            <input
              type="checkbox"
              checked={requestParams.use_ai_model}
              onChange={(e) =>
                onChangeParams({
                  ...requestParams,
                  use_ai_model: e.target.checked,
                })
              }
              className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Progress & Run Action */}
      <div className="p-3.5 border-t border-dark-800 bg-dark-950/80 space-y-2.5">
        {isProcessing && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-400 font-medium truncate">{stageMessage}</span>
              <span className="text-slate-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={onRunAnalysis}
          disabled={isProcessing}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Processing Satellite Scenes...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white text-white" />
              <span>RUN SATELLITE ANALYSIS</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
