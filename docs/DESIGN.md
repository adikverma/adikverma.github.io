# Design Specification — Portfolio Home Page

Design architecture for the split-screen portfolio at [index.html](../index.html): layout grid, two-state navigation model, gesture normalization, color contrast, typography, components, motion budget, and progressive enhancement.

---

## 1. Layout Grid & Breakpoints

- **Outer frame:** `100dvh` fixed viewport (`overscroll-behavior: none`), `8px` outer padding (plus `env(safe-area-inset-*)`), `8px` gap between panels, `14px` corner radius on both panels, and `1px` hairline borders.
- **Desktop (`>= 900px`):** Two side-by-side panels (`grid-template-columns: 48% minmax(0, 1fr)`).
  - Left panel (`48%`): independently scrollable info view for the active section, or the running-course visual in LIST state, anchored by a single bottom-left theme toggle (`Light` in default dark mode; `Dark` in light mode).
  - Right panel (`52%`, `#070707` in both modes): full-bleed section image or vertical card stack, top-right contact link, extreme-edge left index (`01..04`) and right category (`ABOUT ME`, `PROJECT`, `HOBBY`), centered section wheel with horizontal bar separators, and bottom-center state hint (`SCROLL TO BROWSE` / `CLICK A CARD TO OPEN`).
- **Mobile & Tablet (`< 900px`):** Scrollable `.shell` layout above a docked `34px` theme footer strip.
  - Scrolling down collapses the showcase smoothly into a pinned `54px` `#070707` bar (`01  ABOUT ME  ▾`) while fading the background image to `opacity: 0`. In LIST state, the viewport locks to the `#070707` card stack in both themes.

Keeping the desktop viewport fixed isolates section navigation on the right from long-form reading on the left while preserving the same two-state model on touch screens.

---

## 2. Two-State Navigation Model

```text
                 wheel / swipe / Arrow / Page / Space
         ┌───────────────────────────────────────────────────┐
         │                                                   ▼
  ┌──────────────┐                                    ┌──────────────┐
  │  HERO STATE  │                                    │  LIST STATE  │
  │  listMix = 0 │                                    │  listMix = 1 │
  │              │                                    │              │
  │ Left:  Info  │                                    │ Left: Course │
  │ Right: Full  │ ◄───────────────────────────────── │ Right: Cards │
  └──────────────┘  click card / Enter / Escape /     └──────────────┘
                    hashchange                               │  ▲
                                                             └──┘
                                                    further units: index ± 1
                                                    (clamped 0..3, no bounce)
```

- **Deep linking:** The initial landing section resolves to the clean root URL (`/`) without a fragment. Other sections update the hash (`#run-with-the-wind`, `#running`, `#art`) via `history.replaceState`. Incoming `hashchange` events open the matching section directly in HERO state; `#about` and unrecognized hashes normalize to `/`. LIST state is never written to the URL.

---

## 3. Gesture Normalization & Input Lock

- **Scope isolation:** Non-passive `wheel` and `touchmove` listeners bind only to `.panel-right`. Scrolling over `.panel-left` scrolls `.left-scroll` natively without triggering section navigation. Keyboard navigation shortcuts ignore events while focus is inside `.left-scroll`.
- **Wheel normalization:** Converts `deltaMode` (`0` = px, `1` = lines × 16, `2` = pages × `window.innerHeight`) to pixels, accumulates `deltaY` (resetting on direction reversal or a `180ms` pause), and fires one navigation unit at `|accum| >= 40px`.
- **Anti-double-trigger lock:** Firing a unit locks further input until both a minimum transition gate (`460ms`, or `160ms` under reduced motion) elapses and the wheel stream stays quiet for `120ms`. At most one pending direction (`±1`) queues during lock.
- **Touch normalization:** Vertical swipes (`|dy| > |dx|`) trigger one unit at `>= 40px` travel or on a fast flick (`>= 18px` at `>= 0.35 px/ms`).

---

## 4. Color System & Measured WCAG 2.1 Contrast

The home page is **dark-first** (`#070707` panels) with a warm paper light mode (`#f6ece4` panels) defined in `assets/css/tokens.css`. Each section applies a subtle `--tone` wash (`#19241a` About, `#24140e` Run with the Wind, `#141d17` Running, `#151726` Art) to the left panel background and hairlines.

Warm orange (`#ff5a1f` dark / `#e04812` light) is reserved strictly for non-text UI indicators (active markers, runner dot, route progress, and `:focus-visible` outlines), never small body text.

### Dark Mode (`#070707` panel)

| CSS Property / Role | Foreground | Background | Ratio | WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` on `--panel-bg` | `#f2efe9` | `#070707` | **17.55:1** | AAA |
| `--text-secondary` on `--panel-bg` | `#b4b0a8` | `#070707` | **9.32:1** | AAA |
| `--text-muted` on `--panel-bg` | `#8d8982` | `#070707` | **5.79:1** | AA |
| `--accent-ui` on `--panel-bg` (non-text) | `#ff5a1f` | `#070707` | **6.46:1** | Pass (`>= 3:1`) |

### Light Mode (`#f6ece4` warm paper panel)

| CSS Property / Role | Foreground | Background | Ratio | WCAG 2.1 |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` on `--panel-bg` | `#121110` | `#f6ece4` | **16.20:1** | AAA |
| `--text-secondary` on `--panel-bg` | `#453f3a` | `#f6ece4` | **8.91:1** | AAA |
| `--text-muted` on `--panel-bg` | `#635a53` | `#f6ece4` | **5.78:1** | AA |
| `--accent-ui` on `--panel-bg` (non-text) | `#e04812` | `#f6ece4` | **3.53:1** | Pass (`>= 3:1`) |

---

## 5. Typography Scale

Two self-hosted Latin-subset WOFF2 variable fonts (`font-display: swap`, preloaded in `<head>`):

- **Grotesque (`Inter Tight` variable, `400–700`):** `assets/fonts/inter-tight-var-latin.woff2` (`43.8 KB`)
- **Monospace (`JetBrains Mono` variable, `400–500`):** `assets/fonts/jetbrains-mono-var-latin.woff2` (`30.7 KB`)

| Role | Font | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Section heading (`h1` / `h2`) | Inter Tight | `clamp(2.25rem, 4.1vw, 3.85rem)` | `600` | `1.02` | `-0.035em` |
| Course index numeral | Inter Tight | `clamp(2.5rem, 4.4vw, 3.75rem)` | `600` | `1.0` | `-0.04em` |
| Selector active row | Inter Tight | `clamp(0.95rem, 1.4vw, 1.15rem)` | `600` | `1.2` | `-0.01em` |
| Info value prose | Inter Tight | `0.96rem` (`15.4px`) | `400` | `1.55` | `0` |
| Selector neighbor rows | Inter Tight | `0.78rem` (`12.5px`) | `400` | `1.3` | `0` |
| Info labels, edge labels, controls | JetBrains Mono | `0.70–0.72rem` (`11.2–11.5px`) | `400` | `1.4` | `+0.06em` to `+0.10em` (uppercase) |

---

## 6. Components & States

- **Info Rows:** Two-column grid (`minmax(96px, 32%) 1fr`) separated by `1px` top hairlines, pairing uppercase monospace labels with grotesque values. Inline photography (`180×220` portrait, `10px` radius) sits within its `INFO` definition cell.
- **Section Wheel & Edge Labels:** Left edge displays `01..04`; right edge displays `ABOUT ME`, `PROJECT`, or `HOBBY`. Center-aligned item titles (`Namaste`, `Run with the Wind`, `Running`, `Art`) are separated between consecutive rows by `14px × 1px` horizontal bars with a center-outward opacity gradient.
- **Course Visual (`assets/js/course.js`):** Symmetric S-curve SVG (`viewBox="0 0 360 260"`) divided into three equal arc-length segments so progress aligns the runner marker precisely on each checkpoint (`01` through `04`). A background canvas renders subtle wind ribbons and sparse fluttering leaves in faded inverted theme ink.
- **Theme Toggle (`assets/js/mode.js`):** Single bottom-left control toggling between default dark and warm paper light mode, persisted under `localStorage` key `theme-mode` inside `try/catch`.

---

## 7. Motion & Reduced Motion

- **Single rAF loop (`assets/js/render-loop.js`):** Smooths `position` (`k = 6.8`) and `listMix` (`k = 6.2`) using frame-rate-independent exponential easing (`1 - Math.exp(-k * dt)`), automatically going idle once settled (`< 0.0006` delta). Animates strictly `transform`, `opacity`, and `clip-path`.
- **Info transitions:** Outgoing section fades/slides out (`240ms`); incoming section enters (`440ms`) with `40ms` per-row stagger.
- **`prefers-reduced-motion: reduce`:** Disables rAF tweening (states snap cleanly), disables the course wind/leaf canvas, replaces slide/stagger animations with a `150ms` opacity fade, and removes hover scale lifts.

---

## 8. Accessibility & Progressive Enhancement

- **No-JS fallback:** When `html.js` is absent, all four `<article>` sections render linearly with their `<picture>` elements above their info lists, the contact address displays as obfuscated plain text until JavaScript constructs the `mailto:` link, and all navigation links work natively.
- **Zero-flash upgrade:** A small synchronous inline `<head>` script adds `html.js` and applies any persisted `data-theme` before first paint, authorized via an exact SHA-256 CSP hash (see [Maintenance Guide](MAINTENANCE.md)).
- **Focus & live announcements:** Inactive info panels receive `inert` and `aria-hidden="true"`. Entering LIST focuses the active card link; opening a section moves focus to its heading (`tabindex="-1"`). An `aria-live="polite"` region announces section and browsing changes.
