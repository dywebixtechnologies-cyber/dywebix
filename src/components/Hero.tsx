/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, Shield, Zap, MonitorSmartphone } from 'lucide-react';
// three.js is roughly two thirds of the main bundle and this background is
// purely decorative, so it is split out and mounted after first paint.
const MagicRings = lazy(() => import('./MagicRings'));

interface HeroProps {
  onSectionChange: (section: string) => void;
}

export function Hero({ onSectionChange }: HeroProps) {
  // Hold the WebGL background back until the browser is idle, so the hero
  // text and buttons paint and respond without waiting on three.js.
  const [showRings, setShowRings] = useState(false);

  useEffect(() => {
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setShowRings(true));
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setShowRings(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen min-h-[100svh] pt-28 sm:pt-32 pb-16 sm:pb-20 px-6 flex flex-col justify-between overflow-hidden bg-[#EEF4FC]">
      {/* Animated WebGL magic-rings background */}
      <div className="absolute inset-0 z-0 pointer-events-none [mask-image:radial-gradient(ellipse_72%_72%_at_50%_45%,#000_52%,transparent_88%)]">
        {showRings && (
        <Suspense fallback={null}>
        <MagicRings
          color="#0c6fc2"
          colorTwo="#1a86e0"
          ringCount={6}
          speed={1}
          attenuation={10}
          lineThickness={2}
          baseRadius={0.35}
          radiusStep={0.1}
          scaleRate={0.1}
          opacity={1}
          blur={0}
          noiseAmount={0.02}
          rotation={0}
          ringGap={1.5}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={false}
          mouseInfluence={0.2}
          hoverScale={1.2}
          parallax={0.05}
          clickBurst={false}
        />
        </Suspense>
        )}
      </div>

      {/* Decorative clean grid patterns (Minimalist aesthetic) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Intro Metrics / Available Slot Ticker */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 relative z-10">
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span>Status: Accepting Projects</span>
        </div>
      </div>

      {/* Main Copy */}
      <div className="max-w-7xl mx-auto w-full my-auto flex flex-col items-start gap-10 relative z-10">
        <div className="max-w-4xl flex flex-col gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display font-light text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight text-[#072750] leading-[1.08]"
          >
            Exceptional <span className="font-serif italic font-normal text-slate-500">web building</span> <br className="hidden md:block" />
            for system visionaries.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-sans text-slate-600 text-base md:text-lg md:leading-relaxed max-w-2xl font-light"
          >
            I architect and code pristine, ultra-minimalist frontend experiences.
            Engineered with lightning-fast React components, breathtaking typography, 
            and fluid visual layouts built to convert clickers into client advocates.
          </motion.p>
        </div>

        {/* Dynamic Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => onSectionChange('contact')}
            className="flex items-center justify-center gap-3 rounded-full bg-[#0c6fc2] h-13 px-8 text-white hover:bg-[#072750] font-mono text-[10px] tracking-widest uppercase transition-all hover:gap-4 hover:shadow-lg cursor-pointer"
            id="hero-cta-contact"
          >
            Start Your Builder Planner <ArrowDownRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSectionChange('portfolio')}
            className="flex items-center justify-center gap-3 rounded-full bg-white border border-[#cbdff5] h-13 px-8 text-slate-800 hover:bg-[#eef4fc] font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer shadow-xs"
            id="hero-cta-portfolio"
          >
            Browse Architecture Gallery
          </button>
        </motion.div>
      </div>

      {/* Core Pillars Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 relative z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#cbdff5] flex items-center justify-center text-slate-800 bg-white">
              <Zap className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#0b3566] font-semibold">Sub-0.9s Page Load</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pl-11 font-light">
            Zero bloat, hand-tuned bundle sizes, and optimal caching policies to score a perfect 100 on Google Lighthouse.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#cbdff5] flex items-center justify-center text-slate-800 bg-white">
              <MonitorSmartphone className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#0b3566] font-semibold">Pixel-Perfect Layouts</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pl-11 font-light">
            Tailored visual layouts scaling fluidly across absolute screens—from compact mobile tabs to expansive 5K studio monitors.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#cbdff5] flex items-center justify-center text-slate-800 bg-white">
              <Shield className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#0b3566] font-semibold">Real Data Architecture</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pl-11 font-light">
            Standard modern API structures, custom localStorage inquiries, and complete TypeScript safety. Genuine craftsmanship.
          </p>
        </div>
      </div>
    </section>
  );
}
