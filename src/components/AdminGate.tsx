/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Lock, LogOut, ArrowLeft, LogIn } from 'lucide-react';
import { Logo } from './Logo';
import { AdminInbox } from './AdminInbox';
import { useAuth } from '../context/AuthContext';

interface AdminGateProps {
  unreadCount: number;
  onInquiryCountChange: () => void;
}

export function AdminGate({ unreadCount, onInquiryCountChange }: AdminGateProps) {
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.hash = '';
  };

  // --- Not an admin: access denied ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col items-center justify-center px-6 font-sans antialiased">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-sm p-8 flex flex-col gap-6 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-xl tracking-tight text-slate-950">Admin Access Only</h1>
              <p className="font-sans text-xs uppercase tracking-[0.08em] text-slate-400 mt-1">Restricted — Studio Owner</p>
            </div>
          </div>

          <p className="text-slate-500 text-sm font-light leading-relaxed">
            {user
              ? `You're signed in as a standard user (${user.email}). This dashboard is reserved for the studio administrator.`
              : 'You need to sign in with the administrator account to view this dashboard.'}
          </p>

          <a
            href="#login"
            className="h-11 rounded bg-black text-white text-xs font-sans tracking-[0.08em] uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> Go to login
          </a>

          <a href="/" className="flex items-center justify-center gap-1.5 font-sans text-xs uppercase tracking-[0.08em] text-slate-400 hover:text-black transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to public site
          </a>
        </motion.div>
      </div>
    );
  }

  // --- Admin: full dashboard ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Logo variant="full" size={30} />
            <span className="h-6 w-px bg-slate-200" />
            <span className="font-display font-medium text-sm tracking-tight text-slate-900">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.08em] text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                {unreadCount} new
              </span>
            )}
            <a href="/" className="hidden sm:flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.08em] text-slate-500 hover:text-black transition-colors">
              <ArrowLeft className="w-3 h-3" /> View site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-100 font-sans text-xs uppercase tracking-[0.08em] text-slate-600 transition-all cursor-pointer"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </div>
        </div>
      </header>

      <AdminInbox onInquiryCountChange={onInquiryCountChange} />
    </div>
  );
}
