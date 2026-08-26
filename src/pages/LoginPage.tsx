import React, { useState } from 'react';
import { Layers, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  availableUsers,
}) => {
  const [email, setEmail] = useState('chioma@stekentstore.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectUser = (u: User) => {
    setEmail(u.email);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#EEF0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-[6px] bg-[#146B4E] text-white shadow-xs mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-[#12231C] tracking-tight font-heading">
            STEKENTSTORECRM
          </h1>
          <p className="text-xs text-[#5B675E] mt-0.5 font-mono">
            The Manifest System • Staff Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF] border border-[#E2E5DD] rounded-[10px] p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#12231C] mb-1 font-heading">
            Sign in to your account
          </h2>
          <p className="text-xs text-[#5B675E] mb-5">
            Connected to PostgreSQL user ledger
          </p>

          {error && (
            <div className="mb-4 p-2.5 rounded-[6px] bg-[#F8E7E5] border border-[#B33A3A]/30 text-[#B33A3A] text-xs">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                Staff email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. chioma@stekentstore.com"
                  className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5B675E] uppercase tracking-wider mb-1 font-heading">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5B675E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FFFFFF] border border-[#E2E5DD] focus:border-[#146B4E] rounded-[6px] pl-9 pr-3 py-2 text-xs text-[#12231C] placeholder:text-[#5B675E]/60 outline-none font-mono"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-[6px] bg-[#146B4E] hover:bg-[#0f553e] text-white font-semibold text-xs shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-[#EEF0E8]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5B675E] font-heading">
                1-Click staff personas
              </span>
              <span className="text-[10px] text-[#5B675E] font-mono">Pass: password123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {availableUsers.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickSelectUser(u)}
                  className={`p-2 text-left rounded-[6px] border transition-all text-xs flex items-center justify-between ${
                    email === u.email
                      ? 'bg-[#E3F0E9] border-[#146B4E] text-[#146B4E]'
                      : 'bg-[#FAFBF9] border-[#E2E5DD] hover:bg-[#EEF0E8] text-[#12231C]'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-semibold text-[#12231C] truncate">{u.name}</div>
                    <div className="text-[10px] text-[#5B675E] capitalize font-mono">
                      {u.role.replace('_', ' ')}
                    </div>
                  </div>
                  {email === u.email && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#146B4E] shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
