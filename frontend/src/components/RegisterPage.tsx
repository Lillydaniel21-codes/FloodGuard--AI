import React, { useState } from 'react';
import {
  Satellite,
  User,
  Mail,
  Lock,
  Building2,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { UserProfile } from '../types';

interface RegisterPageProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onNavigateToHome,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agency, setAgency] = useState('Nepal Disaster Risk Reduction & Management Authority');
  const [role, setRole] = useState('Field GIS Operations Analyst');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const agencyPresets = [
    'Nepal NDRRMA (National Disaster Management)',
    'Armed Police Force (APF) Disaster Relief',
    'Nepal Red Cross Society (NRCS)',
    'UN OCHA / Emergency Telecommunications',
    'Department of Hydrology & Meteorology (DHM)',
    'Municipal Rapid Disaster Response Team',
    'Civil Protection Volunteer Organization',
  ];

  const rolePresets = [
    'Field GIS Operations Analyst',
    'Incident Response Commander',
    'UAV / Drone Reconnaissance Pilot',
    'Logistics & Supply Evacuation Officer',
    'Search & Rescue Team Lead',
    'Hydrological Remote Sensing Specialist',
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.register({
        username: username.trim(),
        email: email.trim(),
        password: password,
        full_name: fullName.trim(),
        agency: agency.trim(),
        role: role.trim(),
      });
      onRegisterSuccess(res.user);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        'Registration failed. A user with that username or email may already exist.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <button
            onClick={onNavigateToHome}
            className="inline-flex items-center space-x-2.5 mb-2 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/50 group-hover:scale-105 transition">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              FloodGuard <span className="text-cyan-400">AI</span>
            </span>
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Register Emergency Response Account
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Join the incident response network for live Copernicus SAR flood alerts and evacuation planning.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Adhikari"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Username *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ramesh_gis"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Work or Agency Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@ndrrma.gov.np"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Affiliated Agency / Response Organization
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                {agencyPresets.map((ag) => (
                  <option key={ag} value={ag} className="bg-dark-900 text-slate-200">
                    {ag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Disaster Response Role
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                {rolePresets.map((r) => (
                  <option key={r} value={r} className="bg-dark-900 text-slate-200">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/60 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Responder Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-cyan-300" />
                  <span>Create Account & Enter Incident Command</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Existing account link */}
        <div className="mt-5 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition"
          >
            Sign in here
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-2 text-center">
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
