# adikverma.github.io

Personal portfolio site for Aditya Kumar Verma and product website for **Run with the Wind**, a Wear OS and Android run tracker.

**Live site:** [https://adikverma.github.io/](https://adikverma.github.io/)

## Overview

The site is built with plain HTML, CSS, and vanilla ES modules—no frameworks, no bundlers, no runtime npm dependencies, and no third-party network requests, analytics, or cookies. All fonts and media assets are self-hosted, and every HTML page enforces a strict Content Security Policy.

### Routes

| Route | Purpose |
| :--- | :--- |
| `/` | Split-screen portfolio home page (About, Run with the Wind, Running, Art) |
| `/runwiththewind/` | Product page for Run with the Wind (Wear OS & Android run tracker) |
| `/runwiththewind/privacy/` | Privacy policy for Run with the Wind |
| `/runwiththewind/callback/` | Static, zero-script OAuth App Links fallback page (`noindex,nofollow`) |
| `/.well-known/assetlinks.json` | Android App Links verification file for `io.github.adikverma.runwiththewind` |
| `/404.html` | Custom not-found page |

## Repository Layout

```text
.
├── index.html                        Portfolio home page
├── 404.html                          Custom 404 page
├── robots.txt                        Crawler directives (disallows OAuth callback)
├── sitemap.xml                       Public page sitemap
├── .nojekyll                         Disables Jekyll so .well-known/ is served directly
├── .well-known/
│   └── assetlinks.json               Android App Links verification JSON
├── runwiththewind/
│   ├── index.html                    Run with the Wind product page
│   ├── privacy/index.html            Privacy policy
│   └── callback/index.html           OAuth callback fallback (script-src 'none')
├── assets/
│   ├── css/                          Stylesheets (home, error, standalone product CSS)
│   ├── fonts/                        Self-hosted Latin-subset WOFF2 fonts
│   ├── img/                          Favicons, Open Graph cards, WebP/JPEG media
│   └── js/                           Vanilla ES modules (home and product/)
├── docs/
│   ├── DESIGN.md                     Portfolio design specification
│   ├── DESIGN-PRODUCT.md             Product page design specification
│   └── MAINTENANCE.md                Editing, image prep, CSP, cache-busting & App Links
├── scripts/
│   └── check.mjs                     Static lint, budget, CSP hash & schema checks
└── server.mjs                        Zero-dependency local preview server (Node.js)
```

## Local Preview & Checks

Requires Node.js (built-in modules only; no packages to install):

```bash
npm run dev      # Serves the site locally on http://localhost:3000
npm run lint     # Validates JS syntax, asset byte budgets, CSP hashes, App Links JSON & URLs
```

Alternatively, any static file server (such as `python3 -m http.server 3000`) serves the repository root directly.

## Deployment

GitHub Pages serves directly from the repository root with `.nojekyll` enabled so dot-directories such as `.well-known/` are published without transformation. Static assets use `?v=YYYYMMDD` query parameters for cache-busting across GitHub Pages' ~10-minute default cache window.

## Documentation

- [Portfolio Design Specification](docs/DESIGN.md) — layout grid, two-state navigation model, gesture normalization, contrast ratios, typography, and motion rules for `/`.
- [Product Page Design Specification](docs/DESIGN-PRODUCT.md) — standalone visual identity, color system, contrast ratios, typography, and component layout for `/runwiththewind/`.
- [Maintenance Guide](docs/MAINTENANCE.md) — content editing recipes, image optimization and EXIF stripping, cache-busting, CSP SHA-256 hash updates, and Android App Links verification.