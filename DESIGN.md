# Design Specification — Split-Screen Home Page (`/index.html`)

This document specifies the layout grid, two-state machine, gesture normalization, color tokens and contrast measurements, typography scale, components, motion budget, and accessibility architecture for `/index.html`.

---

## 1. Layout Grid & Breakpoints

- **Outer frame:** `100dvh` fixed viewport (`overscroll-behavior: none`), `8px` outer padding (plus `env(safe-area-inset-*)`), `8px` gap between panels, `14px` corner radius on both panels, `1px` hairline panel borders.
- **Desktop (`≥ 900px`):** Two side-by-side panels (`grid-template-columns: 41.5% minmax(0, 1fr)`).
  - Left panel (`41.5%`): active section info page (independently scrollable) or the gentle running-course visual (in LIST state), with a single minimal theme toggle (`Light` with sun icon in default dark mode; `Dark` with half-moon icon in light mode).
  - Right panel (`58.5%`): full-bleed hero image or vertical card stack, top-right email link, left edge index (`01..04`), right edge category (`ABOUT` / `PROJECT` / `HOBBY`), dead-center scrolling item & bar meter, and bottom-center state hint (`SCROLL TO BROWSE` / `CLICK A CARD TO OPEN`).
- **Touch / Mobile & Tablet (`< 900px`):** Native scroll-linked sticky layout where the top showcase panel glides smoothly upward with the info section.
  - At rest in HERO, the top panel occupies `max(46dvh, 270px)` (`touch-action: none`) for swipe browsing while the info section flows naturally below inside the scrolling shell.
  - Scrolling down smoothly pushes the top panel upward pixel-for-pixel until its bottom `58px` pins at the top (`position: sticky`), cross-fading into a single-entry bar (e.g. `01 About — Aditya ▾`). Scrolling back up or tapping the bar smoothly glides it back open. In LIST state, the viewport locks to `100dvh` so cards and course stay framed.

**Rationale:** Keeping the viewport fixed on desktop isolates section browsing (right panel) from reading long-form metadata (left panel) while maintaining the exact same two-state mental model on touch screens.

---

## 2. Two-State Model

```
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

- **Deep linking:** Hash-only (`#about`, `#run-with-the-wind`, `#running`, `#art`) updated via `history.replaceState` when opening a section; `hashchange` opens the target section directly in HERO state. Unknown hashes resolve to `about`. LIST state is never stored in the URL.

---

## 3. Gesture Normalization & Lock Rules

- **Scope isolation:** Non-passive `wheel` and `touchmove` listeners attach **only** to `.panel-right`. Scrolling over `.panel-left` scrolls `.left-scroll` natively and never navigates. Keyboard navigation keys are ignored while focus is inside `.left-scroll`.
- **Wheel normalization:** Converts `deltaMode` (`0` = px, `1` = lines × 16, `2` = pages × `window.innerHeight`) into pixels, accumulates `deltaY` (resetting on direction reversal or 180 ms pause), and triggers **one unit** at `|accum| ≥ 40px`.
- **Anti-double-trigger lock:** Upon firing a unit, input locks until **both** a minimum transition gate (`460ms`, or `160ms` under reduced motion) passes **and** the wheel stream has been quiet for `120ms`. At most one pending direction (`±1`) is queued during lock and drained on release.
- **Touch normalization:** Vertical swipes (`|dy| > |dx|`) fire one unit at `≥ 40px` travel or on fast flick (`≥ 18px` and `≥ 0.35 px/ms`).

---

## 4. Tokens & Measured WCAG 2.1 Contrast Ratios

The home page is **dark-first** (`#070707` panels) with a warm paper **Invert** mode (`#f6ece4` panels). Each section supplies a subtle `--tone` tint (`#19241a` About, `#24140e` Run with the Wind, `#141d17` Running, `#151726` Art) blended softly into the left panel wash and hairlines.

Warm orange (`#ff5a1f` dark / `#e04812` light) is reserved strictly for non-text marks (active tick, runner dot, route progress, invert indicator dot, and `:focus-visible` outlines)—never small text.

### Dark Mode (`#070707` panel)
| Token / Role | Foreground | Background | Ratio | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` on `--panel-bg` | `#f2efe9` | `#070707` | **17.55:1** | AAA |
| `--text-secondary` on `--panel-bg` | `#b4b0a8` | `#070707` | **9.32:1** | AAA |
| `--text-muted` on `--panel-bg` | `#8d8982` | `#070707` | **5.79:1** | AA |
| `--accent-ui` on `--panel-bg` (UI marks) | `#ff5a1f` | `#070707` | **6.46:1** | Pass (≥ 3:1 UI) |

### Light / Invert Mode (`#f6ece4` warm paper panel)
| Token / Role | Foreground | Background | Ratio | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` on `--panel-bg` | `#121110` | `#f6ece4` | **16.20:1** | AAA |
| `--text-secondary` on `--panel-bg` | `#453f3a` | `#f6ece4` | **8.91:1** | AAA |
| `--text-muted` on `--panel-bg` | `#635a53` | `#f6ece4` | **5.78:1** | AA |
| `--accent-ui` on `--panel-bg` (UI marks) | `#e04812` | `#f6ece4` | **3.53:1** | Pass (≥ 3:1 UI) |

---

## 5. Typography Scale

Two self-hosted Latin-subset WOFF2 fonts (`font-display: swap`, preloaded):
- **Grotesque (`Inter Tight` variable, `400–700`):** `43.8 KB` (`/assets/fonts/inter-tight-var-latin.woff2`).
- **Monospace (`JetBrains Mono` variable, `400–500`):** `30.7 KB` (`/assets/fonts/jetbrains-mono-var-latin.woff2`).

| Role | Font | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Section heading (`h1` / `h2`) | Inter Tight | `clamp(2.25rem, 4.1vw, 3.85rem)` | `600` | `1.02` | `-0.035em` |
| Course index numeral | Inter Tight | `clamp(2.5rem, 4.4vw, 3.75rem)` | `600` | `1.0` | `-0.04em` |
| Selector current row | Inter Tight | `clamp(0.95rem, 1.4vw, 1.15rem)` | `600` | `1.2` | `-0.01em` |
| Info value prose | Inter Tight | `0.96rem` (`15.4px`) | `400` | `1.55` | `0` |
| Selector neighbor rows | Inter Tight | `0.78rem` (`12.5px`) | `400` | `1.3` | `0` |
| Info labels, edge labels, footer controls | JetBrains Mono | `0.70–0.72rem` (`11.2–11.5px`) | `400` | `1.4` | `+0.06em` to `+0.10em` (uppercase) |

---

## 6. Component Specifications & States

- **Info Rows:** Two-column grid (`minmax(96px, 32%) 1fr`), `1px` top hairline border, mono uppercase label left, grotesque value right. Portrait (`180×220`, `10px` radius) and race photo (`10px` radius) sit inline within their `INFO` values.
- **Unified Moving Item Meter & Extreme Edge Labels:** Left extreme edge displays `01..04`; right extreme edge displays `NAMASTE` / `PROJECT` / `HOBBY`. Dead-center sits the vertical item wheel (`About Me`, `Run with the Wind`, `Running`, `Art`) separated by horizontal bars whose width (`26px → 5px`) and opacity fall off monotonically from the center toward the outer top/bottom ends of the visible meter. Entering scroll (LIST) mode pulls items and bars closer vertically and increases visibility while keeping the center item crisp bold white.
- **Bottom Scroll-Panel Hint:** Centered mono label at the bottom of the right/scroll panel switching between `SCROLL TO BROWSE` (HERO) and `CLICK A CARD TO OPEN` (LIST).
- **Sticky Compact Touch Bar & Fixed Slim Footer (`< 900px`):** `.panel-left` enforces `min-height: calc(100dvh - 74px)` so even short info pages scroll smoothly all the way to full header collapse. As `.panel-right` collapses into its pinned `58px` compact bar (`01  Namaste — About Me  ▾`), the background image fades completely to zero (`opacity: 0`) over solid `--panel-bg`. The `36px` Light/Dark footer stays fixed at the bottom of the viewport so it is always accessible without scrolling.
- **Cards & Project Button Icon:** Full-bleed in HERO (`clip-path: inset(0%)`) with balanced portrait framing (`50% 42%` About Me, `50% 80%` Running). The `Run with the Wind` heading stays clean and uncluttered while its `24×24` circular app icon sits directly inside the `Project page ↗` button.
- **Single Light / Dark Toggle:** Dark is the default. A single minimal bottom-left mono button shows the opposite option: minimal sun icon + `Light` in dark mode, swapping to a half-moon icon + `Dark` in light mode, persisted to `localStorage`.
- **Course Piece:** Moderately curved symmetric S-curve SVG (`viewBox 0 0 340 260`, `50px` gentle meander) with three identical-arc-length segments so piecewise progress lands the runner dot dead-center on every circular checkpoint (`01 ABOUT ME`, `02 RUN WITH THE WIND`, `03 RUNNING`, `04 ART`). Every passed checkpoint highlights orange and unmarks cleanly when moving back.

---

## 7. Motion & Reduced Motion

- **Single rAF loop (`render-loop.js`):** Smooths `position` (`k = 6.8`) and `listMix` (`k = 6.2`) using frame-rate-independent exponential easing (`1 - Math.exp(-k * dt)`), sleeping automatically once settled (`< 0.0006` delta). Animates strictly `transform`, `opacity`, and `clip-path`.
- **Info transitions:** Outgoing section fades/slides out (`240ms`), incoming section fades/slides in (`440ms`) with `40ms` per-row stagger.
- **`prefers-reduced-motion: reduce`:** Disables rAF tweening (states snap cleanly), disables course wind canvas, replaces slide/stagger transitions with a plain `150ms` opacity fade, and removes hover scale lifts.

---

## 8. Accessibility & Progressive Enhancement

- **No-JS linear document:** Without JS (`html:not(.js)`), all four `<article>` sections render linearly with their `<picture>` above their info list, email displays as `adityakumarv333 [at] gmail [dot] com`, and all links work normally.
- **Zero-flash upgrade:** A tiny synchronous inline `<head>` script adds `html.js` and persisted `data-theme` before first paint (authorized by exact SHA-256 CSP hash).
- **Focus & announcements:** Inactive info pages receive `inert` and `aria-hidden="true"`. Entering LIST focuses the active card link; opening a section moves focus to its heading (`tabindex="-1"`). An `aria-live="polite"` region announces `"Showing: <title>"` and `"Browsing sections, X of 4"`.
