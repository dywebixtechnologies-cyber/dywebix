/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, ArrowLeft, ArrowRight, FolderKanban, CheckCircle2, Clock, Hourglass, IndianRupee, Plus, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { Inquiry } from '../types';

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}

export function UserDashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Inquiry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('inquiries');
      const all: Inquiry[] = stored ? JSON.parse(stored) : [];
      const mine = all.filter(
        (inq) => inq.ownerEmail?.toLowerCase() === user?.email.toLowerCase()
      );
      // Newest first
      mine.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setProjects(mine);
    } catch {
      setProjects([]);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.hash = '';
  };

  // Leave the dashboard and smooth-scroll to the "Co-produce your design blueprint" form.
  const goToContact = () => {
    window.location.hash = '';
    // Wait for the public site to render, then scroll to the contact section.
    setTimeout(() => {
      const el = document.getElementById('contact-section');
      if (el) {
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 120);
  };

  const total = projects.length;
  const acceptedList = projects.filter((p) => p.accepted);
  const acceptedCount = acceptedList.length;
  const pendingCount = total - acceptedCount;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Logo size={32} />
            <div className="leading-none">
              <span className="font-mono text-[8px] tracking-widest uppercase block text-slate-400 font-semibold">dywebixtech</span>
              <span className="font-display font-medium text-sm tracking-tight block">My Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-black transition-colors">
              <ArrowLeft className="w-3 h-3" /> View site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 border border-slate-250 rounded px-3 py-1.5 hover:bg-slate-100 font-mono text-[10px] uppercase tracking-widest text-slate-600 transition-all cursor-pointer"
              id="user-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </div>
        </div>
      </header>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <div className="mb-12">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">[ CLIENT WORKSPACE ]</span>
            <h1 className="font-display font-light text-3xl md:text-5xl tracking-tight text-slate-950">
              Welcome, {user?.name.split(' ')[0]}.
            </h1>
            <p className="font-sans text-slate-500 text-sm md:text-base mt-3 font-light max-w-xl">
              Track the project ideas you've shared, see which ones the studio has accepted, and how long they've been in progress.
            </p>
          </div>

          {/* Overview metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">PROJECTS REQUESTED</span>
                <span className="font-sans font-bold text-3xl text-slate-900 leading-none block">{total}</span>
                <span className="text-slate-500 text-[10px] block font-light">Ideas you've submitted</span>
              </div>
              <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border border-slate-200/80">
                <FolderKanban className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">ACCEPTED BY ADMIN</span>
                <span className="font-sans font-bold text-3xl text-[#10b981] leading-none block">{acceptedCount}</span>
                <span className="text-slate-500 text-[10px] block font-light">Approved & in the pipeline</span>
              </div>
              <div className="w-10 h-10 rounded bg-emerald-50/40 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">AWAITING REVIEW</span>
                <span className="font-sans font-bold text-3xl text-slate-900 leading-none block">{pendingCount}</span>
                <span className="text-slate-500 text-[10px] block font-light">Pending the studio's response</span>
              </div>
              <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border border-slate-200/80">
                <Hourglass className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>

          {/* Projects list */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-900 font-semibold">Your Project Ideas</h2>
            <button
              onClick={goToContact}
              className="flex items-center gap-2 rounded-full bg-black h-10 px-5 text-white hover:bg-slate-900 font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Idea
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-md p-12 text-center flex flex-col items-center gap-4">
              <FolderKanban className="w-8 h-8 text-slate-300" />
              <p className="text-slate-500 text-sm font-light max-w-sm">
                You haven't shared any project ideas yet. Submit your first idea and it'll appear here once the studio reviews it.
              </p>
              <button
                onClick={goToContact}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 hover:gap-3 transition-all cursor-pointer"
              >
                Share an idea <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => {
                const days = daysSince(p.acceptedAt);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-md p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{p.id}</span>
                        {p.finished ? (
                          <span className="font-mono text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : p.accepted ? (
                          <span className="font-mono text-[9px] bg-[#10b981] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Accepted
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                            <Hourglass className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 text-sm font-medium truncate">{p.projectType || 'Custom project'}</p>
                      <p className="text-slate-500 text-xs font-light line-clamp-2">{p.details}</p>
                      {p.finished && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
                          <Sparkles className="w-3.5 h-3.5" /> Your idea is build...!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[8px] text-slate-400 uppercase tracking-wider block">Rate</span>
                        <span className="text-slate-900 text-sm font-semibold flex items-center gap-1">
                          {p.rate ? (
                            <><IndianRupee className="w-3.5 h-3.5 text-slate-400" />{p.rate.replace(/^₹/, '')}</>
                          ) : (
                            <span className="text-slate-400 font-normal text-xs">To be set</span>
                          )}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-mono text-[8px] text-slate-400 uppercase tracking-wider block">Since Accepted</span>
                        <span className="text-slate-900 text-sm font-semibold flex items-center gap-1">
                          {p.accepted && days !== null ? (
                            <><Clock className="w-3.5 h-3.5 text-slate-400" />{days} {days === 1 ? 'day' : 'days'}</>
                          ) : (
                            <span className="text-slate-400 font-normal text-xs">—</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
