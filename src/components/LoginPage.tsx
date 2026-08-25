/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../lib/firebase';
import { signInWithGoogle } from '../lib/googleAuth';

type Mode = 'login' | 'signup';

export function LoginPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>(
    typeof window !== 'undefined' && window.location.hash === '#signup' ? 'signup' : 'login'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const resetMessages = () => setError('');

  // Firebase Auth performs the OAuth handshake, so no separate Client ID is
  // needed — the button is usable as soon as the project config is present.
  const googleReady = isFirebaseConfigured();
  const [googleBusy, setGoogleBusy] = useState(false);

  const routeAfterAuth = (role?: 'admin' | 'user') => {
    // Admins land on the admin dashboard; users on their own dashboard.
    window.location.hash = role === 'admin' ? '#admin' : '#dashboard';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result =
      mode === 'login' ? login(email, password) : signup(name, email, password);

    if (!result.ok) {
      setError(result.error || 'Something went wrong.');
      return;
    }
    routeAfterAuth(result.user?.role);
  };

  const handleGoogle = () => {
    setGoogleBusy(true);
    void (async () => {
      const outcome = await signInWithGoogle();
      if (!outcome.ok) {
        setGoogleBusy(false);
        if (outcome.error) setError(outcome.error);
        return;
      }

      // Hand the Google-verified identity to the local account store.
      const result = loginWithGoogle(outcome.name, outcome.email);
      setGoogleBusy(false);
      if (result.ok) routeAfterAuth(result.user?.role);
      else setError(result.error || 'Google sign-in failed.');
    })();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col items-center justify-center px-6 py-10 font-sans antialiased">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[360px] bg-white border border-slate-200 rounded-xl shadow-md p-6 flex flex-col gap-4"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo variant="full" size={34} />
          <div>
            <h1 className="font-display font-semibold text-lg tracking-tight text-slate-950">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">
              Account
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); resetMessages(); }}
            className={`py-2 rounded font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); resetMessages(); }}
            className={`py-2 rounded font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={(e) => { setName(e.target.value); resetMessages(); }}
                className="h-10 px-4 border border-slate-200 text-sm rounded bg-[#F8F9FA]/40 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); resetMessages(); }}
              className="h-10 px-4 border border-slate-200 text-sm rounded bg-[#F8F9FA]/40 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-slate-400 uppercase tracking-wider" htmlFor="auth-password">Password</label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); resetMessages(); }}
                className="w-full h-10 pl-4 pr-11 border border-slate-200 text-sm rounded bg-[#F8F9FA]/40 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer focus:outline-none"
                id="auth-password-toggle"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <span className="text-[11px] text-red-500 font-mono">{error}</span>}

          <button
            type="submit"
            className="mt-1 h-10 rounded bg-black text-white text-xs font-mono tracking-widest uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="auth-submit-btn"
          >
            {mode === 'login' ? (
              <><LogIn className="w-4 h-4" /> Log in</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create account</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">or</span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleBusy}
          className="h-10 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 text-sm font-medium text-slate-700 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          id="auth-google-btn"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          {googleBusy ? 'Opening Google…' : 'Continue with Google'}
        </button>

        {!googleReady && (
          <p className="font-mono text-[8.5px] text-slate-400 text-center leading-relaxed">
            Google sign-in is unavailable: this build has no Firebase config.
            Set the VITE_FIREBASE_* variables where the site is hosted.
          </p>
        )}

        <p className="font-mono text-[9px] text-slate-400 text-center leading-relaxed flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3" /> Studio administrators sign in here too.
        </p>

        <a href="/" className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to site
        </a>
      </motion.div>
    </div>
  );
}
