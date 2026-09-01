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

Single-page React 19 + Vite + Tailwind v4 marketing site for a web studio ("dywebixtech"). There is **no server of our own**: the app is a static bundle that talks to hosted services (Supabase for data, Firebase Auth for Google sign-in) directly from the browser, and falls back to `localStorage` when neither is configured. `express`, `@google/genai` and `dotenv` sit in `package.json` but are imported nowhere in `src/`.

Both services are configured entirely through `VITE_*` env vars in `.env` (see `.env.example`); nothing is committed. **The app degrades silently when they are unset** — inquiries go to `localStorage` and the Google button renders disabled — so an apparently working site may not be talking to any backend. Vite reads `.env` only at startup, so restart the dev server after changing it.

### Routing is hash-based and lives entirely in `src/App.tsx`

`App.tsx` reads `window.location.hash` into state (via a `hashchange` listener) and renders one of five top-level views, crossfaded by a single `AnimatePresence`/`motion.div` keyed on a `viewKey`:

| Hash | View |
|---|---|
| *(empty)* | Home — the stacked one-page site (Hero → Services → Showcase → Portfolio → ContactForm → footer) |
| `#login` / `#signup` | `LoginPage`, or redirect to the right dashboard if already signed in |
| `#dashboard` | `UserDashboard` (falls back to `LoginPage`) |
| `#admin` | `AdminGate` → `AdminInbox`, role-gated inside `AdminGate` |
| `#about` | `AboutUs`, **lazy-loaded** |

Home-page navigation is not routing: `handleSectionChange` scrolls to `#{section}-section` elements with an 80px sticky-nav offset. Anything that would reach the contact form while logged out redirects to `#login` instead.

### State

Two independent stores, and they are **not** alike:

- **`inquiries`** — array of `Inquiry` (`src/types.ts`), behind `src/lib/inquiries.ts`. Postgres-backed when configured. See **Inquiry storage** below.
- **`dywebix-users` / `dywebix-current-user`** — plain JSON in `localStorage`, in `src/context/AuthContext.tsx`. `AuthProvider` wraps the app in `main.tsx`; use `useAuth()` for `user`, `isAdmin`, `login`, `signup`, `loginWithGoogle`, `logout`. Accounts are per-browser and passwords are stored in the clear — this store never moved to a real backend.

Because there is no server, mutations from a dashboard don't notify other components automatically — `App` passes `calculateUnreadCount` down as `onInquiryCountChange` so writers can trigger a re-count. Follow that pattern rather than adding a store.

Admin credentials are hardcoded constants at the top of `AuthContext.tsx` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) and ship readable in the client bundle — deliberate for this static site, but it means the admin gate deters only casual visitors and no rule keyed on it can be a real security boundary.

Google sign-in runs through **Firebase Auth** (`signInWithPopup`), so the app holds no Google Client ID of its own — setup is entirely console-side (enable the Google provider; list every host under Authorized domains, `localhost` included). `loginWithGoogle` in `AuthContext` rejects any call without a Google-verified name and email, so there is no demo/offline identity. `googleAuth.ts` maps `auth/*` codes to specific messages; a suspended API key and a blocked popup need different fixes, so keep them distinguishable rather than collapsing them into "try again".

### Inquiry storage

`src/lib/inquiries.ts` is the only module that touches inquiry storage — components call its async API and never reach the database themselves. Two backends behind one interface:

- **Postgres via Supabase** when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set. A browser cannot speak Postgres' wire protocol, so Supabase's HTTP API is what makes a serverless SQL database reachable from a static site. `src/lib/supabase.ts` creates the client lazily.
- **`localStorage`** otherwise, so the site runs with no setup.

Every function is async in both modes, so adding config never changes a caller. The table is snake_case while `Inquiry` is camelCase, so `toInquiry`/`toRow` map between them — `timestamp` is stored as `created_at` because `timestamp` is a Postgres type name. In `toRow`, `undefined` becomes `null` (clear the column); dropping the key would leave the old value in place.

`supabase/schema.sql` holds the table, indexes and RLS policies — run it once in the Supabase SQL Editor. The policies are permissive on purpose: the admin login is a client-side constant, so Postgres has no server-verified identity to key them off. Treat everything in `inquiries` as public data.

Writers are `ContactForm` (create) and `AdminInbox` (read/accept/finish/rate/delete — optimistic local state, then a background write that re-syncs from the store if it fails). Readers are `UserDashboard` (`listInquiriesFor`) and `App.calculateUnreadCount` (`countUnread`, a head-only count). `subscribeInquiries` uses Supabase Realtime but nothing subscribes yet.

**Firebase is still a dependency, for one job only:** the "Continue with Google" button (`src/lib/firebase.ts`, `src/lib/googleAuth.ts`). It no longer stores anything.

### 3D / animation components

Three vendored `.jsx` components (React Bits style, intentionally untyped and left as JSX):

- `MagicRings.jsx` — animated hero background (`Hero.tsx`)
- `CardSwap.jsx` — GSAP-driven card stack (`Showcase.tsx`); the only GSAP user
- `Lanyard.jsx` — React Three Fiber + rapier physics ID card (`Portfolio.tsx`), imports `card.glb` and `lanyard.png` colocated in `src/components/`

`vite.config.ts` sets `assetsInclude: ['**/*.glb']` for that model; `src/global.d.ts` declares `*.glb` and `*.png` modules. `Portfolio` is on the eagerly-loaded home page, so it `lazy()`-imports `Lanyard` and only mounts it once a `useInView` gate fires — keep that gate, it is what stops three/R3F/rapier from landing in the main bundle.

### Shared UI primitives

- `Loader.tsx` / `Loader.css` — the one loading animation (three shuffling boxes, adapted from Uiverse). `<Loader size color delay />` for inline use, `<PageLoader />` for full-viewport waits. It is used by `Preloader`, the lazy-route `Suspense` fallback in `App`, the `Lanyard` fallback in `Portfolio`, and the `ContactForm` submit button — add new spinners by composing it, not by forking it.
- `Logo.tsx` — the dywebixtech logo, from the single lockup PNG in `src/assets/`. `variant="mark"` background-crops the square "dw" glyph out of that one file; `variant="full"` shows the whole lockup. Both use `mix-blend-multiply` to drop the artwork's white plate, so they need a light background behind them (the footer wraps the mark in a white plate for this reason).

### Styling

Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js`). Design tokens are declared in an `@theme` block in `src/index.css`: `font-sans` Inter, `font-display` Space Grotesk, `font-serif` Playfair Display, `font-mono` JetBrains Mono, loaded from Google Fonts. The palette is the logo's, sampled from the artwork: `#0C6FC2` (the "dw" mark) and `#072750` (the wordmark). Brand tokens live alongside the fonts in that `@theme` block — `--color-brand`, `--color-brand-bright`, `--color-brand-deep`, `--color-brand-ink`, `--color-surface`. Page background is `#EEF4FC`, a soft blue wash, hardcoded in components and in the `html` rule. Darks are navy (`#041a37`/`#072750`) rather than black, primary actions are `#0c6fc2`, and hairlines carry a blue cast (`#cbdff5`). Utility classes are written inline; the recurring idiom is `font-mono text-[10px] uppercase tracking-widest` for labels.

`@` is aliased to the repo root in both `vite.config.ts` and `tsconfig.json`, but source files use relative imports.
