import React, { useState } from 'react';
import {
  Satellite,
  Lock,
  User,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.login({
        username: username.trim(),
        password: password.trim(),
      });
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        'Authentication failed. Please verify your credentials or register a new responder profile.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
      {/* Background Subtle Radar Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <button
            onClick={onNavigateToHome}
            className="inline-flex items-center space-x-2.5 mb-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/50 group-hover:scale-105 transition">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              FloodGuard <span className="text-cyan-400">AI</span>
            </span>
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Incident Command Access
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Sign in to access real-time satellite telemetry, infrastructure damage mapping, and rescue routing.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or Registered Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. responder or commander"
                required
                className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/60 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Command Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Hackathon Preset Credentials */}
        <div className="mt-6 pt-5 border-t border-dark-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5 font-medium">
            <span className="flex items-center space-x-1">
              <KeyRound className="w-3 h-3 text-cyan-400" />
              <span>Hackathon Quick-Sign In:</span>
            </span>
            <span className="text-slate-500 text-[10px]">Click to auto-fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('responder', 'floodguard2026')}
              className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-left transition"
            >
              <div className="font-semibold text-cyan-300">Capt. Saurav Sharma</div>
              <div className="text-[10px] text-slate-400">Field GIS Coordinator</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('commander', 'disaster2026')}
              className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-left transition"
            >
              <div className="font-semibold text-cyan-300">Dr. Pratima Thapa</div>
              <div className="text-[10px] text-slate-400">Incident Commander</div>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-5 text-center text-xs text-slate-400">
          New disaster coordinator or field volunteer?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition"
          >
            Register new account
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-3 text-center">
          <button
            onClick={onNavigateToHome}
            className="text-[11px] text-slate-500 hover:text-slate-400 transition"
          >
            ← Return to Public Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
