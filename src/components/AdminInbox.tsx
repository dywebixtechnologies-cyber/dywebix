/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inquiry } from '../types';
import { Trash2, CheckCircle, Mail, MessageSquare, BookOpen, IndianRupee, Search, CheckSquare, ArrowRight, Users } from 'lucide-react';
import { getRegisteredUserCount } from '../context/AuthContext';
import { deleteInquiry, listInquiries, updateInquiry } from '../lib/inquiries';

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
    listInquiries()
      .then(setInquiries)
      .catch((err) => console.error('Error loading Admin inquiries', err));
  };

  useEffect(() => {
    loadInquiries();
    void getRegisteredUserCount().then(setUserCount).catch(() => setUserCount(0));
  }, []);

  // Keep the rate input in sync with whichever inquiry is selected.
  useEffect(() => {
    setRateDraft(selectedInquiry?.rate ?? '');
  }, [selectedInquiry?.id]);

  /**
   * Update one inquiry locally straight away, then write it to the store.
   * Keeps the UI instant while the database round-trip happens in the background.
   */
  const applyPatch = (id: string, patch: Partial<Inquiry>) => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, ...patch } : inq)));
    setSelectedInquiry((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
    updateInquiry(id, patch).catch((err) => {
      console.error('Could not save that change', err);
      loadInquiries(); // Re-sync from the store so the UI stops showing a write that failed.
    });
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = inquiries.find((inq) => inq.id === id);
    if (!current) return;
    applyPatch(id, { read: !current.read });
    onInquiryCountChange();
  };

  const handleToggleAccept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = inquiries.find((inq) => inq.id === id);
    if (!current) return;
    const nextAccepted = !current.accepted;
    applyPatch(id, {
      accepted: nextAccepted,
      // Stamp the acceptance date so the client can see how many days have passed.
      acceptedAt: nextAccepted ? new Date().toISOString() : undefined,
    });
    onInquiryCountChange();
  };

  const handleToggleFinished = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = inquiries.find((inq) => inq.id === id);
    if (!current) return;
    const nextFinished = !current.finished;
    applyPatch(id, {
      finished: nextFinished,
      finishedAt: nextFinished ? new Date().toISOString() : undefined,
    });
  };

  const handleSetRate = (id: string) => {
    applyPatch(id, { rate: rateDraft.trim() || undefined });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to permanently delete this inquiry?');
    if (!confirmed) return;

    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (selectedInquiry?.id === id) setSelectedInquiry(null);
    deleteInquiry(id).catch((err) => {
      console.error('Could not delete that inquiry', err);
      loadInquiries();
    });
    onInquiryCountChange();
  };

  const handleSelectInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    // Auto-mark as read when selected
    if (!inq.read) {
      applyPatch(inq.id, { read: true });
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
    <section id="admin-section" className="py-24 px-6 bg-[#EEF4FC] border-t border-[#cbdff5]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
              [ 04 / BACKOFFICE INBOX ]
            </span>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-tight text-[#072750]">
              Administrative Inquiry Console.
            </h2>
          </div>
          <p className="font-sans text-slate-500 max-w-sm text-sm md:text-base leading-relaxed font-light">
            An active active administrative terminal designed for the studio designer. Read new briefs, manage available slot quotas, and calculate current project pipelines.
          </p>
        </div>

        {/* METRICS ROW (Admin Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">

          <div className="bg-white border border-[#cbdff5] p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">REGISTERED USERS</span>
              <span className="font-sans font-bold text-3xl text-[#0b3566] leading-none block">{userCount}</span>
              <span className="text-slate-500 text-[10px] block font-light">Client accounts created</span>
            </div>
            <div className="w-10 h-10 rounded bg-[#eef4fc] flex items-center justify-center border border-slate-200/80">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          <div className="bg-white border border-[#cbdff5] p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">TOTAL SUBMISSIONS</span>
              <span className="font-sans font-bold text-3xl text-[#0b3566] leading-none block">{totalVolume}</span>
              <span className="text-slate-500 text-[10px] block font-light">Project ideas received</span>
            </div>
            <div className="w-10 h-10 rounded bg-[#eef4fc] flex items-center justify-center border border-slate-200/80">
              <MessageSquare className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          <div className="bg-white border border-[#cbdff5] p-6 rounded-md shadow-xs flex items-center justify-between">
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

          <div className="bg-white border border-[#cbdff5] p-6 rounded-md shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block">EARNED REVENUE</span>
              <span className="font-sans font-bold text-3xl text-[#0b3566] leading-none block">
                ₹{pipelineValue.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-500 text-[10px] block font-light">From finished projects only</span>
            </div>
            <div className="w-10 h-10 rounded bg-[#eef4fc] flex items-center justify-center border border-slate-200/80">
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
                className="w-full h-11 pl-11 pr-4 border border-[#cbdff5] text-xs rounded-md bg-white focus:border-slate-950 focus:outline-none"
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
                          ? 'border-[#0c6fc2] bg-[#eef4fc] shadow-xs' 
                          : 'border-[#cbdff5] bg-white hover:border-slate-400'
                      }`}
                      id={`inq-item-${inq.id}`}
                    >
                      {/* Read unread status indicator dot */}
                      {!inq.read && (
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-[9px] bg-[#eef4fc] border border-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded">
                          {inq.id}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">
                          {new Date(inq.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-[#0b3566] group-hover:text-[#0c6fc2] truncate mb-1">
                        {inq.name}
                        {inq.company && <span className="text-xs text-slate-500 font-light"> at {inq.company}</span>}
                      </div>

                      <div className="text-xs text-slate-500 font-light line-clamp-1 mb-2">
                        {inq.details}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#dfeaf8] pt-2 mt-2">
                        <span className="text-[10px] font-mono font-medium text-slate-500">
                          {inq.projectType}
                        </span>
                        
                        {/* Interactive actions */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleToggleRead(inq.id, e)}
                            className="p-1 text-slate-400 hover:text-[#0c6fc2] font-mono text-[9px] uppercase tracking-wide cursor-pointer focus:outline-none"
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
                <div className="text-center py-12 border border-dashed border-[#cbdff5] rounded text-slate-400 font-mono text-xs">
                  No submissions match search terms.
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT DETAIL CARD PANEL - 7 Columns */}
          <div className="lg:col-span-7 bg-white border border-[#cbdff5] p-8 rounded-md shadow-xs min-h-[460px]">
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
                  <div className="space-y-1.5 border-b border-[#dfeaf8] pb-4">
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
                        <span className="font-mono text-[9px] bg-[#0c6fc2] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{selectedInquiry.id}</span>
                      </div>
                    </div>
                    <h3 className="font-sans font-semibold text-2xl text-[#072750] tracking-tight leading-none mt-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#EEF4FC] p-4 rounded border border-[#cbdff5] font-mono text-xs text-slate-600">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Scope Architecture</span>
                      <span className="text-[#0b3566] font-medium block">{selectedInquiry.projectType}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Logged On</span>
                      <span className="text-[#0b3566] font-medium block">
                        {new Date(selectedInquiry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Order Management — set / edit the project rate */}
                  <div className="bg-white border border-[#cbdff5] rounded p-4 space-y-2">
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block">Project Rate (visible to the client)</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1 border border-[#cbdff5] rounded px-3 h-10 bg-[#EEF4FC]/40 focus-within:border-slate-950 transition-colors">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 2,50,000"
                          value={rateDraft}
                          onChange={(e) => setRateDraft(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-[#0b3566] focus:outline-none"
                          id="inq-rate-input"
                        />
                      </div>
                      <button
                        onClick={() => handleSetRate(selectedInquiry.id)}
                        className="rounded bg-[#0c6fc2] text-white text-[10px] font-mono tracking-widest uppercase px-4 h-10 hover:bg-[#072750] transition-all cursor-pointer"
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
                    <div className="p-5 border border-[#cbdff5] rounded text-sm text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                      {selectedInquiry.details}
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="border-t border-[#dfeaf8] pt-6 flex flex-wrap items-center justify-between gap-4">
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
                        className="flex items-center gap-1.5 border border-[#cbdff5] rounded px-4 py-2 hover:bg-[#eef4fc] font-mono text-xs text-slate-600 transition-all cursor-pointer"
                        id="inq-read-toggle-btn-pane"
                      >
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        {selectedInquiry.read ? 'Mark as Unread' : 'Mark as Read'}
                      </button>
                      <button
                        onClick={(e) => handleDelete(selectedInquiry.id, e)}
                        className="flex items-center gap-1.5 border border-[#cbdff5] hover:border-red-400 hover:text-red-500 hover:bg-red-50/10 rounded px-4 py-2 font-mono text-xs text-slate-600 transition-all cursor-pointer"
                        id="inq-delete-btn-pane"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                        Delete Inquiry
                      </button>
                    </div>

                    <a
                      href={`mailto:${selectedInquiry.email}?subject=dywebixtech Service Quote Receipt #${selectedInquiry.id}`}
                      className="rounded bg-[#0c6fc2] hover:bg-[#072750] text-white text-xs font-mono tracking-widest uppercase py-3.5 px-6 flex items-center justify-center gap-2 cursor-pointer transition-all"
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
