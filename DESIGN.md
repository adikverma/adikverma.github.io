# Design Specification — Home Page (`/index.html`)

This document describes the visual architecture, tokens, contrast ratios, typography, interactive states, and motion budget for the single-screen home page of `adikverma.github.io`.

---

## 1. Layout Grid & Breakpoints

The home page is composed as a single-screen editorial triptych that fits comfortably within a `1440×900` desktop viewport without vertical scrolling (`min-height: max(100svh, 620px)`).

| Breakpoint | Layout Structure | Container Width | Ordering |
| :--- | :--- | :--- | :--- |
| `< 640px` (e.g., `360px`) | 1-column stack; contact pills collapse to `44×44` icon-only circles with `aria-label` | `100%` (`padding: 4.25rem 1.25rem 2.25rem`) | Photo (`≤ 240px`) → Headline + Pills → Intro + Contact → Honors row |
| `640px – 1023px` (e.g., `768px`) | 1-column centered stack; contact pills reveal icon + label | `max-width: 660px` | Photo (`240px`) → Headline + Pills → Intro + Contact → Honors row |
| `≥ 1024px` (`1024px`, `1440px`, `1920px`) | 3-column horizontal composition vertically centered in `100svh`; Honors moves to fixed right-edge vertical tab | `max-width: 1200px` centered (`grid-template-columns: minmax(0, 1.14fr) auto minmax(0, 0.94fr)`) | Left: Headline + Pills · Center: Arch Portrait (`320–368px`) · Right: Intro + Contact |

**Rationale:** Placing the portrait arch in the center creates a clear focal anchor flanked by identity (left) and concise context/contact (right). Capping container width at `1200px` prevents excessive horizontal spread on `1920px` and ultra-wide displays.

---

## 2. Shared Tokens & Color System

Tokens live in `/assets/css/tokens.css` so `/index.html` and product pages under `/runwiththewind/` can share one color and motion foundation. The home page uses **dark-first** defaults with a full light mode (defaulting to the OS preference via `prefers-color-scheme`, persisted in `localStorage` under `theme-mode`, and applied before first paint by a small inline `<head>` script).

A single warm sunrise orange accent (`#ff7a45` in dark mode, `#b84010` in light mode) is reserved strictly for the italic headline line, the running route line and endpoint dot, hover glows, and `:focus-visible` rings.

### Verified WCAG 2.1 Contrast Table

Every foreground/background pairing passes WCAG AA (≥ 4.5:1 normal text, ≥ 3.0:1 large text).

#### Dark Mode (`#0b0b0c` canvas, `#141416` solid card surface)
| Token / Role | Foreground | Background | Ratio | Rating |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` on `--bg` | `#f3f1ed` | `#0b0b0c` | **17.44:1** | AAA |
| `--text-secondary` on `--bg` | `#b6b2ac` | `#0b0b0c` | **9.32:1** | AAA |
| `--text-muted` on `--bg` | `#8f8b85` | `#0b0b0c` | **5.81:1** | AA |
| `--accent` on `--bg` | `#ff7a45` | `#0b0b0c` | **7.61:1** | AAA |
| `--text-primary` on `--surface-solid` | `#f3f1ed` | `#141416` | **16.31:1** | AAA |
| `--text-secondary` on `--surface-solid` | `#b6b2ac` | `#141416` | **8.72:1** | AAA |
| `--text-muted` on `--surface-solid` | `#8f8b85` | `#141416` | **5.43:1** | AA |
| `--accent` on `--surface-solid` | `#ff7a45` | `#141416` | **7.12:1** | AAA |

#### Light Mode (`#f7f4ef` warm canvas, `#fdfbf8` solid card surface)
| Token / Role | Foreground | Background | Ratio | Rating |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` on `--bg` | `#161514` | `#f7f4ef` | **16.62:1** | AAA |
| `--text-secondary` on `--bg` | `#4c4844` | `#f7f4ef` | **8.26:1** | AAA |
| `--text-muted` on `--bg` | `#635e59` | `#f7f4ef` | **5.84:1** | AA |
| `--accent` on `--bg` | `#b84010` | `#f7f4ef` | **5.07:1** | AA |
| `--text-primary` on `--surface-solid` | `#161514` | `#fdfbf8` | **17.66:1** | AAA |
| `--text-secondary` on `--surface-solid` | `#4c4844` | `#fdfbf8` | **8.77:1** | AAA |
| `--text-muted` on `--surface-solid` | `#635e59` | `#fdfbf8` | **6.21:1** | AA |
| `--accent` on `--surface-solid` | `#b84010` | `#fdfbf8` | **5.39:1** | AA |

---

## 3. Typography Scale

Two self-hosted, open-licensed (SIL OFL) Latin-subset WOFF2 fonts eliminate third-party CDN requests:
- **Primary Sans (`Plus Jakarta Sans` variable, `400–700`):** `26.7 KB` (`/assets/fonts/plus-jakarta-sans-var-latin.woff2`), `font-display: swap`, preloaded via `<link rel="preload">`.
- **Headline Accent Serif (`Instrument Serif` italic, `400`):** `21.6 KB` (`/assets/fonts/instrument-serif-italic-latin.woff2`), `font-display: swap`, used exclusively for the second headline line (`"and distance runner."`).

| Element | Font | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Headline line 1 (`h1`) | Plus Jakarta Sans | `clamp(2.4rem, 5.2vw, 4.75rem)` | `600` | `1.02` | `-0.038em` |
| Headline line 2 (accent) | Instrument Serif (italic) | `1.08em` of `h1` | `400` | `1.04` | `-0.012em` |
| Intro lead + body | Plus Jakarta Sans | `clamp(1rem, 1.25vw, 1.2rem)` | `500` / `400` | `1.55` | `0` |
| Primary / Secondary pills | Plus Jakarta Sans | `0.9375rem` (`15px`) | `500` | `1.0` | `0` |
| Contact pills & Honors items | Plus Jakarta Sans | `0.875rem` (`14px`) | `500` / `400` | `1.45` | `0` |
| Desktop Honors vertical tab | Plus Jakarta Sans | `0.8125rem` (`13px`) | `500` | `1.0` | `0.04em` |

**Rationale:** Pairing a tight, crisp geometric sans with a single italic serif phrase establishes contrast between engineering precision and running cadence while keeping total font transfer under `50 KB`.

---

## 4. Component States

All interactive controls (primary pill, Resume pill, contact pills, mode toggle, Honors tab) share a unified state grammar:
- **Rest:** Minimum `44px` tap height, full pill radius (`9999px`), `1px` hairline border (`--border`), subtle translucent fill (`--surface`).
- **Hover:** Border intensifies to `--accent-border`, soft inner sunrise glow (`--accent-glow`), `-2px` vertical lift (`-1px` on round mode toggle, `-2px` inward nudge on right-edge Honors tab).
- **Focus (`:focus-visible`):** `2px solid var(--accent)` outline with `3px` offset (`8px` on portrait figure).
- **Active:** `scale(0.98)` slight press feedback (`scale(0.97)` on round toggle).
- **Primary Pill (`Run with the Wind ↗`):** Tinted `--accent-soft` fill and `--accent-border` at rest; arrow nudges `translate(2px, -2px)` on hover.
- **Portrait Arch:** At rest, `grayscale(1) contrast(1.06) brightness(0.92)` paired with a soft-light sunrise wash (`::after`); on `:hover` or `:focus-visible`, eases smoothly (`420ms`) to full natural color.

---

## 5. Honors Component

Built with native HTML `<details id="honors">` and `<summary class="honors-tab">` so disclosure works with **zero JavaScript**:
- **Desktop (`≥ 1024px`):** Fixed vertically centered on the right edge (`right: 0; top: 50%`) as a slim `44px × 112px` vertical bookmark (`border-right: 0`, rounded left corners). Opens a `310px` floating card to the left displaying the three honors items.
- **Mobile (`< 1024px`):** Renders in normal document flow as a collapsed disclosure pill below the contact row, expanding inline when tapped.
- **Progressive JS (`assets/js/honors.js`):** On hover-capable desktops, opens on pointer hover or keyboard focus, closes with a `180ms` grace timer on pointer leave, closes on `Escape` (returning focus to `<summary>`), and closes on outside click.

---

## 6. Motion Spec & Reduced Motion

| Interaction | Implementation | Duration & Easing | Reduced Motion (`prefers-reduced-motion: reduce`) |
| :--- | :--- | :--- | :--- |
| Headline word reveal | CSS `@keyframes wordReveal` (blur 8px + 7px Y → sharp) | `340ms` per word, `60ms` stagger across 5 words (`580ms` total, `< 700ms`) | Disabled; words render immediately crisp |
| Portrait route draw | SVG `stroke-dashoffset` (`pathLength="100"`) + endpoint dot fade | `1400ms` once (`180ms` delay) + `260ms` dot reveal | Shown immediately fully drawn (`stroke-dashoffset: 0`) |
| Portrait color ease | CSS `filter` + overlay `opacity` | `420ms cubic-bezier(0.22, 1, 0.36, 1)` | Color/filter transition kept; no spatial movement |
| Pill & toggle hovers | `transform`, `box-shadow`, `border-color`, `background-color` | `180ms cubic-bezier(0.22, 1, 0.36, 1)` | Color/border changes only (`transform: none`) |
| Honors card reveal | CSS opacity + 6px X slide | `180ms cubic-bezier(0.22, 1, 0.36, 1)` | Instant open/close (`animation: none`) |
| Atmospheric wind field | `<canvas>` (`72` flowing streamlines, DPR `≤ 2`, cursor bend) | Continuous `rAF`, paused when tab hidden or off-screen | Canvas hidden (`display: none`) and script exits immediately |
