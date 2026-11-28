# Maintenance Guide

Operational procedures for editing content, preparing media assets, managing cache-busting and CSP hashes, maintaining Android App Links, and validating changes before deployment. See [README](../README.md), [Portfolio Design Spec](DESIGN.md), and [Product Page Design Spec](DESIGN-PRODUCT.md) for architecture details.

---

## 1. Editing Content

All copy lives directly in static HTML (no external CMS or JSON content files).

### Portfolio Home Page (`index.html`)

Content sits inside four `<article>` elements (`#about`, `#run-with-the-wind`, `#running`, `#art`). JavaScript reads `data-category`, `data-title`, `data-edge`, `data-focus`, and `data-tone` from each `<article>`.

- Adjust image focal points by changing `data-focus="50% 42%"` (`object-position`) and left-panel washes by changing `data-tone`.
- Add metadata entries by copying an existing `.info-row` (`<dt class="info-label">` + `<dd class="info-value">`).

### Run with the Wind Product Page (`runwiththewind/index.html`)

- **Add a core feature pillar:** Copy an `<article class="feat-pillar">` inside `#features .feat-pillars`.
- **Add a roadmap item:** Copy an `<li class="roadmap-item">` inside `#features .roadmap-list`.
- **Add a dev-log entry:** Prepend an `<article class="log-entry">` at the top of `#dev-log .log-list` (newest first):
  ```html
  <article class="log-entry">
    <div class="log-meta tabular">
      <time datetime="2026-12">2026-12</time>
      <span class="status-badge" data-status="available">Available</span>
    </div>
    <div>
      <h3 class="log-title">Milestone title</h3>
      <p class="log-body">Short factual summary of the milestone.</p>
    </div>
  </article>
  ```
  Supported `data-status` values: `available`, `in-progress`, `planned`.
- **Replace an illustrative screen preview:** Inside `#screens .screen-track`, replace the `<svg>...</svg>` inside `.screen-frame` with an `<img>` (`width="600" height="750" loading="lazy" decoding="async"`) pointing to `/assets/img/product/screens/screen-01.webp?v=YYYYMMDD`, and remove `<span class="screen-illus">Illustrative</span>` from its `<figcaption>`.
- **Add an FAQ entry:** Append a `<details class="faq-item">` inside `#faq .faq-list`.
- **Strava brand assets:** Commented slots (`<!-- Official Strava brand assets slot ... -->`) mark where approved Strava brand badges may be inserted in accordance with Strava Brand Guidelines.

---

## 2. Image Optimization & Metadata Stripping

Strip all EXIF, GPS, and camera metadata from images before committing. Target `<= 220 KB` WebP for portfolio section backgrounds (`1200–2400 px` desktop, `960 px` `-sm.webp` mobile) and `<= 180 KB` WebP for product screenshots.

```bash
# Portfolio section background (desktop + 960px mobile variant)
convert source.jpg -auto-orient -resize "2400x1800>" -strip -quality 85 /tmp/lg.jpg
ffmpeg -y -i /tmp/lg.jpg -map_metadata -1 -c:v libwebp -compression_level 6 -quality 76 assets/img/sections/<name>.webp

convert source.jpg -auto-orient -resize 960x -strip -quality 84 /tmp/sm.jpg
ffmpeg -y -i /tmp/sm.jpg -map_metadata -1 -c:v libwebp -compression_level 6 -quality 74 assets/img/sections/<name>-sm.webp

# Portrait (360x440 for 180x220 2x display)
convert portrait.jpg -auto-orient -gravity north -resize 360x440^ -extent 360x440 -strip -quality 86 assets/img/me.jpg
ffmpeg -y -i assets/img/me.jpg -map_metadata -1 -c:v libwebp -quality 84 assets/img/me.webp

# Product screen screenshot (WebP, metadata stripped)
mkdir -p assets/img/product/screens
convert raw-screen.png -auto-orient -resize "900x1200>" -strip -quality 88 /tmp/s1.png
ffmpeg -y -i /tmp/s1.png -map_metadata -1 -c:v libwebp -compression_level 6 -quality 80 assets/img/product/screens/screen-01.webp
```

---

## 3. Cache-Busting (GitHub Pages)

GitHub Pages caches static files for roughly 10 minutes without custom `Cache-Control` headers. Whenever CSS, JS, fonts, favicons, or images change:

1. Bump the `?v=YYYYMMDD` query string on modified asset references across the relevant HTML and CSS files (`index.html`, `404.html`, `assets/css/home.css`, `runwiththewind/**/*.html`, `assets/css/product.css`).
2. Run `npm run lint` to verify budgets, syntax, and CSP hashes.

---

## 4. Content Security Policy (CSP) Hashes

Each HTML page enforces a `<meta http-equiv="Content-Security-Policy">` header prohibiting inline styles (`style-src 'self'`) and inline event handlers.

- `index.html`, `runwiththewind/index.html`, and `runwiththewind/privacy/index.html` allow a single synchronous `<head>` theme-bootstrap script via an exact SHA-256 hash (`script-src 'self' 'sha256-...'`).
- `runwiththewind/callback/index.html` enforces `script-src 'none'`, `noindex,nofollow`, and `no-referrer`.

If the inline `<head>` script is ever edited, recompute its SHA-256 digest over the exact bytes between `<script>` and `</script>`:

```bash
# Portfolio home page (index.html)
printf "%s" "(function(){var d=document.documentElement;d.classList.add('js');try{var m=localStorage.getItem('theme-mode');if(m==='dark'||m==='light')d.setAttribute('data-theme',m);}catch(e){}})();" \
  | openssl dgst -sha256 -binary | openssl base64

# Product & privacy pages (runwiththewind/index.html, runwiththewind/privacy/index.html)
printf "%s" "(function(){var d=document.documentElement;d.classList.add('js');try{var m=localStorage.getItem('rwt-theme');if(m==='dark'||m==='light')d.setAttribute('data-theme',m);}catch(e){}})();" \
  | openssl dgst -sha256 -binary | openssl base64
```

Paste the resulting base64 hash into `script-src 'self' 'sha256-<HASH>'` and run `npm run lint` to confirm verification passes.

---

## 5. Android App Links (`.well-known/assetlinks.json`)

`.well-known/assetlinks.json` proves to Android that `https://adikverma.github.io` authorizes `io.github.adikverma.runwiththewind` to open matching HTTPS links directly. This allows OAuth redirects targeting `/runwiththewind/callback/` to hand off cleanly to the Android app without a disambiguation dialog, while `.nojekyll` at the repository root ensures GitHub Pages serves the `.well-known/` directory directly.

### Corresponding Android Intent Filter

The Android application declares this verified intent filter on its callback activity:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
    android:scheme="https"
    android:host="adikverma.github.io"
    android:pathPrefix="/runwiththewind/callback/" />
</intent-filter>
```

### Managing Signing Fingerprints

- Certificate SHA-256 fingerprints are obtained from `./gradlew signingReport` (or from Google Play Console under *App integrity* when Play App Signing is enabled).
- To add another signing certificate later (for example, a dedicated release key or Play App Signing key), append the uppercase colon-separated SHA-256 fingerprint as an additional entry in the `sha256_cert_fingerprints` array. Keep any currently active fingerprint in the array until the replacement has been deployed and verified.
- `npm run lint` validates that `.nojekyll` exists, `.well-known/assetlinks.json` parses as valid JSON, the relation, namespace, and package name match, and every entry matches `^([0-9A-F]{2}:){31}[0-9A-F]{2}$`.

### Post-Deploy Verification

GitHub Pages caches static assets for roughly 10 minutes; wait after pushing before re-testing.

1. Confirm direct JSON delivery (`HTTP 200`, `Content-Type: application/json`, no redirect):
   ```text
   https://adikverma.github.io/.well-known/assetlinks.json
   ```
2. Query Google's Digital Asset Links API:
   ```text
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://adikverma.github.io&relation=delegate_permission/common.handle_all_urls
   ```
3. Verify host status on an Android 12+ test device (expect `verified` once the intent filter is present in the installed app):
   ```bash
   adb shell pm get-app-links io.github.adikverma.runwiththewind
   ```

---

## 6. Pre-Publish Validation

Run the static verification suite before pushing:

```bash
npm run lint
```

Confirm:
- All byte budgets pass (home JS `<= 22 KB`, product JS `<= 22 KB`, home CSS `<= 28 KB`, product CSS `<= 30 KB`, each WOFF2 font `<= 45 KB`, each section WebP `<= 220 KB`).
- Every HTML page passes inline-style, inline-handler, and CSP SHA-256 verification.
- `/runwiththewind/callback/` serves with `script-src 'none'`, `noindex,nofollow`, and `no-referrer`.
- `sitemap.xml` includes `/`, `/runwiththewind/`, and `/runwiththewind/privacy/`, and excludes `/runwiththewind/callback/`.
- `robots.txt` disallows `/runwiththewind/callback/`.
- Outbound URLs printed by `npm run lint` contain only expected first-party and documented external links.
