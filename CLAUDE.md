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

Single-page React 19 + Vite + Tailwind v4 marketing site for a web studio ("dywebixtech"). Everything is client-side — **there is no backend and no database**, despite `express` and `@google/genai` sitting in `package.json` (neither is imported anywhere in `src/`).

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

### State: localStorage is the database

Two independent stores, both plain JSON in `localStorage`, both read/written directly by components (no repository layer):

- **`inquiries`** — array of `Inquiry` (`src/types.ts`), now behind `src/lib/inquiries.ts` rather than read from `localStorage` directly. See **Inquiry storage** below.
- **`dywebix-users` / `dywebix-current-user`** — `src/context/AuthContext.tsx`. `AuthProvider` wraps the app in `main.tsx`; use `useAuth()` for `user`, `isAdmin`, `login`, `signup`, `loginWithGoogle`, `logout`.

Because there is no server, mutations from a dashboard don't notify other components automatically — `App` passes `calculateUnreadCount` down as `onInquiryCountChange` so writers can trigger a re-count. Follow that pattern rather than adding a store.

Admin credentials are hardcoded constants at the top of `AuthContext.tsx` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) and ship in the client bundle — deliberate for this static site. `GOOGLE_CLIENT_ID` in the same file is empty; the "Continue with Google" button stays disabled until a real Client ID is set — there is no demo/offline identity, and `loginWithGoogle` rejects any call without a verified name and email.

### Inquiry storage

`src/lib/inquiries.ts` is the only module that touches inquiry storage — components call its async API and never read `localStorage` or Firestore themselves. It has two backends behind one interface:

- **Firebase Realtime Database** once `VITE_FIREBASE_DATABASE_URL` points at a created database; `src/lib/firebase.ts` initialises lazily. RTDB rather than Firestore because new Firestore databases require a billing account. The rest of the project config is committed as `DEFAULTS` in that file — Firebase web config is a public identifier, not a credential, so a deploy works without env vars; `.env` still overrides it.
- **`localStorage`** otherwise, so the site runs with no setup — same behaviour as before the database existed.

Every function is async in both modes, so adding config never changes a caller. Inquiries are stored keyed by id under `/inquiries`, so `listInquiries` flattens the object back to a sorted array. `updateInquiry` maps `undefined` values to `null` (which deletes a key) because the database rejects undefined outright. The sample inquiry seed lives here (`SAMPLE_INQUIRY`) and is written when the store is empty, which is why the nav badge shows 1 on a fresh install.

Writers are `ContactForm` (create) and `AdminInbox` (read/accept/finish/rate/delete — optimistic local state, then a background write that re-syncs from the store if it fails). Readers are `UserDashboard` (`listInquiriesFor(ownerEmail)`) and `App.calculateUnreadCount` (`countUnread`). `subscribeInquiries` exists for live updates but nothing subscribes yet.

`database.rules.json` is permissive on purpose — the admin login is a client-side constant, so there is no server-verified identity to key rules off. Treat everything in `inquiries` as public data.

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

Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js`). Design tokens are declared in an `@theme` block in `src/index.css`: `font-sans` Inter, `font-display` Space Grotesk, `font-serif` Playfair Display, `font-mono` JetBrains Mono, loaded from Google Fonts. Page background is `#F8F9FA` throughout — the lazy-load fallback and `html` background hardcode it too. Utility classes are written inline; the recurring idiom is `font-mono text-[10px] uppercase tracking-widest` for labels.

`@` is aliased to the repo root in both `vite.config.ts` and `tsconfig.json`, but source files use relative imports.
