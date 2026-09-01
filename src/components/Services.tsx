/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { SERVICES } from '../data/portfolioData';
import { Sparkles, Cpu, ShoppingBag, Layout, Check, ArrowRight } from 'lucide-react';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

// Map service icon names safely to Lucide Icons
const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-slate-800" />,
  Cpu: <Cpu className="w-5 h-5 text-slate-800" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5 text-slate-800" />,
  Layout: <Layout className="w-5 h-5 text-slate-800" />,
};

export function Services({ onSelectService }: ServicesProps) {
  return (
    <section id="services-section" className="py-24 px-6 bg-white border-t border-[#cbdff5]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="font-sans text-xs text-slate-400 uppercase tracking-[0.08em] block mb-3">
              Services
            </span>
            <h2 className="font-display font-light text-3xl md:text-5xl tracking-tight text-[#072750]">
              High-tier website building services for digital leaders.
            </h2>
          </div>
          <p className="font-sans text-slate-500 max-w-sm text-sm md:text-base leading-relaxed font-light">
            Each project is coded by hand from absolute zero. I don't use rigid templates, drag-and-drop page builders, or heavy plugins that bloat network traffic.
          </p>
        </div>

        {/* Services Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-[#EEF4FC] border border-slate-200/80 p-8 md:p-10 rounded-lg flex flex-col justify-between hover:border-slate-400 hover:shadow-xs transition-all duration-300"
              id={`service-card-${service.id}`}
            >
              {/* Badge & General Info */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-11 h-11 rounded-sm border border-[#cbdff5] bg-white flex items-center justify-center shadow-xs">
                    {iconMap[service.icon] || <Layout className="w-5 h-5" />}
                  </div>
                  {service.badge && (
                    <span className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 bg-[#0c6fc2] text-white rounded-full">
                      {service.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-sans font-semibold text-2xl text-[#072750] tracking-tight mb-3">
                  {service.title}
                </h3>
                
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-light mb-8">
                  {service.description}
                </p>

                {/* Features Checklist */}
                <div className="border-t border-[#cbdff5] pt-6 mb-8">
                  <span className="font-sans text-[11px] text-slate-400 uppercase tracking-[0.08em] block mb-4">
                    Deliverable Modules Include:
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-[#072750] mt-0.5 shrink-0" />
                        <span className="leading-snug font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Action Footer — rate is set by the studio per project */}
              <div className="border-t border-[#cbdff5] pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4">
                <span className="font-sans text-[11px] uppercase tracking-wider text-slate-400 max-w-[55%] leading-relaxed">
                  Share your idea — we'll tailor a custom quote for your project.
                </span>

                <button
                  onClick={() => onSelectService(service.title)}
                  className="rounded-full bg-[#0c6fc2] text-white text-xs font-sans tracking-[0.08em] uppercase py-3.5 px-6 hover:bg-[#072750] transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:gap-3"
                  id={`service-cta-${service.id}`}
                >
                  Share Your Idea <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Steps */}
        <div id="process-sub-section" className="mt-24 border-t border-[#cbdff5] pt-16">
          <span className="font-sans text-xs text-slate-400 uppercase tracking-[0.08em] block mb-10 text-center">
            How we work
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col gap-3">
              <span className="font-sans text-slate-200 text-5xl md:text-6xl font-light">01</span>
              <h4 className="font-sans font-semibold text-lg text-[#072750] tracking-tight">Interactive Planner</h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                We kick off by tailoring your desired system features, performance expectations, and strict deliverables directly through the interactive calculator builder.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-sans text-slate-200 text-5xl md:text-6xl font-light">02</span>
              <h4 className="font-sans font-semibold text-lg text-[#072750] tracking-tight">Bespoke Design & Code</h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Your visual system is mocked using clean grid principles. Then, we transform it into custom React blocks styled with pristine Tailwind attributes.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-sans text-slate-200 text-5xl md:text-6xl font-light">03</span>
              <h4 className="font-sans font-semibold text-lg text-[#072750] tracking-tight">A+ Performance Launch</h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Prior to deploy, your assembly goes through intensive Lighthouse validation, CDN setup, image payload optimizations, and deep mobile testing.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
