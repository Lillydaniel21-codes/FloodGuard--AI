import React from 'react';
import {
  ShieldAlert,
  Droplets,
  Building,
  Route,
  AlertTriangle,
  Hospital,
  AlertOctagon,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AnalysisResponse } from '../types';
import { CopilotChat } from './CopilotChat';

interface IntelligencePanelProps {
  analysis: AnalysisResponse | null;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ analysis }) => {
  const metrics = analysis?.metrics;
  const isolatedSettlements = analysis?.isolated_settlements?.filter((s) => s.is_isolated) || [];

  return (
    <aside className="w-96 bg-dark-900 border-l border-dark-800 flex flex-col h-full overflow-hidden select-none">
      {/* Metrics Grid Header */}
      <div className="p-3.5 border-b border-dark-800 space-y-3 bg-dark-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Disaster Intelligence
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {analysis?.completed_at ? 'Analysis Active' : 'Waiting for Run'}
          </span>
        </div>

        {/* Rapid Alert Banner if Settlements are Cut Off */}
        {isolatedSettlements.length > 0 && (
          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-start space-x-2 text-rose-200">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <span className="font-extrabold text-rose-300">
                CRITICAL ISOLATION ALERT:
              </span>{' '}
              {isolatedSettlements.length} settlement(s) disconnected from hospitals:
              <span className="font-bold underline ml-1">
                {isolatedSettlements.map((s) => s.name).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Flood Extent */}
          <div className="bg-dark-850 p-2.5 rounded-lg border border-dark-750">
            <div className="flex items-center space-x-1 text-cyan-400 text-[10px] font-semibold">
              <Droplets className="w-3.5 h-3.5" />
              <span>Flood Extent</span>
            </div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {metrics ? `${metrics.total_flood_area_sqkm} km²` : '--'}
            </div>
            <p className="text-[10px] text-slate-400">
              SAR &plus; Optical confirmed
            </p>
          </div>

          {/* Buildings Affected */}
          <div className="bg-dark-850 p-2.5 rounded-lg border border-dark-750">
            <div className="flex items-center space-x-1 text-amber-400 text-[10px] font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Buildings Exposed</span>
            </div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {metrics ? `${metrics.buildings_affected}` : '--'}
              <span className="text-xs font-normal text-slate-400 ml-1">
                / {metrics?.buildings_total || 0}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">OSM Pre-event structures</p>
          </div>

          {/* Flooded Road km */}
          <div className="bg-dark-850 p-2.5 rounded-lg border border-dark-750">
            <div className="flex items-center space-x-1 text-rose-400 text-[10px] font-semibold">
              <Route className="w-3.5 h-3.5" />
              <span>Flooded Roads</span>
            </div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {metrics ? `${metrics.roads_flooded_km} km` : '--'}
            </div>
            <p className="text-[10px] text-slate-400">Pasang Lhamu corridor</p>
          </div>

          {/* Severed Bridges */}
          <div className="bg-dark-850 p-2.5 rounded-lg border border-dark-750">
            <div className="flex items-center space-x-1 text-rose-500 text-[10px] font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Severed Bridges</span>
            </div>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {metrics ? `${metrics.bridges_severed}` : '--'}
            </div>
            <p className="text-[10px] text-slate-400">Betrawati crossing wash</p>
          </div>

          {/* Cut-off Settlements */}
          <div className="bg-dark-850 p-2.5 rounded-lg border border-dark-750">
            <div className="flex items-center space-x-1 text-rose-400 text-[10px] font-semibold">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Cut-Off Settlements</span>
            </div>
            <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
              {metrics ? `${metrics.settlements_isolated}` : '--'}
            </div>
            <p className="text-[10px] text-slate-400">No vehicular egress</p>
          </div>

          {/* Referral Hospital */}
          <div className="bg-dark-850 p-2.5 rounded-lg border border-dark-750">
            <div className="flex items-center space-x-1 text-blue-400 text-[10px] font-semibold">
              <Hospital className="w-3.5 h-3.5" />
              <span>Referral Hospital</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
              Operational
            </div>
            <p className="text-[10px] text-slate-400">Trishuli Dist. Hospital</p>
          </div>
        </div>
      </div>

      {/* AI Situation-Report Copilot Section */}
      <div className="flex-1 p-3.5 overflow-hidden flex flex-col">
        <CopilotChat analysisId={analysis?.analysis_id || null} />
      </div>

      {/* Scientific Limitation Footer */}
      <div className="p-3 border-t border-dark-800 bg-dark-950/70 text-[10px] text-slate-400 flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <b>Sensor Uncertainty Notice:</b> Optical imagery has 46.8% monsoonal cloud cover; Sentinel-1 radar is the primary all-weather basis. Modeled road disconnect reflects vehicular access, not pedestrian trail condition. Field verification required.
        </p>
      </div>
    </aside>
  );
};
