import React from 'react';
import {
  Satellite,
  Shield,
  Activity,
  Layers,
  MapPin,
  Route,
  Building,
  AlertTriangle,
  ArrowRight,
  Bot,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Radio,
  Eye,
  Zap,
  Globe2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

interface HomePageProps {
  currentUser: UserProfile | null;
  onNavigateToMap: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToComparison: () => void;
  onOpenAttribution: () => void;
  onTriggerChat: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  onNavigateToMap,
  onNavigateToDashboard,
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToComparison,
  onOpenAttribution,
  onTriggerChat,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 text-slate-100 select-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-dark-800">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Hackathon Track B Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-6 shadow-sm shadow-cyan-950/50">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Multimodal AI Hackathon 2026 • Track B: Satellite Damage & Rescue Intelligence</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Next-Gen Satellite Flood Intelligence & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Rapid Rescue Routing</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Fusing all-weather Copernicus Sentinel-1 SAR microwave radar, optical imagery, and digital elevation models to autonomously detect severed bridges, cut-off Himalayan settlements, and safe evacuation corridors.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onNavigateToMap}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-950/80 flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Flood Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {currentUser ? (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-6 py-3.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-cyan-300 border border-cyan-800/60 font-bold text-sm transition flex items-center space-x-2 shadow-sm"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Go to My Dashboard</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={onNavigateToRegister}
                    className="px-6 py-3.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-100 border border-dark-700 font-bold text-sm transition flex items-center space-x-2 shadow-sm"
                  >
                    <span>Get Started</span>
                  </button>

                  <button
                    onClick={onNavigateToLogin}
                    className="px-5 py-3.5 rounded-xl bg-dark-900/80 hover:bg-dark-850 text-cyan-300 border border-cyan-800/40 font-semibold text-sm transition flex items-center space-x-2"
                  >
                    <span>Sign In</span>
                  </button>
                </>
              )}

              <button
                onClick={onTriggerChat}
                className="px-5 py-3.5 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-300 border border-dark-700 font-semibold text-sm transition flex items-center space-x-2 group"
              >
                <Bot className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
                <span>Chat with AI</span>
              </button>
            </div>
          </div>

          {/* Hero Satellite Visual Card */}
          <div className="mt-12 lg:mt-16 relative max-w-5xl mx-auto rounded-2xl overflow-hidden border border-dark-750 shadow-2xl bg-dark-900 group">
            <div className="relative h-72 sm:h-96 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
                alt="Copernicus Sentinel Earth Observation"
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent"></div>

              {/* In-image Status Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-dark-900/90 backdrop-blur-md border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Sentinel-1 SAR C-Band Radar (5.405 GHz)</span>
                </span>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-lg bg-dark-900/90 backdrop-blur-md border border-dark-700 text-xs font-semibold text-slate-300">
                  WorldDEM-30 Hydrologic D8 Flow
                </span>
              </div>

              {/* Before/After Promo Banner inside Hero image */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/90 backdrop-blur-md border border-dark-700 p-4 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Multi-Temporal Flood Validation • Trishuli River Basin</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Pre-flood baseline vs post-flood radar backscatter anomaly (+4.87 km² inundated, 4 severed bridges).
                  </div>
                </div>

                <button
                  onClick={onNavigateToComparison}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
                >
                  <span>Launch Satellite Comparison</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters Bar */}
      <section className="bg-dark-900/70 border-b border-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-cyan-400">4.87 km²</div>
              <div className="text-xs font-medium text-slate-400">Inundated Area Mapped</div>
              <div className="text-[10px] text-slate-500">Trishuli River Valley (Aug 2026)</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-emerald-400">100%</div>
              <div className="text-xs font-medium text-slate-400">Cloud Penetration</div>
              <div className="text-[10px] text-slate-500">Synthetic Aperture Radar (SAR)</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-indigo-400">74.8%</div>
              <div className="text-xs font-medium text-slate-400">IoU vs EMSR927</div>
              <div className="text-[10px] text-slate-500">Copernicus EMS Ground Truth</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl lg:text-4xl font-black text-rose-400">4 Severed</div>
              <div className="text-xs font-medium text-slate-400">Critical River Crossings</div>
              <div className="text-[10px] text-slate-500">Betrawati, Dhunche, Syabrubesi</div>
            </div>

            <div className="space-y-1 col-span-2 md:col-span-1">
              <div className="text-3xl lg:text-4xl font-black text-cyan-400">&lt; 1.2s</div>
              <div className="text-xs font-medium text-slate-400">Graph Reachability Time</div>
              <div className="text-[10px] text-slate-500">NetworkX Connected Components</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards Section */}
      <section id="features" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            Multimodal AI Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Disaster Intelligence Stack
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Four interconnected engineering modules designed for rapid, cloud-independent emergency response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1: Satellite Flood Detection */}
          <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
              <Satellite className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              1. All-Weather Satellite Flood Detection
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Severe storms generate 100% optical cloud blindness. FloodGuard fuses Sentinel-1 SAR C-band microwave radar (5.405 GHz) to detect specular reflection from flood water (&lt; -16 dB), complemented by Sentinel-2 MSI NDWI when cloud gaps permit.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-cyan-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Sentinel-1 C-Band SAR</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Specular Reflectance</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">NDWI Multi-spectral</span>
            </div>
          </div>

          {/* Feature 2: AI Damage Assessment */}
          <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              2. Structural Damage & Population Exposure
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Performs topological intersection between detected flood masks and OpenStreetMap building polygons. Automatically flags residential exposure, healthcare vulnerability, and displaced household estimates.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-blue-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">OSM Building Polygons</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Hospital Triage</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Displacement Metric</span>
            </div>
          </div>

          {/* Feature 3: Infrastructure Damage */}
          <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              3. Road Network & Bridge Severance Analysis
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Constructs a live NetworkX topological road graph. Inundated highway segments and severed bridges are removed dynamically to compute isolated subgraphs, identifying communities with zero vehicular egress.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-rose-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">NetworkX Graph Theory</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Broken Edge Detection</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Cut-Off Settlements</span>
            </div>
          </div>

          {/* Feature 4: Rescue Route Planning */}
          <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              4. Safe Evacuation Corridors & Terrain Flow
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Simulates hydrologic flow propagation across WorldDEM-30 digital elevation models using D8 steepest descent. Generates safe evacuation corridors and automated helicopter drop-zone coordinates for stranded survivors.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-emerald-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">WorldDEM-30 Hydrology</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">D8 Flow Tracing</span>
              <span className="px-2 py-0.5 rounded bg-dark-850 border border-dark-750">Airdrop Helipad Grids</span>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Showcase */}
      <section className="py-16 bg-dark-900/40 border-t border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                Real-World Disaster Scenarios
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Verified Himalayan Case Studies
              </h2>
            </div>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
            >
              <span>Explore full interactive map data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Case 1 */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/40 transition group">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                  alt="Trishuli River Valley"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-85"
                />
                <div className="absolute top-3 left-3 bg-cyan-950/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800">
                  EMSR927 VALIDATED
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-base">Trishuli River Flash Flood</h3>
                <p className="text-slate-400 text-xs mt-1 mb-3">
                  Steep mountain gorge event with 4 severed bridges and 3 isolated settlements including Syabrubesi and Mailung.
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-dark-800">
                  <span className="text-slate-400 font-mono">Aug 2026</span>
                  <button
                    onClick={onNavigateToMap}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                  >
                    <span>View Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Case 2 */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/40 transition group">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
                  alt="Koshi River Basin"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-85"
                />
                <div className="absolute top-3 left-3 bg-blue-950/90 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-800">
                  ALLUVIAL PLAIN
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-base">Koshi River Embankment Breach</h3>
                <p className="text-slate-400 text-xs mt-1 mb-3">
                  Lowland alluvial plain inundation mapped across wide agricultural tracts with over 28.8 km² inundated.
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-dark-800">
                  <span className="text-slate-400 font-mono">Sept 2026</span>
                  <button
                    onClick={onNavigateToMap}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                  >
                    <span>View Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Case 3 */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/40 transition group">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1519074069444-1ba4e3b1c67e?auto=format&fit=crop&w=800&q=80"
                  alt="Melamchi Debris Flow"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-85"
                />
                <div className="absolute top-3 left-3 bg-amber-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-800">
                  SEDIMENT SURGE
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-base">Melamchi Debris Flow</h3>
                <p className="text-slate-400 text-xs mt-1 mb-3">
                  High-velocity sediment surge in V-shaped Himalayan gorge requiring DEM-assisted slope filtering.
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-dark-800">
                  <span className="text-slate-400 font-mono">Jul 2026</span>
                  <button
                    onClick={onNavigateToMap}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                  >
                    <span>View Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Copilot Highlight Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-cyan-950/50 border border-cyan-500/30 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grounded Situation-Report Copilot</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bilingual AI Emergency Intelligence
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Equipped with deterministic anti-hallucination guardrails. The AI copilot inspects the active satellite raster masks and NetworkX road graphs before answering, providing verified facts in both English and Nepali (नेपाली).
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onTriggerChat}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/60 flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Open Emergency Copilot</span>
              </button>
              <button
                onClick={onNavigateToComparison}
                className="px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-semibold text-xs transition"
              >
                Compare Satellite Rasters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 pt-12 pb-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white">
                  <Satellite className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  FloodGuard <span className="text-cyan-400">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Autonomous satellite flood detection, infrastructure damage assessment, and rescue intelligence for rapid disaster management.
              </p>
              <div className="text-[10px] text-cyan-400/90 font-mono">
                Multimodal AI Hackathon 2026 • Track B
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Navigation</div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onNavigateToMap} className="hover:text-cyan-300 transition">
                    Command Map
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToComparison} className="hover:text-cyan-300 transition">
                    Satellite Comparison
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToDashboard} className="hover:text-cyan-300 transition">
                    User Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={onTriggerChat} className="hover:text-cyan-300 transition">
                    AI Emergency Copilot
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal & Data Attribution */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Data Attributions</div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onOpenAttribution} className="hover:text-amber-300 transition">
                    Copernicus Sentinel (ESA Open Access)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAttribution} className="hover:text-amber-300 transition">
                    OpenStreetMap Foundation (ODbL)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAttribution} className="hover:text-amber-300 transition">
                    WorldDEM-30 Global Elevation
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAttribution} className="hover:text-amber-300 transition">
                    Copernicus EMS EMSR927 Rapid Mapping
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Operations & Auth */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Responder Access</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Field analysts and incident commanders can authenticate to export official 1-page SitRep PDFs.
              </p>
              <div className="pt-2 flex flex-col space-y-1.5">
                <button
                  onClick={currentUser ? onNavigateToDashboard : onNavigateToLogin}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-cyan-300 border border-dark-700 text-left font-semibold"
                >
                  {currentUser ? `Signed In as ${currentUser.username}` : 'Incident Command Sign In →'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2026 FloodGuard AI. Built for Multimodal AI Hackathon 2026. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onOpenAttribution} className="hover:text-slate-400">
                Licensing & Attribution
              </button>
              <span>•</span>
              <span>System Version 2.4.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
