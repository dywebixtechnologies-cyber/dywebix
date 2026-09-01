/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader } from './Loader';
import { Logo } from './Logo';

// How long the splash stays fully visible before it begins fading out (ms).
// Long enough for the box animation to run through a few of its moves.
const HOLD_MS = 1800;

/**
 * Full-screen loading splash shown on every page load / reload.
 * Holds for ~0.8s while a progress bar fills, then fades the site in.
 */
export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#EEF4FC] flex flex-col items-center justify-center gap-7"
          aria-hidden="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Loader size={112} />
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <Logo variant="full" size={30} />

            <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate-400">
              Loading
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
