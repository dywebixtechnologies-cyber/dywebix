/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, Code2, Sparkles, Target } from 'lucide-react';
import { Logo } from './Logo';

const VALUES = [
  { icon: Zap, title: 'Performance First', text: 'Hand-tuned bundles and a relentless focus on sub-second load times. Speed is a feature.' },
  { icon: Code2, title: 'Clean Engineering', text: 'Type-safe, component-driven React. No bloated templates, no drag-and-drop debt.' },
  { icon: Sparkles, title: 'Considered Detail', text: 'Micro-interactions, motion choreography, and pristine typography in every pixel.' },
  { icon: Target, title: 'Built to Convert', text: 'Beautiful interfaces engineered around your goals — turning visitors into advocates.' },
];

export function AboutUs() {
  return (
    <div className="min-h-screen bg-[#061c3a] text-white font-sans antialiased selection:bg-[#0c6fc2] selection:text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#061c3a]/90 backdrop-blur-md border-b border-[#173a66]/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo variant="full" size={30} />
            <span className="h-6 w-px bg-[#173a66]" />
            <span className="font-display font-medium text-sm tracking-tight text-white">About Us</span>
          </div>
          <a href="/" className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.08em] text-[#8fabcf] hover:text-[#0c6fc2] transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to site
          </a>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-sans text-xs text-[#7f9cc4] uppercase tracking-[0.08em] block mb-3">Who we are</span>
          <h1 className="font-display font-light text-4xl md:text-6xl tracking-tight text-white leading-[1.08]">
            A studio obsessed with <span className="font-serif italic font-normal text-[#8fabcf]">craft</span>.
          </h1>
          <p className="mt-6 text-[#a8c1e0] text-base md:text-lg leading-relaxed font-light max-w-2xl">
            dywebixtech is an engineering-forward design studio building high-performance,
            minimalist web experiences. We pair breathtaking visual design with lightning-fast,
            type-safe React — crafted by hand, never templated.
          </p>
          <p className="mt-4 text-[#8fabcf] text-sm leading-relaxed font-light max-w-2xl">
            From bespoke landing pages to interactive SaaS platforms, every project is built to
            load in under a second, scale across every screen, and convert.
          </p>
        </motion.div>
      </section>

      {/* Values grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="border-t border-[#173a66] pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-full border border-[#173a66] bg-[#0b2748] flex items-center justify-center text-[#c3d6ee]">
                <v.icon className="w-4 h-4" />
              </div>
              <h3 className="font-sans text-xs uppercase tracking-[0.08em] text-white font-semibold">{v.title}</h3>
              <p className="text-xs text-[#8fabcf] leading-relaxed font-light">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
