import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Route,
  Hospital,
  MapPin,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { SettlementStatus } from '../types';

interface IsolatedSettlementsProps {
  settlements: SettlementStatus[];
}

export const IsolatedSettlements: React.FC<IsolatedSettlementsProps> = ({ settlements }) => {
  const isolated = settlements.filter((s) => s.is_isolated);
  const connected = settlements.filter((s) => !s.is_isolated);

  return (
    <div className="flex-1 p-6 bg-dark-950 overflow-y-auto select-none space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-100">
            Road Network Accessibility & Cut-Off Settlements Engine
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Graph-based topological analysis (NetworkX & Dijkstra shortest paths). Identifies populated places
          that have lost vehicular road connectivity to regional emergency hospitals due to flood inundation
          or bridge washouts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-900 border border-dark-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400">Total Evaluated Settlements</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {settlements.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Nuwakot & Rasuwa Districts</div>
        </div>

        <div className="bg-dark-900 border border-rose-900/50 p-4 rounded-lg bg-rose-950/20">
          <div className="text-xs text-rose-400 font-semibold">Modeled Cut-Off Settlements</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {isolated.length}
          </div>
          <div className="text-[11px] text-rose-300 mt-1">Zero vehicular hospital route remaining</div>
        </div>

        <div className="bg-dark-900 border border-emerald-900/50 p-4 rounded-lg bg-emerald-950/20">
          <div className="text-xs text-emerald-400 font-semibold">Intact Connected Settlements</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {connected.length}
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">Direct arterial road access open</div>
        </div>
      </div>

      {/* Critical Isolated Settlements List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
          <span>Priority 1: Severed Settlements (Immediate Rescue Priority)</span>
        </h3>

        {isolated.length === 0 ? (
          <div className="p-6 bg-dark-900 border border-dark-800 rounded-lg text-center text-slate-400 text-xs">
            No settlements currently detected as isolated.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isolated.map((s) => (
              <div
                key={s.id}
                className="bg-dark-900 border border-rose-900/60 rounded-lg p-4 space-y-3 shadow-lg shadow-rose-950/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                      <h4 className="font-extrabold text-base text-slate-100">{s.name}</h4>
                    </div>
                    <span className="text-xs text-slate-400">{s.district} District</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-950 text-rose-300 border border-rose-700">
                    Priority Rank #{s.priority_rank}
                  </span>
                </div>

                <div className="p-2.5 bg-dark-850 rounded border border-dark-750 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Hospital className="w-3.5 h-3.5 text-blue-400" />
                      <span>Nearest Hospital:</span>
                    </span>
                    <span className="font-semibold text-slate-200">{s.nearest_hospital_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Baseline Distance:</span>
                    <span className="font-mono text-slate-300">{s.baseline_travel_distance_km} km</span>
                  </div>

                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span>Post-Event Status:</span>
                    <span className="font-mono text-rose-400">NO ROUTE (INF)</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-400">
                    <span className="font-semibold text-slate-300">Critical Bottleneck:</span>{' '}
                    <span className="text-rose-300 underline font-bold">
                      {s.critical_bottleneck_road || 'Betrawati River Crossing'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {s.isolation_reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-dark-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Evidence: {s.evidence_quality}</span>
                  <span className="font-mono">
                    {s.coordinates[1].toFixed(3)}°N, {s.coordinates[0].toFixed(3)}°E
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Settlements List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
          Connected Settlements (Verified Route Available)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {connected.map((s) => (
            <div
              key={s.id}
              className="bg-dark-900 border border-dark-800 rounded-lg p-3 space-y-2 hover:border-dark-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{s.name}</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Passable</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>Hospital: {s.nearest_hospital_name}</div>
                <div>Distance: {s.baseline_travel_distance_km} km</div>
                {s.post_event_travel_distance_km && (
                  <div className="text-slate-300 font-mono">
                    Post-flood: {s.post_event_travel_distance_km} km
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
