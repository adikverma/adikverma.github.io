# Run with the Wind — Product Page Design System

> Standalone visual identity for `/runwiththewind/`, `/runwiththewind/privacy/`, and `/runwiththewind/callback/`.
> Intentionally decoupled from the portfolio home page (`DESIGN.md`, `tokens.css`, `home.css`).

---

## 1. Concept & Visual Direction

**Theme:** *Dawn Air (Light)* and *Pre-Dawn Track (Dark)*.

Where the portfolio home page is a quiet, editorial monochrome split-screen, Run with the Wind is a sports instrument built for motion, momentum, and dawn runs. The page pairs crisp morning air surfaces (`#F7F8FA` / `#0B0E14`) with kinetic vermilion accents pulled straight from the emblem, tabular numeric telemetry, and a hands-on Watch + Phone interactive showcase right below the hero.

- **Audience:** Distance runners evaluating a focused Wear OS recorder, and Android / Wear OS engineers curious about how it is architected.
- **No home-page coupling:** Uses its own stylesheet (`/assets/css/product.css`), its own custom properties, its own `localStorage` theme key (`rwt-theme`), and its own typography pairing.

---

## 2. Color System & Measured Contrast (WCAG 2.1)

### Dominant Hues Extracted from `/assets/img/run-with-the-wind-logo.webp`
- **Signal Vermilion:** `#F03010` (primary leaf-runner stroke & watch progress arc)
- **Burnt Ember:** `#4B0802` (deep ember shadow inside the emblem)
- **OLED Obsidian:** `#010000` (true-black Wear OS watch dial)

To hit WCAG AA/AAA on light and dark backgrounds, `--brand` shifts from `#F03010` to deep signal vermilion `#C92409` on light surfaces and luminous coral-vermilion `#FF6847` on dark surfaces, while preserving `#F03010` for graphic strokes, progress arcs, and logo accents.

### Light Mode — Dawn Air (`:root` default / `[data-theme="light"]`)

| Token | Value | Tested Against | Measured Contrast | Level |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` | `#11161F` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **17.06:1** / **18.13:1** | AAA |
| `--ink-secondary` | `#3E4857` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **8.71:1** / **9.25:1** | AAA |
| `--ink-muted` | `#556173` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **5.91:1** / **6.28:1** | AA |
| `--brand` | `#C92409` | `--bg` `#F7F8FA` / `--surface` `#FFFFFF` | **5.28:1** / **5.62:1** | AA |
| Primary CTA text `#FFFFFF` | `#FFFFFF` | `--brand` `#C92409` | **5.62:1** | AA |
| Badge `available` | `#0F5B35` | `#E5F5EC` | **7.24:1** | AAA |
| Badge `in-progress` | `#9E1F09` | `#FDECE8` | **6.91:1** | AA |
| Badge `planned` | `#414D5E` | `#ECEFF4` | **7.44:1** | AAA |

### Dark Mode — Pre-Dawn Track (`@media (prefers-color-scheme: dark)` / `[data-theme="dark"]`)

| Token | Value | Tested Against | Measured Contrast | Level |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` | `#F2F5FA` | `--bg` `#0B0E14` / `--surface` `#131822` | **17.68:1** / **16.27:1** | AAA |
| `--ink-secondary` | `#B7C1D1` | `--bg` `#0B0E14` / `--surface` `#131822` | **10.64:1** / **9.79:1** | AAA |
| `--ink-muted` | `#8B98AD` | `--bg` `#0B0E14` / `--surface` `#131822` | **6.62:1** / **6.09:1** | AA |
| `--brand` | `#FF6847` | `--bg` `#0B0E14` / `--surface` `#131822` | **6.74:1** / **6.20:1** | AA |
| Primary CTA text `#FFFFFF` | `#FFFFFF` | `--cta-bg` `#C92409` | **5.62:1** | AA |
| Badge `available` | `#6FE3A8` | `#102A1E` | **9.64:1** | AAA |
| Badge `in-progress` | `#FF8C73` | `#2E1511` | **7.51:1** | AAA |
| Badge `planned` | `#B3C0D4` | `#1A2230` | **8.67:1** | AAA |
| Watch OLED dial text | `#F2F5FA` | `#06080C` | **18.34:1** | AAA |
| Watch OLED accent | `#FF6847` | `#06080C` | **6.99:1** | AA |

### Theme Persistence & No-Flash Paint
A tiny inline `<head>` script reads `localStorage.getItem('rwt-theme')` inside `try/catch` and sets `data-theme="dark"` or `data-theme="light"` on `<html>` before CSS paints, alongside `document.documentElement.classList.add('js')`. It is authorized by an exact SHA-256 hash in the page's Content-Security-Policy (`script-src 'self' 'sha256-...'`).

---

## 3. Typography

Self-hosted SIL OFL Latin-subset WOFF2 fonts under `/assets/fonts/` (`font-display: swap`, zero external font CDNs):

| Role | Family | Files & Sizes | Usage |
| :--- | :--- | :--- | :--- |
| Display / Metrics | **Barlow Condensed** (600, 700) | `barlow-condensed-600-latin.woff2` (22.3 KB), `barlow-condensed-700-latin.woff2` (22.4 KB) | Hero display headline, section headings, watch OLED metrics, step numerals |
| Body / UI | **Plus Jakarta Sans** (variable 400–700) | `plus-jakarta-sans-400-700-latin.woff2` (27.3 KB) | Body copy, cards, controls, status badges, privacy policy prose |
| Tabular Data | `.tabular` (`font-variant-numeric: tabular-nums`) | Applied to pace, distance, heart rate, splits, step numbers, and dev-log dates | Prevents horizontal jitter during 1 Hz watch simulation |

Only the two critical faces (`barlow-condensed-700-latin.woff2` and `plus-jakarta-sans-400-700-latin.woff2`) are preloaded in `<head>`.

---

## 4. Layout & Responsive Breakpoints

- **Mobile-first container:** `.wrap` uses `min(100% - 2rem, 1120px)` with `overflow-x: clip` on `html` and `body`, ensuring zero horizontal overflow at `360px`, `768px`, `1280px`, and `1920px`.
- **Alternating bands:** `.band` (`--bg`) and `.band-alt` (`--surface-alt`) provide rhythm without decorative dividers.
- **Responsive grids:**
  - Feature spotlights (`.feat-spotlights`): 1 column on mobile, 2 columns at `>= 768px` (Watch + Phone lead cards with vermilion top accent and telemetry strip).
  - Core feature pillars (`.feat-pillars`): 1 column on mobile, 2×2 grid at `>= 680px`.
  - Coming soon roadmap (`.roadmap-list`): 1 column -> 2 columns (`>= 680px`) -> 3 columns (`>= 1024px`) understated editorial list with left hairline rules (no task-style status pills).
  - How it works (`.steps-grid`): 1 column -> 3 columns (`>= 768px`).
  - Under the hood (`.hood-grid`): 1 column -> 2 columns (`>= 680px`) -> 3 columns (`>= 1024px`).
  - About & Connect (`.connect-grid`): 1 column on mobile -> balanced 2-column formal bio + link directory (`https://adikverma.github.io/`, LinkedIn, Strava) at `>= 768px`.
  - Privacy policy (`.doc-article`): centered `720px` reading measure for comfortable long-form reading.

---

## 5. Components & States

- **Top Bar:** Contains only the left back link (`← Aditya Kumar Verma` -> `/#run-with-the-wind` on the product page; `← Run with the Wind` -> `/runwiththewind/` on Privacy/Callback) and the right theme toggle (omitted on the zero-script callback page). No extra nav items.
- **Product Feature Showcase:** Two lead spotlight cards (`.feat-spot`) plus four core capability pillars (`.feat-pillar`) using icon + category kicker + benefit copy—free of task-tracker badges—paired with a separate editorial `Coming soon` roadmap block below.
- **Status Badge (`.status-badge`):** Used in the Dev Log timeline (`data-status="available" | "in-progress" | "planned"`).
- **Screens Gallery (`.screen-track`):** Native CSS horizontal scroll-snap track (`scroll-snap-type: x mandatory`) with Prev/Next scroll buttons enhanced via JS, keyboard-focusable (`tabindex="0"`), and clearly tagged `Illustrative` on every SVG placeholder slot.
- **FAQ (`.faq-item`):** Native HTML `<details>` / `<summary>` disclosures that work identically with or without JavaScript.
- **About & Connect (`.connect-grid`):** Dedicated formal section before the footer linking to `https://adikverma.github.io/`, LinkedIn, and Strava.

---

## 6. Motion & Reduced Motion

- Subtle CSS transitions (`180ms cubic-bezier(0.16, 1, 0.3, 1)`) on buttons, theme switch, and links.
- `@media (prefers-reduced-motion: reduce)` disables all transitions, animations, and smooth scrolling; gallery Prev/Next controls switch to instant scroll (`behavior: 'auto'`).

---

## 7. Accessibility Checklist

- Single `<h1>` per page; strictly ordered heading hierarchy (`h1 -> h2 -> h3 -> h4`).
- Semantic landmarks (`<header>`, `<main id="main">`, `<section aria-labelledby>`, `<footer>`) and a visible-on-focus skip link (`.skip-link`).
- High-contrast `2px solid var(--brand)` `:focus-visible` outlines on every interactive control (`outline-offset: 3px`).
- All external links with `target="_blank"` include `rel="noopener noreferrer"`.
- Zero inline `style=""` attributes and zero inline `on*` event handlers across all HTML pages.

---

## 8. Maintenance Recipes (Copy-Paste HTML)

All product content lives directly in `/runwiththewind/index.html` (no JSON config files).

### Add a Feature Card
Copy an `<article class="feat-card">` inside `#features .feat-grid` (or `.soon-grid` for Planned items):
```html
<article class="feat-card">
  <div class="feat-top">
    <h3 class="feat-title">Feature name</h3>
    <span class="status-badge" data-status="available">Available</span>
  </div>
  <p class="feat-desc">One or two honest sentences describing what it does.</p>
</article>
```
To flip a feature's status, edit **one element** — its `data-status` attribute (`available`, `in-progress`, or `planned`) and its visible word (`Available`, `In progress`, or `Planned`).

### Add a New Status Type
Add a matching `[data-status="beta"]` rule in `/assets/css/product.css` for both light and dark modes (verifying `>= 4.5:1` contrast) and apply `<span class="status-badge" data-status="beta">Beta</span>`.

### Add a Dev Log Entry
Prepend a new `<article class="log-entry">` at the top of `#dev-log .log-list` (newest first):
```html
<article class="log-entry">
  <div class="log-meta tabular">
    <time datetime="2026-12">2026-12</time>
    <span class="status-badge" data-status="available">Available</span>
  </div>
  <div>
    <h3 class="log-title">Milestone title</h3>
    <p class="log-body">Short summary of what shipped.</p>
  </div>
</article>
```

### Swap an Illustrative Screen for a Real Screenshot
Inside `#screens .screen-track`, replace the `<svg>...</svg>` inside `.screen-frame` with:
```html
<img
  src="/assets/img/product/screens/screen-01.webp?v=20261128"
  width="600"
  height="750"
  loading="lazy"
  decoding="async"
  alt="Wear OS watch displaying live running metrics"
/>
```
Remove the `<span class="screen-illus">Illustrative</span>` tag inside its `<figcaption>`.

### Add an FAQ Item
Append a native `<details class="faq-item">` inside `#faq .faq-list`:
```html
<details class="faq-item">
  <summary>Your question?</summary>
  <p class="faq-answer">Direct, honest answer.</p>
</details>
```
