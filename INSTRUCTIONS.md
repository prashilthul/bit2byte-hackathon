# Instructions — Bit2Byte

## 1. Landing Page — GSAP Animations (Awwwards-worthy)

### Scope
Landing page **ONLY**. No other page in the app should include GSAP or scroll-driven animation logic.

### Requirements

#### Libraries
- `gsap` (GreenSock Animation Platform)
- `@gsap/react` (official React hook integration)
- `gsap/ScrollTrigger` plugin
- `gsap/TextPlugin` (if typewriter or split-text effects are used)

#### Animation Effects
- **Hero section:** Split-text reveal on the main headline (each word or character animates in with `stagger`). Accompanied by a subtle parallax background layer.
- **Scroll-triggered timeline:** Use `ScrollTrigger` to drive a pinned timeline on feature sections — elements fade-in + slide-up as they enter the viewport, sequenced with `stagger: 0.15`.
- **CTA button:** Magnetic hover effect (GSAP `gsap.to()` on `mouseenter`/`mouseleave` with slight scale + a subtle `.set()` transformOrigin correction).
- **Stats / numbers row:** Count-up animation triggered once when the section scrolls into view (use `ScrollTrigger` + `gsap.to` with `snap` or a custom `onUpdate`).
- **Footer reveal:** On scroll, the footer slides up from below with a slight opacity fade.

#### Performance
- All animations must use `will-change: transform, opacity` on animated elements.
- Use `gsap.matchMedia()` to disable heavy animations on mobile (reduce to simple fades).
- Never animate layout-triggering properties (`width`, `height`, `top`, `left`). Prefer `transform` and `opacity`.
- Wrap GSAP logic in `useEffect` (or `useGSAP()`) with proper cleanup via `gsap.context()`.

#### Awwwards-worthy touches
- Smooth scroll-linked progress bar using `ScrollTrigger`'s `onUpdate` to drive a horizontal line at the top of the viewport.
- Grain/noise overlay (CSS pseudo-element with a tiny base64 noise image) over the hero — subtle, optional.
- Cursor follower on hero section (custom cursor that trails the mouse with a `gsap.to()` lerp — disable on mobile).

### What NOT to do
- Do NOT apply GSAP or ScrollTrigger outside the landing page bundle.
- Do NOT use `scroll-behavior: smooth` on the body — let ScrollTrigger handle all scroll awareness.
- Do NOT block page render waiting for GSAP to load — lazy-load animations via dynamic import.

---

## 2. End-to-End UI/UX — Everything Else

All non-landing pages and components must be fully built with **complete production UI/UX**. No placeholders, no "under construction" states, no skeleton-only views.

### Requirements
- **Every view** must handle all states: **loading**, **empty**, **error**, **success**, and **edge cases**.
- **Forms** must validate inline with error messages, disabled submit while invalid, and show success/error toasts after submission.
- **Navigation** must be wired end-to-end — all links point to real routes, breadcrumbs update correctly, active states highlighted.
- **Data flow** must be complete — no hardcoded mock data at the route level unless specified otherwise. API integration (or a proper mock service) should be in place.
- **Modals, drawers, toasts** — every overlay component must have open/close/transition/dismiss wired.
- **Responsive** — all pages must be fully functional across mobile (< 768px), tablet (768–1023px), and desktop (≥ 1024px) breakpoints.
- **Accessibility** — all interactive elements must have focus styles, proper ARIA labels, keyboard navigation, and screen-reader-friendly markup.
- **Animations** — Use subtle CSS transitions / `framer-motion` (or equivalent) for micro-interactions on non-landing pages. Never GSAP.
- **All UI must reference the design tokens** defined in `DESIGN.md` (colors, typography, spacing, rounded corners, component specs).

### Pages that must be E2E complete (example list — adjust per project scope):
- Auth (login / signup / password reset)
- Dashboard / home (post-login)
- User settings / profile
- Any CRUD feature pages (list, detail, create, edit)
- Notifications / activity feed
- API error boundary + fallback UI at the app root

---

## 3. Docker — Single Container + Live Reload

### Container Setup
- **One Docker container** runs the entire app (Next.js dev server or equivalent).
- No multi-container orchestration (no separate DB container, no nginx sidecar for dev).

### Dockerfile (dev)
- Use a Node.js base image (e.g., `node:20-alpine`).
- Set `WORKDIR /app`.
- Copy `package.json` and `package-lock.json` first, run `npm install`.
- Copy the rest of the app source.
- Expose the dev port (e.g., `3000` for Next.js, `5173` for Vite).
- Start the dev server (e.g., `npm run dev`).
- **Do NOT** run `next build` or `npm run build` — the dev image must serve the unbuilt source for HMR.

### Volume Mounts (Live Reload)
Bind-mount the project root into the container so file changes reflect instantly:

```yaml
volumes:
  - .:/app
  - /app/node_modules   # anonymous volume to avoid overriding container node_modules
```

- The first mount syncs all source code changes from host into container.
- The second mount (`/app/node_modules`) is a named/anonymous volume that preserves the container's own `node_modules` so host OS mismatches don't break packages.

If using `docker run` directly:

```bash
docker run -p 3000:3000 -v .:/app -v /app/node_modules bit2byte-dev
```

### Hot Module Replacement (HMR)
- Next.js (or Vite) dev mode with WebSocket enabled must work through the volume mount.
- Ensure `next.config.js` (or `vite.config.ts`) has `webSocketServer` or `hmr` configured to listen on `0.0.0.0` so the container can forward the WebSocket connection:
  - Next.js: `devIndicators` and `webpack` HMR typically work out of the box with `WATCHPACK_POLLING=true` on Linux/macOS if file events don't propagate. Set env `CHOKIDAR_USEPOLLING=true` or `WATCHPACK_POLLING=true` as a fallback.
  - Vite: set `server.watch.usePolling: true` and `server.host: true`.

### Port Mapping
- Map host port to container port: `-p 3000:3000` (or whichever the dev server uses).

### Recommended `docker-compose.yml` structure (dev only — for reference):

```yaml
version: "3.9"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true   # for HMR on all platforms
```
