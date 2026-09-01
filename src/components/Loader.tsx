/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import './Loader.css';

// The Uiverse keyframes are written in hard pixels against a 112px stage, so
// resizing is done with a transform rather than by rewriting the animation.
const BASE = 112;

interface LoaderProps {
  /** Rendered size in px (the animation is authored at 112px and scaled). */
  size?: number;
  /** Border colour of the three boxes. */
  color?: string;
  /** Delay before the loop starts, e.g. '1s'. */
  delay?: string;
  className?: string;
  label?: string;
}

/**
 * The single loading animation used everywhere in the app — three boxes that
 * shuffle around a square. Compose it, don't fork it.
 */
export function Loader({
  size = 112,
  color = '#0f172a',
  delay = '0s',
  className = '',
  label = 'Loading',
}: LoaderProps) {
  const scale = size / BASE;

  return (
    <span
      className={`kw-loader-wrap ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <span
        className="kw-loader"
        style={
          {
            transform: `scale(${scale})`,
            '--kw-loader-color': color,
            '--kw-loader-delay': delay,
          } as React.CSSProperties
        }
        aria-hidden="true"
      >
        <span className="kw-box1" />
        <span className="kw-box2" />
        <span className="kw-box3" />
      </span>
    </span>
  );
}

/**
 * Full-viewport centred loader — the fallback for lazy routes and any other
 * whole-page wait.
 */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#061c3a] flex flex-col items-center justify-center gap-8">
      <Loader size={96} label={label} />
      <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-[#7f9cc4]">
        {label}
      </span>
    </div>
  );
}
