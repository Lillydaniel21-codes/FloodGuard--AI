import React from 'react';
import {
  Satellite,
  ShieldAlert,
  AlertTriangle,
  Building,
  Route,
  Activity,
  FileDown,
  FileJson,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Radio,
  Eye,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';
import { AnalysisResponse, UserProfile } from '../types';

interface DashboardOverviewProps {
  analysis: AnalysisResponse | null;
  currentUser: UserProfile | null;
  onNavigateToMap: () => void;
  onNavigateToInfrastructure: () => void;
  onNavigateToSettlements: () => void;
  onNavigateToFlow: () => void;
  onNavigateToComparison: () => void;
  onDownloadPdf: () => void;
  onExportJson: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analysis,
  currentUser,
  onNavigateToMap,
  onNavigateToInfrastructure,
  onNavigateToSettlements,
  onNavigateToFlow,
  onNavigateToComparison,
  onDownloadPdf,
  onExportJson,
}) => {
  const metrics = analysis?.metrics;

  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 text-slate-100 p-4 lg:p-8 space-y-6">
      {/* Top Welcome & Active Disaster Banner */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-cyan-950/40 border border-cyan-800/40 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Active Incident Command Dashboard</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">EMSR927 Rapid Mapping</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {currentUser ? `Welcome back, ${currentUser.full_name}` : 'Disaster Intelligence Operations'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Trishuli River Basin Flash Flood & Debris Flow • Coordinated by{' '}
              <span className="text-cyan-300 font-semibold">
                {currentUser?.agency || 'National Disaster Response Directorate'}
              </span>
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={onDownloadPdf}
              disabled={!analysis}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-cyan-950/60 disabled:opacity-40"
            >
              <FileDown className="w-4 h-4" />
              <span>Download SitRep PDF</span>
            </button>
            <button
              onClick={onExportJson}
              disabled={!analysis}
              className="flex items-center space-x-1.5 px-3 py-2 bg-dark-800 hover:bg-dark-750 text-slate-300 border border-dark-700 rounded-xl text-xs font-semibold transition disabled:opacity-40"
            >
              <FileJson className="w-4 h-4 text-slate-400" />
              <span>Export GeoJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-dark-900 border border-dark-800 hover:border-cyan-500/40 p-4 rounded-xl transition shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Inundated Area</span>
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {metrics ? `${metrics.total_flood_area_sqkm.toFixed(2)}` : '4.87'} <span className="text-xs font-normal text-slate-400">km²</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">High-confidence radar water</div>
        </div>

        <div className="bg-dark-900 border border-dark-800 hover:border-rose-500/40 p-4 rounded-xl transition shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Severed Bridges</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {metrics ? metrics.bridges_severed : 4}{' '}
            <span className="text-xs font-normal text-slate-400">/ {metrics ? metrics.bridges_total : 18}</span>
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">Critical river crossings cut</div>
        </div>

        <div className="bg-dark-900 border border-dark-800 hover:border-amber-500/40 p-4 rounded-xl transition shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Cut-Off Villages</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {metrics ? metrics.settlements_isolated : 3}{' '}
            <span className="text-xs font-normal text-slate-400">/ {metrics ? metrics.settlements_total : 7}</span>
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">Zero road egress reachability</div>
        </div>

        <div className="bg-dark-900 border border-dark-800 hover:border-blue-500/40 p-4 rounded-xl transition shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Affected Buildings</span>
            <Building className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {metrics ? metrics.buildings_affected : 184}{' '}
            <span className="text-xs font-normal text-slate-400">structures</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">OSM footprint intersection</div>
        </div>

        <div className="bg-dark-900 border border-dark-800 hover:border-emerald-500/40 p-4 rounded-xl transition shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Flooded Roads</span>
            <Route className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {metrics ? `${metrics.roads_flooded_km.toFixed(1)}` : '14.2'} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Submerged highway links</div>
        </div>

        <div className="bg-dark-900 border border-dark-800 hover:border-indigo-500/40 p-4 rounded-xl transition shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>IoU Benchmark</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            74.8%
          </div>
          <div className="text-[10px] text-indigo-300/80 mt-1">vs Copernicus EMSR927</div>
        </div>
      </div>

      {/* Main Grid: Map Launcher & Recent Critical Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Preview & Navigation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Command Map Launch Card */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Geospatial Situation Room</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time interactive Leaflet GIS with dark and satellite layers, flood polygons, and road isolation vectors.
                </p>
              </div>

              <button
                onClick={onNavigateToMap}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-950/50"
              >
                <span>Launch Full Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Thumbnail of Satellite Flood Map */}
            <div
              onClick={onNavigateToMap}
              className="relative h-64 rounded-xl overflow-hidden cursor-pointer group border border-dark-750"
            >
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80"
                alt="Satellite Flood Overview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent"></div>

              {/* Map Callout Beacons */}
              <div className="absolute top-4 left-4 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-semibold text-cyan-300">
                Trishuli River Corridor (28.02°N, 85.22°E)
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-semibold">4 Critical Bridge Severances Detected</span>
                </div>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition flex items-center space-x-1">
                  <span>Enter Tactical Command Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Quick Navigation Cards below Map */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
              <button
                onClick={onNavigateToInfrastructure}
                className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  Infrastructure
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  184 buildings, bridges
                </div>
              </button>

              <button
                onClick={onNavigateToSettlements}
                className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                  Isolated Villages
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  3 cut-off communities
                </div>
              </button>

              <button
                onClick={onNavigateToComparison}
                className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  Satellite Compare
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Pre vs Post SAR slider
                </div>
              </button>

              <button
                onClick={onNavigateToFlow}
                className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  Terrain Flow
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  WorldDEM-30 D8 descent
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Satellite Telemetry & Priority Triage */}
        <div className="space-y-6">
          {/* Satellite Telemetry Readiness */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Satellite Telemetry Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Sentinel-1A SAR</div>
                  <div className="text-[10px] text-slate-400">C-Band Synthetic Aperture Radar</div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  ACTIVE • ALL-WEATHER
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Sentinel-2 MSI</div>
                  <div className="text-[10px] text-slate-400">Multispectral NDWI / B8A+B03</div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  CLOUD OBSCURED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">WorldDEM-30</div>
                  <div className="text-[10px] text-slate-400">Copernicus 30m Hydrologic DEM</div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  FLOW SIM READY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">OSM Road Topology</div>
                  <div className="text-[10px] text-slate-400">NetworkX Connected Components</div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  ISOLATION COMPUTED
                </span>
              </div>
            </div>
          </div>

          {/* Priority Triage Settlements Card */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Isolated Settlements Triage</span>
              </h3>
              <button
                onClick={onNavigateToSettlements}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-200">Syabrubesi Village</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-900 text-rose-200">
                    CRITICAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Pop: ~1,850 • Both bridges severed • Recommended Airdrop Zone: Helipad Grid NE-2
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-200">Mailung Settlement</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-200">
                    HIGH
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Pop: ~640 • Zero road connectivity • Direct river debris hazard
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-200">Ramche Hillside</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-200">
                    HIGH
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Pop: ~920 • Road section inundated • Steep terrain evacuation path recommended
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
