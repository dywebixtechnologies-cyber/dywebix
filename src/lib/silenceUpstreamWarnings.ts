/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Two of our dependencies log a deprecation warning at startup that we cannot
 * fix from here — neither API is called anywhere in `src/`:
 *
 *  1. `@react-three/fiber` builds its render loop on `THREE.Clock`, which
 *     three 0.184 deprecated. Verified still present in fiber 9.7.0, so there
 *     is no version to upgrade to.
 *  2. `@react-three/rapier` calls rapier's `initSync()` with the old argument
 *     shape. 2.2.0 is the latest release, so again there is nothing to bump.
 *
 * They are noise with no runtime effect, and they bury warnings that DO matter.
 * This filter drops those two exact messages and passes everything else
 * through untouched — it is deliberately not a blanket console silencer.
 *
 * Delete an entry as soon as its upstream fix ships.
 */
const SILENCED = [
  'THREE.Clock: This module has been deprecated',
  'using deprecated parameters for the initialization function',
  'using deprecated parameters for `initSync()`',
];

let installed = false;

export function silenceUpstreamWarnings() {
  if (installed) return;
  installed = true;

  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && SILENCED.some((m) => first.includes(m))) return;
    original.apply(console, args as []);
  };
}
