/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECT_TYPES } from '../data/portfolioData';
import { Inquiry } from '../types';
import { CheckCircle2, FileCheck, Send, Sparkles, MessageCircle, LogIn } from 'lucide-react';
import { Loader } from './Loader';
import { createInquiry, listInquiries, listInquiriesFor } from '../lib/inquiries';
import { useAuth, isAuthConfigured } from '../context/AuthContext';

// Studio WhatsApp contact (India, +91). Shown once a client has shared an idea.
const WHATSAPP_NUMBER = '917397075166';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi! I just submitted a project idea on dywebixtech and would like to discuss it."
)}`;

interface ContactFormProps {
  selectedPresetService: string;
  onInquirySubmitted: () => void;
}

export function ContactForm({ selectedPresetService, onInquirySubmitted }: ContactFormProps) {
  const { user, loginWithGoogle } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const googleReady = isAuthConfigured();

  const handleGoogleSignIn = () => {
    if (!googleReady) {
      setGoogleError('Google sign-in is not configured yet.');
      return;
    }
    setGoogleBusy(true);
    setGoogleError('');
    void (async () => {
      // On success the browser navigates to Google, so nothing below runs.
      const result = await loginWithGoogle();
      setGoogleBusy(false);
      if (!result.ok) setGoogleError(result.error || 'Google sign-in failed.');
    })();
  };

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget] = useState('Not specified');
  const [timeline] = useState('Not specified');
  const [details, setDetails] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<string | null>(null);
  const [hasSharedIdea, setHasSharedIdea] = useState(false);

  // Prefill the profile from the logged-in account and check prior submissions.
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      listInquiriesFor(user.id)
        .then((mine) => setHasSharedIdea(mine.length > 0))
        .catch(() => setHasSharedIdea(false));
    }
  }, [user]);

  // Automatically update the selected project type if the user chose a service card from above
  useEffect(() => {
    if (selectedPresetService) {
      // Attempt to match with listed categories
      const foundType = PROJECT_TYPES.find(t => 
        t.toLowerCase().includes(selectedPresetService.toLowerCase()) || 
        selectedPresetService.toLowerCase().includes(t.toLowerCase())
      );
      if (foundType) {
        setProjectType(foundType);
      } else {
        // Fallback or custom
        setProjectType(selectedPresetService);
      }
    }
  }, [selectedPresetService]);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Full name is required';
    
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Please provide a valid email format';
    }

    if (!details.trim()) {
      tempErrors.details = 'Project specs or brief is required';
    } else if (details.trim().length < 15) {
      tempErrors.details = 'Please tell us slightly more detail (minimum 15 characters)';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    void (async () => {
      try {
        // Read the existing inquiries to assign the next sequential project token
        // (PROJ-1, PROJ-2, ...). Fine at this scale; a busy inbox would want a
        // server-side counter instead.
        const existingInquiries = await listInquiries();
        const maxProjNum = existingInquiries.reduce((max, inq) => {
          const match = /PROJ-(\d+)/.exec(inq.id);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        const projectId = 'PROJ-' + (maxProjNum + 1);

        const newInquiry: Inquiry = {
          id: projectId,
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          projectType,
          budget,
          timeline,
          details: details.trim(),
          timestamp: new Date().toISOString(),
          read: false,
          accepted: false,
          ownerEmail: user?.email,
          // What the RLS insert policy checks: you may only file under your own id.
          ownerId: user?.id
        };

        await createInquiry(newInquiry);

        // Reset only the project-specific fields (keep the signed-in profile).
        setCompany('');
        setDetails('');
        setProjectType('');

        setSubmissionReceipt(projectId);
        setHasSharedIdea(true);
        onInquirySubmitted(); // Notify parent state to increment badges
      } catch (err) {
        console.error('Could not save the inquiry', err);
        setErrors({ submit: 'Could not send your brief. Check your connection and try again.' });
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section id="contact-section" className="py-24 px-6 bg-[#F8F9FA] border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="font-sans text-xs text-slate-400 uppercase tracking-[0.08em] block mb-3">
              Start a project
            </span>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-tight text-slate-950">
              Co-produce your design blueprint.
            </h2>

            {/* WhatsApp quick-chat — appears once the client has shared an idea */}
            {user && hasSharedIdea && (
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white h-11 px-5 font-sans text-xs tracking-[0.08em] uppercase font-semibold transition-all hover:gap-3 shadow-sm"
                id="whatsapp-chat-btn"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            )}
          </div>
          <p className="font-sans text-slate-500 max-w-sm text-sm md:text-base leading-relaxed font-light">
            Fill in the details below to generate a tailored specification. Your project draft will build directly and instantly submit to our development inbox.
          </p>
        </div>

        {/* Login gate — visitors must sign in before sharing an idea */}
        {!user ? (
          <div className="bg-white border border-slate-200 rounded-md shadow-xs p-12 text-center flex flex-col items-center gap-5 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center text-white">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-xl text-slate-950 tracking-tight">Log in to share your idea</h3>
              <p className="text-slate-500 text-sm font-light mt-2 max-w-sm mx-auto leading-relaxed">
                Create a free account or sign in first. Your project ideas are saved to your dashboard so you can track their progress.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <a
                href="#login"
                className="rounded-full bg-black text-white h-12 px-7 flex items-center justify-center gap-2 font-sans text-xs tracking-[0.08em] uppercase hover:bg-slate-900 transition-all cursor-pointer w-full sm:w-auto"
              >
                <LogIn className="w-4 h-4" /> Log in to continue
              </a>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleBusy}
                className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer h-12 px-7 disabled:opacity-45 disabled:cursor-not-allowed w-full sm:w-auto"
                id="contact-google-btn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                </svg>
                {googleBusy ? 'Opening Google…' : 'Continue with Google'}
              </button>
            </div>
            {googleError && <p className="text-xs text-red-500 font-sans">{googleError}</p>}
          </div>
        ) : (
        /* Form Container Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="planner-form-holder">
          
          {/* LEFT SIDE: Interactive Form Slots - 7 Columns */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-8 rounded-md shadow-xs">
            
            <AnimatePresence mode="wait">
              {!submissionReceipt ? (
                <motion.form 
                  key="form-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFormSubmit} 
                  className="space-y-8"
                >
                  
                  {/* Step 1: Basic Personals */}
                  <div className="space-y-6">
                    <h3 className="font-sans text-xs uppercase tracking-[0.08em] text-slate-900 border-b border-slate-100 pb-2">
                      01 / Client Profile
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[11px] text-slate-400 uppercase tracking-wider" htmlFor="client-name">Your Full Name *</label>
                        <input
                          id="client-name"
                          type="text"
                          placeholder="e.g. Sarah Connor"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`h-11 px-4 border text-sm rounded bg-[#F8F9FA]/40 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none ${
                            errors.name ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {errors.name && <span className="text-xs text-red-500 font-sans mt-1">{errors.name}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[11px] text-slate-400 uppercase tracking-wider" htmlFor="client-email">Email Address *</label>
                        <input
                          id="client-email"
                          type="email"
                          placeholder="e.g. sarah@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`h-11 px-4 border text-sm rounded bg-[#F8F9FA]/40 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none ${
                            errors.email ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {errors.email && <span className="text-xs text-red-500 font-sans mt-1">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] text-slate-400 uppercase tracking-wider" htmlFor="client-company">Company or Product Name (Optional)</label>
                      <input
                        id="client-company"
                        type="text"
                        placeholder="e.g. Cyberdyne Labs"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-11 px-4 border border-slate-200 text-sm rounded bg-[#F8F9FA]/40 focus:bg-white focus:border-slate-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 2: System Specs Selection */}
                  <div className="space-y-6">
                    <h3 className="font-sans text-xs uppercase tracking-[0.08em] text-[#0f172a] border-b border-slate-100 pb-2">
                      02 / System & Structure Scope
                    </h3>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] text-slate-400 uppercase tracking-wider" htmlFor="architecture-type">Describe Your Architecture</label>
                      <textarea
                        id="architecture-type"
                        rows={3}
                        placeholder="e.g. A marketing landing page with a blog, or a React-based SaaS dashboard with user accounts..."
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="p-4 border border-slate-200 text-sm rounded bg-[#F8F9FA]/40 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Step 4: Notes Summary */}
                  <div className="space-y-6">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-slate-900 border-b border-slate-100 pb-2">
                      04 / Custom Specs & Specifications
                    </h3>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] text-slate-400 uppercase tracking-wider" htmlFor="project-details">Project Details / Brief (Target Audience, Pages needed, design inspiration) *</label>
                      <textarea
                        id="project-details"
                        rows={5}
                        placeholder="e.g. Please describe your service, main objectives, list reference websites you love, or describe core animations wanted..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className={`p-4 border text-sm rounded bg-[#F8F9FA]/60 focus:bg-white transition-colors focus:border-slate-950 focus:outline-none resize-none ${
                          errors.details ? 'border-red-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.details && <span className="text-xs text-red-500 font-sans mt-1">{errors.details}</span>}
                    </div>
                  </div>

                  {errors.submit && (
                    <span className="text-[11px] text-red-500 font-sans">{errors.submit}</span>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 rounded-md bg-black h-14 text-white text-xs font-sans tracking-[0.08em] uppercase transition-all hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                    id="submit-engineer-brief-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size={18} color="#ffffff" label="Submitting" /> COMPILING DESIGN SPECIFICATION...
                      </>
                    ) : (
                      <>
                        TRANSMIT SECURE SPECS <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                </motion.form>
              ) : (
                <motion.div 
                  key="form-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center flex flex-col items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 inline-flex items-center justify-center text-slate-900 border border-slate-200">
                    <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
                  </div>
                  
                  <div>
                    <h3 className="font-sans font-semibold text-2xl text-slate-950 tracking-tight leading-none mb-2">
                      Inquiry Logged Successfully
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto font-light leading-relaxed">
                      Your business blueprint was signed into the database and allocated onto our master slot buffer.
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded border border-slate-200/60 w-full max-w-sm text-center">
                    <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate-400 block">SPECIFICATION ID RECEIPT</span>
                    <span className="font-sans font-bold text-base text-slate-900 select-all block mt-1 tracking-wider">
                      {submissionReceipt}
                    </span>
                    <span className="font-sans text-xs text-[#10b981] font-semibold block mt-3">
                      Availability slot held
                    </span>
                  </div>

                  <button
                    onClick={() => setSubmissionReceipt(null)}
                    className="mt-4 flex items-center gap-2 font-sans text-xs text-slate-500 hover:text-black font-semibold border-b border-slate-300 pb-0.5 cursor-pointer"
                    id="submit-another-brief-btn"
                  >
                    Log another system blueprint
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT SIDE: Dynamic Draft Output - 5 Columns */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            <div className="bg-slate-950 text-slate-300 rounded p-6 font-sans text-xs border border-slate-900 flex flex-col h-full justify-between" id="dynamic-summary-draft-box">
              
              {/* Header */}
              <div className="border-b border-slate-900 pb-4 mb-4 flex items-center justify-between">
                <span className="text-slate-500 tracking-wider font-semibold uppercase">Estimate</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </div>

              {/* Specs Stack */}
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-slate-600 uppercase tracking-[0.08em] block font-semibold text-[11px] mb-1">CLIENT PROFILE:</span>
                  <div className="text-[#F8F9FA] text-[11px] leading-relaxed">
                    {name.trim() ? name.trim() : <span className="text-slate-700 italic">No name provided</span>}
                    {email.trim() && <span> &lt;{email.trim()}&gt;</span>}
                    {company.trim() && <span className="text-slate-500 font-normal"> at {company.trim()}</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 uppercase tracking-[0.08em] block font-semibold text-[11px] mb-1">DESCRIBED ARCHITECTURE:</span>
                  <div className="text-slate-300 text-[11px] font-semibold flex items-start gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    {projectType.trim() ? projectType.trim() : <span className="text-slate-700 italic font-normal">No architecture described yet</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 uppercase tracking-[0.08em] block font-semibold text-[11px] mb-1">PROJECT DETAILS:</span>
                  <div className="text-slate-400 text-[10.5px] leading-relaxed break-words font-light">
                    {details.trim() ? (
                      details.length > 220 ? `${details.substring(0, 220)}...` : details
                    ) : (
                      <span className="text-slate-700 italic">Insert project scope notes left to compile...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="border-t border-slate-900 pt-4 mt-6 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-600 leading-none">
                  dywebixtech Architecture Engine v4.1 (Standard Caching)
                </span>
              </div>

            </div>

          </div>

        </div>
        )}

      </div>
    </section>
  );
}
