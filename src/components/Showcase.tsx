/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Zap, MonitorSmartphone, ShieldCheck, ArrowUpRight } from 'lucide-react';
import CardSwapRaw, { Card as CardRaw } from './CardSwap';

// CardSwap/Card are untyped JS components — alias to `any` for clean JSX usage.
const CardSwap: any = CardSwapRaw;
const Card: any = CardRaw;

const CARDS = [
  {
    tag: '01 / Performance',
    icon: Zap,
    title: 'Sub-0.9s page loads',
    text: 'Hand-tuned bundles, smart lazy-loading, and flawless caching for a perfect Lighthouse score.',
  },
  {
    tag: '02 / Design',
    icon: MonitorSmartphone,
    title: 'Pixel-perfect, fluid layouts',
    text: 'Interfaces that scale beautifully from compact phones to expansive studio displays.',
  },
  {
    tag: '03 / Engineering',
    icon: ShieldCheck,
    title: 'Type-safe architecture',
    text: 'Modern React, full TypeScript safety, and clean component systems built to last.',
  },
];

export function Showcase() {
  return (
    <section className="relative py-24 md:py-32 px-6 bg-[#F8F9FA] border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
            [ WHY DYWEBIXTECH ]
          </span>
          <h2 className="font-display font-light text-3xl md:text-5xl tracking-tight text-slate-950 leading-[1.1]">
            Three pillars behind <span className="font-serif italic font-normal text-slate-500">every build</span>.
          </h2>
          <p className="mt-6 text-slate-600 text-base md:text-lg leading-relaxed font-light max-w-lg">
            We obsess over the details that matter — raw speed, pixel-level polish, and rock-solid
            engineering — so your product feels effortless to everyone who touches it.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {CARDS.map((c) => (
              <li key={c.tag} className="flex items-center gap-3 text-sm text-slate-700 font-light">
                <span className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 shrink-0">
                  <c.icon className="w-3.5 h-3.5" />
                </span>
                {c.title}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: swapping 3D cards */}
        <div className="relative h-[420px] sm:h-[520px] lg:h-[600px]">
          <CardSwap cardDistance={60} verticalDistance={70} delay={4000} pauseOnHover>
            {CARDS.map((c) => (
              <Card
                key={c.tag}
                className="p-8 flex flex-col justify-between text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">{c.tag}</span>
                  <c.icon className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-2xl md:text-[1.75rem] tracking-tight leading-tight">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/60 font-light leading-relaxed">{c.text}</p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70">
                  dywebixtech <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </section>
  );
}
