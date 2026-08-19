/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inquiry } from '../types';
import { Trash2, CheckCircle, Mail, MessageSquare, BookOpen, IndianRupee, Search, PlusCircle, LayoutGrid, CheckSquare, BarChart, ArrowRight, Users } from 'lucide-react';
import { getRegisteredUserCount } from '../context/AuthContext';

interface AdminInboxProps {
  onInquiryCountChange: () => void;
}

export function AdminInbox({ onInquiryCountChange }: AdminInboxProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [rateDraft, setRateDraft] = useState('');

  // Load inquiries initially and listen for counts
  const loadInquiries = () => {
    try {
      const storedStr = localStorage.getItem('inquiries');
      if (storedStr) {
        setInquiries(JSON.parse(storedStr));
      } else {
        // Pre-populate with one lovely sample if completely empty
        const sampleInquiry: Inquiry = {
          id: 'PROJ-1',
          name: 'Adrian Croft',
          email: 'adrian@creativeagency.co',
          company: 'Croft Creative Studio',
          projectType: 'Creative Agency/Editorial Portfolio',
          budget: '₹2,50,000 - ₹4,00,000',
          timeline: 'Standard (3-4 weeks)',
          details: 'We are looking for a highly refined portfolio gallery to showcase our architectural renders. Needs to load within 0.8 seconds and support smooth high-fidelity transitions between pages.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          read: false
        };
        localStorage.setItem('inquiries', JSON.stringify([sampleInquiry]));
        setInquiries([sampleInquiry]);
      }
    } catch (err) {
      console.error('Error loading Admin inquiries', err);
    }
  };

  useEffect(() => {
    loadInquiries();
    setUserCount(getRegisteredUserCount());
  }, []);

  // Keep the rate input in sync with whichever inquiry is selected.
  useEffect(() => {
    setRateDraft(selectedInquiry?.rate ?? '');
  }, [selectedInquiry?.id]);

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedInquiries = inquiries.map((inq) => {
      if (inq.id === id) {
        return { ...inq, read: !inq.read };
      }
      return inq;
    });

    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    setInquiries(updatedInquiries);
    // If the selected inquiry is being read, update selectedInquiry state too
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) => prev ? { ...prev, read: !prev.read } : null);
    }
    onInquiryCountChange();
  };

  const persistInquiries = (updated: Inquiry[]) => {
    localStorage.setItem('inquiries', JSON.stringify(updated));
    setInquiries(updated);
  };

  const handleToggleAccept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedInquiries = inquiries.map((inq) => {
      if (inq.id === id) {
        const nextAccepted = !inq.accepted;
        return {
          ...inq,
          accepted: nextAccepted,
          // Stamp the acceptance date so the client can see how many days have passed.
          acceptedAt: nextAccepted ? new Date().toISOString() : undefined,
        };
      }
      return inq;
    });

    persistInquiries(updatedInquiries);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(updatedInquiries.find((i) => i.id === id) ?? null);
    }
    onInquiryCountChange();
  };

  const handleToggleFinished = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedInquiries = inquiries.map((inq) => {
      if (inq.id === id) {
        const nextFinished = !inq.finished;
        return {
          ...inq,
          finished: nextFinished,
          finishedAt: nextFinished ? new Date().toISOString() : undefined,
        };
      }
      return inq;
    });
    persistInquiries(updatedInquiries);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(updatedInquiries.find((i) => i.id === id) ?? null);
    }
  };

  const handleSetRate = (id: string) => {
    const updatedInquiries = inquiries.map((inq) =>
      inq.id === id ? { ...inq, rate: rateDraft.trim() || undefined } : inq
    );
    persistInquiries(updatedInquiries);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(updatedInquiries.find((i) => i.id === id) ?? null);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to permanently delete this inquiry?');
    if (!confirmed) return;

    const filtered = inquiries.filter((inq) => inq.id !== id);
    localStorage.setItem('inquiries', JSON.stringify(filtered));
    setInquiries(filtered);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }
    onInquiryCountChange();
  };

  const handleSelectInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    // Auto-mark as read when selected
    if (!inq.read) {
      const updated = inquiries.map((item) => {
        if (item.id === inq.id) {
          return { ...item, read: true };
        }
        return item;
      });
      localStorage.setItem('inquiries', JSON.stringify(updated));
      setInquiries(updated);
      setSelectedInquiry({ ...inq, read: true });
      onInquiryCountChange();
    }
  };

  // Math metrics for high portfolio-craftsmanship
  const totalVolume = inquiries.length;
  const unreadVolume = inquiries.filter((inq) => !inq.read).length;

  // Revenue = sum of rates on FINISHED projects only (earned, not just promised).
  const pipelineValue = inquiries.reduce((sum, inq) => {
    if (!inq.finished) return sum;
    const digits = (inq.rate ?? '').replace(/[^\d]/g, '');
    return sum + (digits ? parseInt(digits, 10) : 0);
  }, 0);

  // Filter inquiries based on typing search terms
  const searchedInquiries = inquiries.filter((inq) => 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inq.company && inq.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    inq.projectType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="admin-section" className="py-24 px-6 bg-[#F8F9FA] border-t border-slate-205">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
              [ 04 / BACKOFFICE INBOX ]
            </span>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-tight text-slate-950">
              Administrative Inquiry Console.
            </h2>
          </div>
          <p className="font-sans text-slate-500 max-w-sm text-sm md:text-base leading-relaxed font-light">
            An active active administrative terminal designed for the studio designer. Read new briefs, manage available slot quotas, and calculate current project pipelines.
          </p>
        </div>

        {/* METRICS ROW (Admin Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">

          <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">REGISTERED USERS</span>
              <span className="font-sans font-bold text-3xl text-slate-900 leading-none block">{userCount}</span>
              <span className="text-slate-500 text-[10px] block font-light">Client accounts created</span>
            </div>
            <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border border-slate-200/80">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">TOTAL SUBMISSIONS</span>
              <span className="font-sans font-bold text-3xl text-slate-900 leading-none block">{totalVolume}</span>
              <span className="text-slate-500 text-[10px] block font-light">Project ideas received</span>
            </div>
            <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border border-slate-200/80">
              <MessageSquare className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">UNREAD MESSAGES</span>
              <span className="font-sans font-bold text-3xl text-[#10b981] leading-none block flex items-center gap-2">
                {unreadVolume}
                {unreadVolume > 0 && (
                  <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                )}
              </span>
              <span className="text-slate-500 text-[10px] block font-light">Requires immediate follow-up</span>
            </div>
            <div className="w-10 h-10 rounded bg-emerald-50/15 flex items-center justify-center border border-emerald-100">
              <Mail className="w-4 h-4 text-[#10b981]" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">EARNED REVENUE</span>
              <span className="font-sans font-bold text-3xl text-slate-900 leading-none block">
                ₹{pipelineValue.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-500 text-[10px] block font-light">From finished projects only</span>
            </div>
            <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border border-slate-200/80">
              <IndianRupee className="w-4 h-4 text-slate-600" />
            </div>
          </div>

        </div>

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="admin-workspace-split">
          
          {/* LEFT LIST BOARD - 5 Columns */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, brief, budget..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-11 pr-4 border border-slate-200 text-xs rounded-md bg-white focus:border-slate-950 focus:outline-none"
                id="admin-search-input"
              />
            </div>

            {/* List Holder */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {searchedInquiries.length > 0 ? (
                searchedInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  return (
                    <div
                      key={inq.id}
                      onClick={() => handleSelectInquiry(inq)}
                      className={`p-4 border rounded-md transition-all cursor-pointer flex flex-col justify-between group relative ${
                        isSelected 
                          ? 'border-black bg-slate-50 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                      id={`inq-item-${inq.id}`}
                    >
                      {/* Read unread status indicator dot */}
                      {!inq.read && (
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[9px] bg-slate-50 border border-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded">
                          {inq.id}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">
                          {new Date(inq.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-900 group-hover:text-black truncate mb-1">
                        {inq.name}
                        {inq.company && <span className="text-xs text-slate-500 font-light"> at {inq.company}</span>}
                      </div>

                      <div className="text-xs text-slate-500 font-light line-clamp-1 mb-2">
                        {inq.details}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                        <span className="text-[10px] font-mono font-medium text-slate-500">
                          {inq.projectType}
                        </span>
                        
                        {/* Interactive actions */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleToggleRead(inq.id, e)}
                            className="p-1 text-slate-400 hover:text-black font-mono text-[9px] uppercase tracking-wide cursor-pointer focus:outline-none"
                            title={inq.read ? 'Mark as Unread' : 'Mark as Read'}
                            id={`toggle-read-btn-${inq.id}`}
                          >
                            {inq.read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={(e) => handleDelete(inq.id, e)}
                            className="p-1 text-slate-400 hover:text-red-500 cursor-pointer focus:outline-none"
                            title="Delete Permanently"
                            id={`delete-inq-btn-${inq.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded text-slate-400 font-mono text-xs">
                  No submissions match search terms.
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT DETAIL CARD PANEL - 7 Columns */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-8 rounded-md shadow-xs min-h-[460px]">
            <AnimatePresence mode="wait">
              {selectedInquiry ? (
                <motion.div
                  key={selectedInquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 flex flex-col justify-between h-full"
                  id="inq-detail-pane"
                >
                  
                  {/* Header info */}
                  <div className="space-y-1.5 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-slate-400">INSPECTING BLUEPRINT</span>
                      <div className="flex items-center gap-2">
                        {selectedInquiry.finished ? (
                          <span className="font-mono text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Finished
                          </span>
                        ) : selectedInquiry.accepted ? (
                          <span className="font-mono text-[9px] bg-[#10b981] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Accepted
                          </span>
                        ) : null}
                        <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{selectedInquiry.id}</span>
                      </div>
                    </div>
                    <h3 className="font-sans font-semibold text-2xl text-slate-950 tracking-tight leading-none mt-2">
                       {selectedInquiry.name}
                    </h3>
                    <div className="text-slate-500 font-mono text-xs flex flex-wrap items-center gap-3">
                      <span>{selectedInquiry.email}</span>
                      {selectedInquiry.company && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>{selectedInquiry.company}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Logistics Specs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded border border-slate-205 font-mono text-xs text-slate-650">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Scope Architecture</span>
                      <span className="text-slate-900 font-medium block">{selectedInquiry.projectType}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Logged On</span>
                      <span className="text-slate-900 font-medium block">
                        {new Date(selectedInquiry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Order Management — set / edit the project rate */}
                  <div className="bg-white border border-slate-200 rounded p-4 space-y-2">
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block">Project Rate (visible to the client)</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1 border border-slate-200 rounded px-3 h-10 bg-[#F8F9FA]/40 focus-within:border-slate-950 transition-colors">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 2,50,000"
                          value={rateDraft}
                          onChange={(e) => setRateDraft(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-slate-900 focus:outline-none"
                          id="inq-rate-input"
                        />
                      </div>
                      <button
                        onClick={() => handleSetRate(selectedInquiry.id)}
                        className="rounded bg-black text-white text-[10px] font-mono tracking-widest uppercase px-4 h-10 hover:bg-slate-900 transition-all cursor-pointer"
                        id="inq-set-rate-btn"
                      >
                        Save
                      </button>
                    </div>
                    {selectedInquiry.accepted && selectedInquiry.acceptedAt && (
                      <span className="font-mono text-[10px] text-emerald-600 block">
                        Accepted on {new Date(selectedInquiry.acceptedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    )}
                  </div>

                  {/* Body Client specs brief */}
                  <div className="flex-1 space-y-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">PROJECT SCOPE SPECIFICATION SUMMARY:</span>
                    <div className="p-5 border border-slate-200 rounded text-sm text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                      {selectedInquiry.details}
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={(e) => handleToggleAccept(selectedInquiry.id, e)}
                        className={`flex items-center gap-1.5 rounded px-4 py-2 font-mono text-xs transition-all cursor-pointer ${
                          selectedInquiry.accepted
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-[#10b981] text-white hover:bg-emerald-600'
                        }`}
                        id="inq-accept-btn-pane"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {selectedInquiry.accepted ? 'Accepted — Undo' : 'Accept Project'}
                      </button>
                      {selectedInquiry.accepted && (
                        <button
                          onClick={(e) => handleToggleFinished(selectedInquiry.id, e)}
                          className={`flex items-center gap-1.5 rounded px-4 py-2 font-mono text-xs transition-all cursor-pointer ${
                            selectedInquiry.finished
                              ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                          id="inq-finish-btn-pane"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {selectedInquiry.finished ? 'Finished — Reopen' : 'Mark as Finished'}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleToggleRead(selectedInquiry.id, e)}
                        className="flex items-center gap-1.5 border border-slate-250 rounded px-4 py-2 hover:bg-slate-50 font-mono text-xs text-slate-600 transition-all cursor-pointer"
                        id="inq-read-toggle-btn-pane"
                      >
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        {selectedInquiry.read ? 'Mark as Unread' : 'Mark as Read'}
                      </button>
                      <button
                        onClick={(e) => handleDelete(selectedInquiry.id, e)}
                        className="flex items-center gap-1.5 border border-slate-250 hover:border-red-400 hover:text-red-500 hover:bg-red-50/10 rounded px-4 py-2 font-mono text-xs text-slate-600 transition-all cursor-pointer"
                        id="inq-delete-btn-pane"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                        Delete Inquiry
                      </button>
                    </div>

                    <a
                      href={`mailto:${selectedInquiry.email}?subject=dywebixtech Service Quote Receipt #${selectedInquiry.id}`}
                      className="rounded bg-black hover:bg-slate-905 text-white text-xs font-mono tracking-widest uppercase py-3.5 px-6 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      id="inq-reply-email-btn"
                    >
                      Draft Reply Message <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </motion.div>
              ) : (
                <div className="py-24 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-4">
                  <BookOpen className="w-6 h-6 text-slate-300" />
                  <span>Select an inquiry timeline on the left to review architectural requirements.</span>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
