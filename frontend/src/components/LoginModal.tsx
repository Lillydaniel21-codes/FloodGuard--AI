import React, { useState } from 'react';
import { X, Shield, Lock, User, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { apiClient } from '../services/api';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogoutSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogoutSuccess,
}) => {
  const [username, setUsername] = useState('responder');
  const [password, setPassword] = useState('floodguard2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await apiClient.login({ username, password });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      onLogoutSuccess();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPresetAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-dark-900 border border-dark-750 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {currentUser ? 'Emergency Responder Session' : 'Incident Command Access'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-dark-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4">
              <div className="bg-dark-850 border border-emerald-800/80 p-3.5 rounded-lg flex items-start space-x-3 text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">{currentUser.full_name}</div>
                  <div className="text-cyan-300 font-mono text-[11px]">{currentUser.role}</div>
                  <div className="text-slate-400 text-[11px]">{currentUser.agency}</div>
                  <div className="text-slate-500 text-[10px] font-mono">User ID: {currentUser.user_id}</div>
                </div>
              </div>

              <div className="p-3 bg-dark-850 rounded border border-dark-750 text-[11px] text-slate-400">
                Active incident command session allows submitting live satellite analysis requests,
                triggering downstream terrain simulations, and exporting authenticated SitRep reports.
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Incident Command</span>
              </button>
            </div>
          ) : (
            /* Log In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Quick Fill Responder Accounts */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  Quick Responder Profiles (Hackathon Credentials):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectPresetAccount('responder', 'floodguard2026')}
                    className={`p-2 rounded text-left border transition-all ${
                      username === 'responder'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-dark-850 border-dark-750 text-slate-300 hover:bg-dark-800'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Capt. Sharma</div>
                    <div className="text-[9px] text-slate-400">NDRRMA GIS Responder</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPresetAccount('commander', 'disaster2026')}
                    className={`p-2 rounded text-left border transition-all ${
                      username === 'commander'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-dark-850 border-dark-750 text-slate-300 hover:bg-dark-800'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Dr. Thapa</div>
                    <div className="text-[9px] text-slate-400">Incident Commander</div>
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                  Username or Call Sign
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-750 rounded px-2.5 pl-8 py-1.5 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. responder"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                  Security Access Passcode
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-850 border border-dark-750 rounded px-2.5 pl-8 py-1.5 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                    placeholder="Enter passcode"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Command'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
