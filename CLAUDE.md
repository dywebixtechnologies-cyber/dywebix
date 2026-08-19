# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server on port 3000, host 0.0.0.0
npm run build    # Production build to dist/
npm run preview  # Serve the built dist/
npm run lint     # tsc --noEmit — the only type/lint check; there is no ESLint
```

There is no test suite and no test runner configured.

`vite.config.ts` honours `DISABLE_HMR=true` (set by AI Studio) to turn off HMR *and* file watching so agent edits don't cause flicker. Don't remove that branch.

## Architecture

Single-page React 19 + Vite + Tailwind v4 marketing site for a fictional web studio ("KRAFT // WEB"). Everything is client-side — **there is no backend and no database**, despite `express` and `@google/genai` sitting in `package.json` (neither is imported anywhere in `src/`).

### Routing is hash-based and lives entirely in `src/App.tsx`

`App.tsx` reads `window.location.hash` into state (via a `hashchange` listener) and renders one of five top-level views, crossfaded by a single `AnimatePresence`/`motion.div` keyed on a `viewKey`:

| Hash | View |
|---|---|
| *(empty)* | Home — the stacked one-page site (Hero → Services → Showcase → Portfolio → ContactForm → footer) |
| `#login` / `#signup` | `LoginPage`, or redirect to the right dashboard if already signed in |
| `#dashboard` | `UserDashboard` (falls back to `LoginPage`) |
| `#admin` | `AdminGate` → `AdminInbox`, role-gated inside `AdminGate` |
| `#about` | `AboutUs`, **lazy-loaded** so three/R3F/drei/rapier are only fetched here |

Home-page navigation is not routing: `handleSectionChange` scrolls to `#{section}-section` elements with an 80px sticky-nav offset. Anything that would reach the contact form while logged out redirects to `#login` instead.

### State: localStorage is the database

Two independent stores, both plain JSON in `localStorage`, both read/written directly by components (no repository layer):

- **`inquiries`** — array of `Inquiry` (`src/types.ts`). Written by `ContactForm`, mutated by `AdminInbox` (read/accept/finish/rate/delete), read by `UserDashboard` (filtered by `ownerEmail`) and by `App.calculateUnreadCount` for the nav badge. `AdminInbox` seeds a sample inquiry when the key is absent, which is why `App` defaults `unreadCount` to 1. The full inquiry lifecycle (`read → accepted → finished` + `rate`) lives on this one record shape; revenue totals only count `finished`.
- **`kraft-users` / `kraft-current-user`** — `src/context/AuthContext.tsx`. `AuthProvider` wraps the app in `main.tsx`; use `useAuth()` for `user`, `isAdmin`, `login`, `signup`, `loginWithGoogle`, `logout`.

Because there is no server, mutations from a dashboard don't notify other components automatically — `App` passes `calculateUnreadCount` down as `onInquiryCountChange` so writers can trigger a re-count. Follow that pattern rather than adding a store.

Admin credentials are hardcoded constants at the top of `AuthContext.tsx` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) and ship in the client bundle — deliberate for this static site. `GOOGLE_CLIENT_ID` in the same file is empty; while empty the Google button falls back to a demo identity.

### 3D / animation components

Three vendored `.jsx` components (React Bits style, intentionally untyped and left as JSX):

- `MagicRings.jsx` — animated hero background (`Hero.tsx`)
- `CardSwap.jsx` — GSAP-driven card stack (`Showcase.tsx`); the only GSAP user
- `Lanyard.jsx` — React Three Fiber + rapier physics badge (`AboutUs.tsx`), imports `card.glb` and `lanyard.png` colocated in `src/components/`

`vite.config.ts` sets `assetsInclude: ['**/*.glb']` for that model; `src/global.d.ts` declares `*.glb` and `*.png` modules. Keep `AboutUs` lazy — it is the only entry point to the 3D bundle.

### Styling

Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js`). Design tokens are declared in an `@theme` block in `src/index.css`: `font-sans` Inter, `font-display` Space Grotesk, `font-serif` Playfair Display, `font-mono` JetBrains Mono, loaded from Google Fonts. Page background is `#F8F9FA` throughout — the lazy-load fallback and `html` background hardcode it too. Utility classes are written inline; the recurring idiom is `font-mono text-[10px] uppercase tracking-widest` for labels.

`@` is aliased to the repo root in both `vite.config.ts` and `tsconfig.json`, but source files use relative imports.
