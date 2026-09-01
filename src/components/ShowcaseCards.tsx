/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import CardSwapRaw, { Card as CardRaw } from './CardSwap';

// CardSwap/Card are untyped JS components — alias to `any` for clean JSX usage.
const CardSwap: any = CardSwapRaw;
const Card: any = CardRaw;

export interface ShowcaseCard {
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}

/**
 * The GSAP-driven card stack, split into its own module purely so `Showcase`
 * can `lazy()` it — `lazy` needs a single default export, and CardSwap ships
 * two. Keeping it separate holds GSAP out of the main bundle.
 */
export default function ShowcaseCards({ cards }: { cards: ShowcaseCard[] }) {
  return (
    // easing="power" picks CardSwap's 0.8s tweens; the default elastic ones
    // run 2s and would still be moving when the next swap fires.
    <CardSwap cardDistance={60} verticalDistance={70} delay={2000} easing="power" pauseOnHover>
      {cards.map((c) => (
        <Card key={c.tag} className="p-8 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs uppercase tracking-[0.08em] text-white/50">{c.tag}</span>
            <c.icon className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <h3 className="font-display font-medium text-2xl md:text-[1.75rem] tracking-tight leading-tight">
              {c.title}
            </h3>
            <p className="mt-3 text-sm text-white/60 font-light leading-relaxed">{c.text}</p>
          </div>
          <div className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.08em] text-white/70">
            dywebixtech <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Card>
      ))}
    </CardSwap>
  );
}
