# Design Specification — Run with the Wind Product Pages

Standalone visual identity for `/runwiththewind/`, `/runwiththewind/privacy/`, and `/runwiththewind/callback/`. Intentionally decoupled from the portfolio home page ([DESIGN.md](DESIGN.md), `assets/css/tokens.css`, `assets/css/home.css`).

---

## 1. Visual Direction

**Themes:** *Dawn Air* (light) and *Pre-Dawn Track* (dark).

Where the portfolio home page uses a quiet monochrome split-screen, the Run with the Wind product pages use crisp morning-air surfaces (`#F7F8FA` light / `#0B0E14` dark), kinetic vermilion accents derived from the application emblem, athletic condensed display typography, and tabular numeric formatting.

- **Audience:** Distance runners evaluating a Wear OS workout tracker, and Android / Wear OS developers exploring how it is built.
- **Isolation:** Uses its own stylesheet (`assets/css/product.css`), its own CSS custom properties, its own `localStorage` theme key (`rwt-theme`), and its own self-hosted typography pairing.

---

## 2. Color System & Measured WCAG 2.1 Contrast

### Emblem Base Hues (`assets/img/run-with-the-wind-logo.webp`)

- **Signal Vermilion:** `#F03010` (emblem mark & spotlight accent border)
- **Burnt Ember:** `#4B0802` (emblem shadow)
- **Obsidian:** `#010000` (emblem backdrop)

For text legibility, `--brand` shifts to deep vermilion `#C92409` on light surfaces and coral-vermilion `#FF6847` on dark surfaces while keeping `#F03010` (`--brand-mark`) for graphic accents and focus rings.

### Light Mode — Dawn Air (`:root` default / `[data-theme="light"]`)

| CSS Property / Role | Value | Tested Against | Measured Contrast | WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` | `#11161F` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **17.06:1** / **18.13:1** | AAA |
| `--ink-secondary` | `#3E4857` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **8.71:1** / **9.25:1** | AAA |
| `--ink-muted` | `#556173` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **5.91:1** / **6.28:1** | AA |
| `--brand` | `#C92409` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **5.28:1** / **5.62:1** | AA |
| Primary CTA `#FFFFFF` | `#FFFFFF` | `#C92409` | **5.62:1** | AA |
| Badge `available` | `#0F5B35` | `#E5F5EC` | **7.24:1** | AAA |
| Badge `in-progress` | `#9E1F09` | `#FDECE8` | **6.91:1** | AA |
| Badge `planned` | `#414D5E` | `#ECEFF4` | **7.44:1** | AAA |

### Dark Mode — Pre-Dawn Track (`@media (prefers-color-scheme: dark)` / `[data-theme="dark"]`)

| CSS Property / Role | Value | Tested Against | Measured Contrast | WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` | `#F2F5FA` | `--bg` `#0B0E14` / `--surface` `#131822` | **17.68:1** / **16.27:1** | AAA |
| `--ink-secondary` | `#B7C1D1` | `--bg` `#0B0E14` / `--surface` `#131822` | **10.64:1** / **9.79:1** | AAA |
| `--ink-muted` | `#8B98AD` | `--bg` `#0B0E14` / `--surface` `#131822` | **6.62:1** / **6.09:1** | AA |
| `--brand` | `#FF6847` | `--bg` `#0B0E14` / `--surface` `#131822` | **6.74:1** / **6.20:1** | AA |
| Primary CTA `#FFFFFF` | `#FFFFFF` | `#C92409` | **5.62:1** | AA |
| Badge `available` | `#6FE3A8` | `#102A1E` | **9.64:1** | AAA |
| Badge `in-progress` | `#FF8C73` | `#2E1511` | **7.51:1** | AAA |
| Badge `planned` | `#B3C0D4` | `#1A2230` | **8.67:1** | AAA |

### Theme Persistence & No-Flash Paint

On `/runwiththewind/` and `/runwiththewind/privacy/`, a small synchronous inline `<head>` script reads `localStorage.getItem('rwt-theme')` inside `try/catch`, sets `data-theme="dark"` or `data-theme="light"` on `<html>` before CSS paints, and adds `html.js`. It is permitted by an exact SHA-256 hash in the page's Content Security Policy (`script-src 'self' 'sha256-...'`). The OAuth callback page (`/runwiththewind/callback/`) runs no scripts (`script-src 'none'`) and follows the system color scheme natively via CSS.

---

## 3. Typography

Self-hosted SIL OFL Latin-subset WOFF2 fonts under `assets/fonts/` (`font-display: swap`):

| Role | Family | Files & Sizes | Usage |
| :--- | :--- | :--- | :--- |
| Display / Numerals | **Barlow Condensed** (600, 700) | `barlow-condensed-600-latin.woff2` (`22.3 KB`), `barlow-condensed-700-latin.woff2` (`22.4 KB`) | Hero headline, section titles, spotlight headings, step numerals |
| Body / UI | **Plus Jakarta Sans** (variable `400–700`) | `plus-jakarta-sans-400-700-latin.woff2` (`27.3 KB`) | Body copy, cards, controls, FAQ, privacy policy prose |
| Tabular Numerals | `.tabular` (`font-variant-numeric: tabular-nums`) | Applied to telemetry metadata, step numbers, and dev-log dates | Aligns numeric characters cleanly |

Only the two critical font files (`barlow-condensed-700-latin.woff2` and `plus-jakarta-sans-400-700-latin.woff2`) are preloaded on `/runwiththewind/`.

---

## 4. Layout & Responsive Breakpoints

- **Container:** `.wrap` uses `min(100% - 2rem, 1120px)` with `overflow-x: clip` on `html` and `body` so layouts stay free of horizontal overflow from `360px` to `1920px+`.
- **Band rhythm:** Sections alternate between `.band` (`--bg`) and `.band-alt` (`--surface-alt`) separated by `1px` borders.
- **Responsive grids:**
  - **Feature spotlights (`.feat-spotlights`):** `1` column on mobile, `2` columns at `>= 768px`.
  - **Core feature pillars (`.feat-pillars`):** `1` column on mobile, `2×2` grid at `>= 680px`.
  - **Coming soon roadmap (`.roadmap-list`):** `1` column -> `2` columns (`>= 680px`) -> `3` columns (`>= 1024px`).
  - **How it works (`.steps-grid`):** `1` column -> `3` columns (`>= 768px`).
  - **Under the hood (`.hood-grid`):** `1` column -> `2` columns (`>= 680px`) -> `3` columns (`>= 1024px`).
  - **About & Connect (`.connect-grid`):** `1` column -> `2` columns (`>= 768px`).
  - **Privacy policy (`.doc-article`):** Centered `720px` reading column.

---

## 5. Components & States

- **Top Bar:** Single back link (`← Aditya Kumar Verma` -> `/#run-with-the-wind` on `/runwiththewind/`; `← Run with the Wind` -> `/runwiththewind/` on Privacy and Callback) plus a right-aligned theme toggle (omitted on `/runwiththewind/callback/`).
- **Product Feature Showcase (`#features`):** Two lead spotlight cards (`.feat-spot`) with vermilion top accents and telemetry summaries, four core capability pillars (`.feat-pillar`) with inline SVG icons and category kickers, and a quiet editorial `Coming soon` roadmap block (`.roadmap-panel`) separated by a hairline border.
- **How It Works:** Three numbered step cards (`.steps-grid`) detailing watch recording, phone sync, and Strava upload.
- **Screens Gallery (`#screens`):** Native CSS horizontal scroll-snap track (`.screen-track`, `scroll-snap-type: x mandatory`, keyboard-focusable via `tabindex="0"`) with Prev/Next scroll buttons progressively enhanced via JS. Illustrative SVG previews are explicitly labeled `Illustrative`.
- **Dev Log (`#dev-log`):** Reverse-chronological milestone list (`.log-list`) using single-element `.status-badge` spans (`data-status="available" | "in-progress" | "planned"`).
- **Under the Hood:** Compact 6-card grid summarizing the Android/Wear OS stack (Kotlin, Jetpack Compose, Health Services, Room, Wearable Data Layer, WorkManager).
- **FAQ (`#faq`):** Native HTML `<details>` / `<summary>` disclosures working identically with or without JavaScript.
- **About & Connect (`#connect`):** Formal closing band linking to the portfolio (`https://adikverma.github.io/`), LinkedIn, and Strava.

---

## 6. Motion & Accessibility

- Subtle CSS transitions (`180ms cubic-bezier(0.16, 1, 0.3, 1)`) on interactive controls.
- `@media (prefers-reduced-motion: reduce)` disables all transitions, animations, and smooth scrolling; gallery scroll buttons switch to instant scroll (`behavior: 'auto'`).
- Single `<h1>` per page, semantic landmarks (`<header>`, `<main id="main">`, `<section aria-labelledby>`, `<footer>`), visible-on-focus skip link (`.skip-link`), and `2px solid var(--brand-mark)` `:focus-visible` outlines (`outline-offset: 3px`).
- Zero inline `style=""` attributes and zero inline `on*` event handlers; all `target="_blank"` links include `rel="noopener noreferrer"`.

For copy-paste HTML recipes and operational procedures, see the [Maintenance Guide](MAINTENANCE.md).
