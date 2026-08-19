/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoSrc from '../assets/dywebix-logo.png';

// The supplied artwork is a single horizontal lockup on a white plate. The
// "dw" mark sits in this region of the 690x522 source, so the square variant
// crops to it rather than shipping a second file.
const SRC_W = 690;
const SRC_H = 522;
const MARK = { x: 72, y: 168, w: 222, h: 172 };

interface LogoProps {
  /** 'mark' = square dw glyph only, 'full' = whole dywebix lockup. */
  variant?: 'mark' | 'full';
  /** Rendered size in px — box edge for 'mark', height for 'full'. */
  size?: number;
  className?: string;
}

/**
 * The dywebixtech logo. `mix-blend-multiply` drops the artwork's white plate
 * onto the site's #F8F9FA background without needing a cut-out PNG.
 */
export function Logo({ variant = 'mark', size = 36, className = '' }: LogoProps) {
  if (variant === 'full') {
    return (
      <img
        src={logoSrc}
        alt="dywebixtech"
        style={{ height: size }}
        className={`w-auto object-contain mix-blend-multiply ${className}`}
      />
    );
  }

  // Scale so the cropped mark's longest edge fills the square box.
  const scale = size / Math.max(MARK.w, MARK.h);

  return (
    <span
      role="img"
      aria-label="dywebixtech"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${logoSrc})`,
        backgroundSize: `${SRC_W * scale}px ${SRC_H * scale}px`,
        backgroundPosition: `${-MARK.x * scale + (size - MARK.w * scale) / 2}px ${
          -MARK.y * scale + (size - MARK.h * scale) / 2
        }px`,
        backgroundRepeat: 'no-repeat',
      }}
      className={`inline-block shrink-0 mix-blend-multiply ${className}`}
    />
  );
}
