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

/**
 * Region of the source artwork holding just the "dw" glyph, in source pixels.
 * Exported so anything else that needs the mark alone — the 3D badge texture,
 * for one — crops from the same numbers instead of guessing its own.
 */
export const LOGO_MARK_CROP = { x: 72, y: 168, w: 222, h: 172 };

const MARK = LOGO_MARK_CROP;

interface LogoProps {
  /** 'mark' = square dw glyph only, 'full' = whole dywebix lockup. */
  variant?: 'mark' | 'full';
  /** Rendered size in px — box edge for 'mark', height for 'full'. */
  size?: number;
  className?: string;
}

/**
 * The dywebixtech logo.
 *
 * The artwork is dark-blue-on-white with no transparency, so on the dark navy
 * ground it needs a white plate to sit on — `mix-blend-multiply` would render
 * it almost invisible. The plate is the lockup, not a workaround: it reads as
 * a deliberate badge.
 */
export function Logo({ variant = 'mark', size = 36, className = '' }: LogoProps) {
  const plate =
    'inline-flex items-center justify-center bg-white rounded-md shrink-0';

  if (variant === 'full') {
    return (
      <span className={`${plate} px-2.5 py-1.5 ${className}`}>
        <img
          src={logoSrc}
          alt="dywebixtech"
          style={{ height: size }}
          className="w-auto object-contain"
        />
      </span>
    );
  }

  // Scale so the cropped mark's longest edge fills the square box.
  const scale = size / Math.max(MARK.w, MARK.h);

  return (
    <span className={`${plate} p-1 ${className}`}>
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
        className="inline-block shrink-0"
      />
    </span>
  );
}
