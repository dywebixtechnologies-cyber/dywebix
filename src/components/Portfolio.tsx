/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { PROJECTS } from '../data/portfolioData';
import { Project } from '../types';
import { CheckCircle, Info, ChevronRight, Laptop, FileCode2, MousePointer2 } from 'lucide-react';
import { Loader } from './Loader';
import logoSrc from '../assets/dywebix-logo.png';
import founderImg from '../assets/team/founder-melwin-anto.png';
import cofounderImg from '../assets/team/cofounder-saravanan.png';
import ceoImg from '../assets/team/ceo-mohamed-ibrahim.png';

// The R3F/rapier bundle is heavy, so the ID card is code-split and only mounted
// once the portfolio section actually scrolls into view.
const Lanyard = lazy(() => import('./Lanyard'));
const DepthCarousel = lazy(() => import('./DepthCarousel'));

// Founder, then co-founder, then CEO — the order the cards are shown in.
const TEAM = [
  { image: founderImg, alt: 'Melwin Anto — Founder' },
  { image: cofounderImg, alt: 'Saravanan — Co-Founder' },
  { image: ceoImg, alt: 'Mohamed Ibrahim — CEO' },
];


export function Portfolio() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(PROJECTS[0]);
  const [viewMode, setViewMode] = useState<'preview' | 'specs'>('preview');
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: true, margin: '200px' });
  const teamRef = useRef<HTMLDivElement>(null);
  const teamInView = useInView(teamRef, { once: true, margin: '200px' });

  const categories = [
    { id: 'all', label: 'All Artifacts' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'saas', label: 'SaaS Platforms' },
    { id: 'creative', label: 'Creative Studio' },
    { id: 'editorial', label: 'Editorial' },
  ];

  const filteredProjects = filter === 'all' 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  useEffect(() => {
    if (selectedProject && !filteredProjects.some(p => p.id === selectedProject.id)) {
      setSelectedProject(filteredProjects[0] || null);
    }
  }, [filter, filteredProjects, selectedProject]);

  const handleProjectSelect = (p: Project) => {
    setSelectedProject(p);
    setViewMode('preview'); // Reset back to preview mode on new project select
  };

  return (
    <section id="portfolio-section" className="py-24 px-6 bg-[#EEF4FC] border-t border-[#cbdff5]">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
              [ 02 / PROTOTYPE GALLERY ]
            </span>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-tight text-[#072750]">
              Interactive design systems catalog.
            </h2>
          </div>
          <p className="font-sans text-slate-500 max-w-sm text-sm md:text-base leading-relaxed font-light">
            Toggle categories and highlight specific details using the interactive browser mockup below to witness real architectural performance.
          </p>
        </div>

        {/* Filter Navigation — scrolls horizontally on a phone rather than wrapping
            into three cramped rows. */}
        <div className="flex sm:flex-wrap items-center gap-2 mb-10 pb-4 border-b border-slate-200/60 overflow-x-auto sm:overflow-x-visible -mx-6 px-6 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`relative shrink-0 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider rounded-sm transition-all focus:outline-none cursor-pointer ${
                  isActive ? 'text-white font-medium' : 'text-slate-500 hover:text-[#0b3566] hover:bg-slate-100/55'
                }`}
                id={`filter-btn-${cat.id}`}
              >
                <span className="relative z-10">{cat.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBg"
                    className="absolute inset-0 bg-[#0c6fc2] rounded-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT LIST PANEL: 5 Columns */}
          <div className="lg:col-span-5 flex flex-col gap-3 h-full">
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-1">
              Select Project to Inspect:
            </span>
            
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => {
                  const isSelected = selectedProject?.id === project.id;
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className={`w-full text-left p-6 rounded-md border transition-all flex flex-col justify-between cursor-pointer group focus:outline-none ${
                        isSelected 
                          ? 'border-[#0c6fc2] bg-white shadow-xs' 
                          : 'border-[#cbdff5] bg-white hover:border-slate-400 hover:bg-slate-50/40'
                      }`}
                      id={`project-select-card-${project.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-0.5 border border-[#cbdff5] rounded text-slate-400 bg-[#EEF4FC]">
                          {project.category}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-mono text-[10px] text-slate-500">Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#0b3566]" />
                        </div>
                      </div>

                      <h4 className="font-sans font-semibold text-lg text-[#0b3566] tracking-tight mb-2">
                        {project.title}
                      </h4>
                      
                      <p className="text-slate-600 text-xs leading-relaxed font-light line-clamp-2">
                        {project.description}
                      </p>

                      {/* Display mini pill tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-200/40">
                        {project.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="font-mono text-[9px] text-slate-500 bg-[#dfeaf8] px-2 py-0.5 rounded-sm">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT PREVIEW PANEL: 7 Columns */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-1">
              Engineered Interactive Frame:
            </span>

            {selectedProject ? (
              <div className="border border-[#cbdff5] bg-white rounded-lg shadow-sm overflow-hidden flex flex-col" id="spec-inspect-frame">
                
                {/* Simulated Interactive Title Bar */}
                <div className="bg-[#EEF4FC] border-b border-[#cbdff5] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>

                  {/* Toggle Preview vs Spec view tabs */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`flex items-center gap-1 px-3 py-1 text-[9px] uppercase tracking-widest font-mono rounded cursor-pointer transition-all ${
                        viewMode === 'preview'
                          ? 'bg-[#0c6fc2] text-white font-semibold'
                          : 'text-slate-400 hover:text-[#0c6fc2] hover:bg-slate-200/50'
                      }`}
                      id="view-mode-preview-btn"
                    >
                      <Laptop className="w-3 h-3" /> <span className="hidden sm:inline">Screen</span>
                    </button>
                    <button
                      onClick={() => setViewMode('specs')}
                      className={`flex items-center gap-1 px-3 py-1 text-[9px] uppercase tracking-widest font-mono rounded cursor-pointer transition-all ${
                        viewMode === 'specs'
                          ? 'bg-[#0c6fc2] text-white font-semibold'
                          : 'text-slate-400 hover:text-[#0c6fc2] hover:bg-slate-200/50'
                      }`}
                      id="view-mode-specs-btn"
                    >
                      <FileCode2 className="w-3 h-3" /> <span className="hidden sm:inline">Specs</span>
                    </button>
                  </div>
                </div>

                {/* Main Content Pane */}
                <div className="relative min-h-[360px] md:min-h-[440px] bg-[#EEF4FC]">
                  <AnimatePresence mode="wait">
                    {viewMode === 'preview' ? (
                      <motion.div
                        key="preview-panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {/* Realistic screen preview */}
                        <div className="relative flex-1 overflow-hidden group/screen bg-[#072750]">
                          <img
                            src={selectedProject.image}
                            alt={`${selectedProject.title} viewport`}
                            className="w-full h-full object-cover opacity-85 hover:scale-103 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#10b981] bg-black/55 border border-[#10b981]/30 px-2.5 py-1 rounded-sm w-max mb-3 backdrop-blur-sm font-semibold">
                              [ Mock Live Sandbox ]
                            </span>
                            <h4 className="font-sans font-semibold text-2xl text-white tracking-tight leading-none mb-2">
                              {selectedProject.title}
                            </h4>
                            <p className="text-[#c8dcf3] text-xs md:text-sm font-light max-w-md">
                              {selectedProject.description}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Stats Grid */}
                        <div className="bg-[#0c6fc2] grid grid-cols-3 divide-x divide-[#0b3566] p-3 sm:p-4">
                          {selectedProject.stats.map((stat, sIdx) => (
                            <div key={sIdx} className="px-4 text-center first:pl-0 last:pr-0">
                              <span className="font-sans font-bold text-lg md:text-xl text-white tracking-tight">{stat.value}</span>
                              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mt-0.5">{stat.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="specs-panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 p-8 flex flex-col overflow-y-auto bg-[#041a37] text-slate-300"
                      >
                        <div className="border-b border-[#0b3566] pb-4 mb-6">
                          <h5 className="font-mono text-xs uppercase tracking-widest text-[#EEF4FC] flex items-center gap-2 font-bold">
                            <CheckCircle className="w-4 h-4 text-[#10b981]" />
                            TECHNICAL SPECIFICATION SHEET
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-1">Verified with real local performance checks.</p>
                        </div>

                        <div className="space-y-6 flex-1">
                          <div>
                            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block mb-2">Core Tech Stack & Tools</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedProject.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="font-mono text-xs text-slate-300 bg-[#072750] border border-[#0b3566] px-3 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block mb-2">Architectural Highlights</span>
                            <ul className="space-y-2.5">
                              {selectedProject.details.map((detail, dIdx) => (
                                <li key={dIdx} className="flex items-start gap-2.5 text-xs">
                                  <span className="font-mono text-[#10b981] mt-0.5 shrink-0">[✔]</span>
                                  <span className="leading-relaxed font-light">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-[#072750] rounded border border-[#0b3566] p-4 mt-4 flex items-start gap-3">
                            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="text-[11px] leading-relaxed text-slate-400">
                              This artifact demonstrates fully pre-rendered index pages, responsive view containers, fluid layouts, and complete component safety under high load metrics.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            ) : (
              <div className="border border-dashed border-[#cbdff5] p-12 text-center rounded text-slate-400 text-xs">
                Choose a project on the left to see specs.
              </div>
            )}
          </div>

        </div>

        {/* Team — depth carousel of the founding cards */}
        <div ref={teamRef} className="mt-20 pt-12 border-t border-[#cbdff5]">
          <div className="max-w-2xl mb-8">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
              [ 03 / THE TEAM ]
            </span>
            <h3 className="font-display font-light text-2xl md:text-4xl tracking-tight text-[#072750] leading-tight">
              The people behind <span className="font-serif italic font-normal text-slate-500">dywebixtech</span>.
            </h3>
            <p className="mt-4 text-slate-500 text-sm leading-relaxed font-light">
              Drag, scroll or use the arrows to move through the cards.
            </p>
          </div>

          <div className="relative h-[460px] sm:h-[540px] lg:h-[600px] rounded-2xl overflow-hidden bg-[radial-gradient(ellipse_at_center,#e2e8f0_0%,transparent_70%)]">
            {teamInView && (
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader size={72} label="Loading the team cards" />
                  </div>
                }
              >
                <DepthCarousel
                  items={TEAM}
                  cardWidth={300}
                  cardHeight={450}
                  depth={220}
                  spread={90}
                  tilt={22}
                  tiltDirection="right"
                  perspective={1400}
                  visibleCards={3}
                  falloff={0.2}
                  blur={6}
                  radius={18}
                  tint="#05060a"
                  duration={700}
                  ease="power3.out"
                  autoplay
                  autoplayDelay={3200}
                  loop
                  showControls
                  showIndicators
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* Interactive 3D studio ID card */}
        <div className="mt-20 pt-12 border-t border-[#cbdff5] grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
              [ 03 / STUDIO CREDENTIAL ]
            </span>
            <h3 className="font-display font-light text-2xl md:text-4xl tracking-tight text-[#072750] leading-tight">
              The team behind the <span className="font-serif italic font-normal text-slate-500">artifacts</span>.
            </h3>
            <p className="mt-5 text-slate-500 text-sm leading-relaxed font-light max-w-md">
              Every project above was engineered by hand. Grab the badge and throw it around — it is
              real physics, rendered live in your browser at sixty frames a second.
            </p>
            <span className="mt-6 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
              <MousePointer2 className="w-3 h-3" />
              <span className="sm:hidden">Swipe the card</span>
              <span className="hidden sm:inline">Drag the card</span>
            </span>
          </div>

          <div
            ref={cardRef}
            className="lg:col-span-7 relative w-full h-[360px] sm:h-[460px] lg:h-[600px] rounded-2xl overflow-hidden bg-[radial-gradient(ellipse_at_top,#eef2ff_0%,transparent_70%)]"
          >
            {cardInView && (
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader size={80} label="Loading the ID card" />
                  </div>
                }
              >
                <Lanyard
                  position={[0, 0, 18]}
                  gravity={[0, -40, 0]}
                  frontImage={logoSrc}
                  backImage={logoSrc}
                  imageFit="contain"
                  imageBackground="#ffffff"
                />
              </Suspense>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
