/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Zap, MonitorSmartphone, ShieldCheck } from 'lucide-react';
// GSAP only exists for this card stack, so it is split out and mounted when
// the section scrolls into view rather than shipped in the main bundle.
const ShowcaseCards = lazy(() => import('./ShowcaseCards'));

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
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: '200px' });

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
        <div ref={cardsRef} className="relative h-[420px] sm:h-[520px] lg:h-[600px]">
          {cardsInView && (
            <Suspense fallback={null}>
              <ShowcaseCards cards={CARDS} />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
