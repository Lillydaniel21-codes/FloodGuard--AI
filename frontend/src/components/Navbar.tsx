import React, { useState } from 'react';
import {
  Satellite,
  ShieldAlert,
  FileDown,
  Database,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
  FileJson,
  UserCheck,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  Sliders,
  Building,
  Route,
  Activity,
} from 'lucide-react';
import { AnalysisResponse, CaseStudyPreset, UserProfile } from '../types';

export type ViewState =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'infrastructure'
  | 'settlements'
  | 'satellite'
  | 'flow'
  | 'evaluation'
  | 'login'
  | 'register';

interface NavbarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  caseStudies: CaseStudyPreset[];
  selectedPreset: string;
  onSelectPreset: (id: string) => void;
  analysis: AnalysisResponse | null;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenAttribution: () => void;
  onDownloadPdf: () => void;
  onExportJson: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  caseStudies,
  selectedPreset,
  onSelectPreset,
  analysis,
  currentUser,
  onLogout,
  onOpenAttribution,
  onDownloadPdf,
  onExportJson,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNav = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-dark-900 border-b border-dark-800 px-3 sm:px-5 py-2.5 flex items-center justify-between select-none z-30 shadow-lg relative">
      {/* Brand & Preset */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center space-x-2.5 group focus:outline-none text-left"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-950/60 group-hover:scale-105 transition">
            <Satellite className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                FloodGuard <span className="text-cyan-400 font-black">AI</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-dark-800 text-cyan-300 border border-cyan-800/50 rounded">
                Track B
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
              Satellite Flood Damage Mapping & Rescue
            </p>
          </div>
        </button>

        {/* Case Study Preset Selector (Show on Map/Dashboard views) */}
        {(currentView === 'map' || currentView === 'dashboard') && (
          <div className="hidden xl:flex items-center bg-dark-850 border border-dark-750 rounded-lg px-2.5 py-1 text-xs space-x-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Incident:</span>
            <select
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              value={selectedPreset}
              onChange={(e) => onSelectPreset(e.target.value)}
            >
              {caseStudies.map((cs) => (
                <option key={cs.id} value={cs.id} className="bg-dark-900 text-slate-200">
                  {cs.title} ({cs.event_date})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center bg-dark-950/80 p-1 border border-dark-800 rounded-xl text-xs space-x-1">
        {/* Always visible: Home */}
        <button
          onClick={() => handleNav('home')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentView === 'home'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
          }`}
        >
          Home
        </button>

        {/* If logged in: Show Dashboard */}
        {currentUser && (
          <button
            onClick={() => handleNav('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
            }`}
          >
            Dashboard
          </button>
        )}

        {/* Command Map */}
        <button
          onClick={() => handleNav('map')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentView === 'map'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
          }`}
        >
          Live Flood Map
        </button>

        {/* Satellite Compare */}
        <button
          onClick={() => handleNav('satellite')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            currentView === 'satellite'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
          }`}
        >
          Satellite Compare
        </button>

        {/* Additional Tactical Views */}
        {currentUser ? (
          <>
            <button
              onClick={() => handleNav('infrastructure')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'infrastructure'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
              }`}
            >
              Infrastructure ({analysis?.metrics?.buildings_affected ?? 184})
            </button>

            <button
              onClick={() => handleNav('settlements')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'settlements'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
              }`}
            >
              Cut-Off Villages ({analysis?.metrics?.settlements_isolated ?? 3})
            </button>

            <button
              onClick={() => handleNav('flow')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'flow'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
              }`}
            >
              Terrain Flow
            </button>

            <button
              onClick={() => handleNav('evaluation')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'evaluation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
              }`}
            >
              EMSR927 Validation
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (currentView !== 'home') handleNav('home');
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-850 transition"
            >
              Features
            </button>

            <button
              onClick={onOpenAttribution}
              className="px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-850 transition"
            >
              About & Data
            </button>
          </>
        )}
      </nav>

      {/* Right Actions & Auth */}
      <div className="flex items-center space-x-2">
        {/* PDF SitRep Export */}
        <button
          onClick={onDownloadPdf}
          disabled={!analysis}
          title="Download 1-Page Official Situation Report PDF"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-dark-850 hover:bg-dark-750 text-cyan-300 border border-cyan-800/40 rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>SitRep PDF</span>
        </button>

        {/* Data Sources / Attribution */}
        <button
          onClick={onOpenAttribution}
          title="Data Sources, Attributions & Licensing"
          className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 bg-dark-850 hover:bg-dark-750 text-slate-300 border border-dark-700 rounded-xl text-xs font-medium transition"
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Attribution</span>
        </button>

        {/* Auth Buttons */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/80 border border-cyan-700/60 text-cyan-200 hover:bg-cyan-900/60 transition shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="max-w-[120px] truncate">{currentUser.full_name.split(' ')[0]}</span>
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-dark-900 border border-dark-750 rounded-2xl shadow-2xl p-3 z-50 text-xs">
                <div className="pb-2.5 mb-2.5 border-b border-dark-800">
                  <div className="font-bold text-white">{currentUser.full_name}</div>
                  <div className="text-[11px] text-cyan-400 font-medium">{currentUser.role}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.agency}</div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleNav('dashboard');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-dark-800 text-slate-200 transition"
                  >
                    Incident Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleNav('map');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-dark-800 text-slate-200 transition"
                  >
                    Command Map
                  </button>
                  <button
                    onClick={() => {
                      onOpenAttribution();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-dark-800 text-slate-200 transition"
                  >
                    Data Attributions
                  </button>
                </div>

                <div className="pt-2 mt-2 border-t border-dark-800">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 transition font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNav('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-850 hover:bg-dark-800 border border-dark-700 text-slate-200 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => handleNav('register')}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition shadow-md shadow-cyan-950/50"
            >
              <span>Get Started</span>
            </button>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-xl bg-dark-850 text-slate-400 hover:text-white border border-dark-700 transition"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-dark-900/98 backdrop-blur-lg border-b border-dark-800 p-4 space-y-2 lg:hidden shadow-2xl z-50 text-xs">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-dark-800 font-medium"
          >
            Home
          </button>
          {currentUser && (
            <button
              onClick={() => handleNav('dashboard')}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-dark-800 font-medium"
            >
              User Dashboard
            </button>
          )}
          <button
            onClick={() => handleNav('map')}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-dark-800 font-medium"
          >
            Live Flood Map
          </button>
          <button
            onClick={() => handleNav('satellite')}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-dark-800 font-medium"
          >
            Satellite Comparison Slider
          </button>
          {currentUser ? (
            <>
              <button
                onClick={() => handleNav('infrastructure')}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-dark-800 font-medium"
              >
                Infrastructure ({analysis?.metrics?.buildings_affected ?? 184})
              </button>
              <button
                onClick={() => handleNav('settlements')}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-dark-800 font-medium"
              >
                Cut-Off Villages ({analysis?.metrics?.settlements_isolated ?? 3})
              </button>
              <button
                onClick={() => handleNav('flow')}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-dark-800 font-medium"
              >
                Terrain Flow
              </button>
              <button
                onClick={() => handleNav('evaluation')}
                className="w-full text-left px-3 py-2 rounded-xl text-indigo-300 hover:bg-dark-800 font-medium"
              >
                EMSR927 Validation
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('login')}
                className="w-full text-left px-3 py-2 rounded-xl text-cyan-300 hover:bg-dark-800 font-bold"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full text-left px-3 py-2 rounded-xl text-blue-300 hover:bg-dark-800 font-bold"
              >
                Register Account
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
