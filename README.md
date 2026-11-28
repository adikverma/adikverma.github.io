# adikverma.github.io

Split-screen info + sections home page for Aditya Kumar Verma — plain HTML, CSS, and vanilla ES modules with zero frameworks, zero bundlers, zero npm runtime dependencies, and zero third-party runtime requests. Built to serve directly from the repository root on GitHub Pages (`https://adikverma.github.io/`).

## Local Preview & Verification

Serve locally with Python or Node:

```bash
python3 -m http.server 3000
# or: npm run dev (runs zero-dependency node server.mjs on port 3000)
```

Run static checks (JS syntax, uncompressed byte budgets, CSP SHA-256 hash verification, forbidden strings, and outbound URL audit):

```bash
npm run lint
```

## Remaining Placeholders

| Placeholder / File | Location | Current State | How to Resolve |
| :--- | :--- | :--- | :--- |
| `[[ART_INFO]]` | `/index.html` (`#art` → `[data-placeholder="art-info"]`) | Row stays `hidden` while unresolved | Replace `[[ART_INFO]]` with your text and remove the `hidden` attribute |
| `run-with-the-wind.webp` (+ `-sm`) | `/assets/img/sections/` | Atmospheric dark ember gradient placeholder | Replace with a real Run with the Wind watch/phone photo |
| `art.webp` (+ `-sm`) | `/assets/img/sections/` | Atmospheric indigo-slate gradient placeholder | Replace with artwork photography |
| Resume PDF (optional) | Not linked yet | Omitted until ready | Add `/assets/resume.pdf` (ensure **no phone number or home address** is in the PDF) and add a row under `#about` |

*(Already populated from your uploaded assets: portrait `/assets/img/me.webp`, About illustration `/assets/img/sections/about.webp`, Run with the Wind logo `/assets/img/run-with-the-wind-logo.webp`, Running background `/assets/img/sections/running.webp`, and Running info photo `/assets/img/running-race.webp`.)*

## Editing Content

All copy lives directly in `/index.html` inside the four `<article>` elements (`#about`, `#run-with-the-wind`, `#running`, `#art`). JavaScript reads `data-category`, `data-title`, `data-edge`, `data-focus`, and `data-tone` from each `<article>`.

- Update section framing by editing `data-focus="50% 28%"` (`object-position`) and `data-tone="#19241a"` (left-panel wash tint).
- To add or edit rows, copy an existing `.info-row` (`<dt class="info-label">` + `<dd class="info-value">`).

## Replacing Images & Stripping Metadata

Target `≤ 220 KB` WebP for desktop section backgrounds (`1200–2400 px` wide) and a `960 px` wide `-sm.webp` mobile variant. Always strip **all** EXIF/GPS metadata before committing:

```bash
# Section background (large + 960px mobile variant, all EXIF/GPS stripped)
convert source.jpg -auto-orient -resize "2400x1800>" -strip -quality 85 /tmp/lg.jpg
ffmpeg -y -i /tmp/lg.jpg -map_metadata -1 -c:v libwebp -compression_level 6 -quality 76 assets/img/sections/<name>.webp

convert source.jpg -auto-orient -resize 960x -strip -quality 84 /tmp/sm.jpg
ffmpeg -y -i /tmp/sm.jpg -map_metadata -1 -c:v libwebp -compression_level 6 -quality 74 assets/img/sections/<name>-sm.webp

# Portrait (360x440 for 180x220 2x display)
convert portrait.jpg -auto-orient -gravity north -resize 360x440^ -extent 360x440 -strip -quality 86 assets/img/me.jpg
ffmpeg -y -i assets/img/me.jpg -map_metadata -1 -c:v libwebp -quality 84 assets/img/me.webp
```

## Cache-Busting Procedure (GitHub Pages)

GitHub Pages caches static assets for ~10 minutes without custom `Cache-Control` headers. After modifying CSS, JS, fonts, or images:

1. Replace the query string `?v=YYYYMMDD` across `/index.html`, `/404.html`, and `/assets/css/home.css` with today's date (e.g., `?v=20261201`).
2. Run `npm run lint` to confirm all assets and CSP checks pass.

## Recomputing the Inline Script CSP Hash

`/index.html` enforces a strict `<meta http-equiv="Content-Security-Policy">` (`style-src 'self'; script-src 'self' 'sha256-...'`). If you ever edit the tiny inline `<head>` script, recompute its SHA-256 hash using `openssl` on the exact bytes between `<script>` and `</script>`:

```bash
printf "%s" "(function(){var d=document.documentElement;d.classList.add('js');try{var m=localStorage.getItem('theme-mode');if(m==='dark'||m==='light')d.setAttribute('data-theme',m);}catch(e){}})();" \
  | openssl dgst -sha256 -binary | openssl base64
```

Paste the resulting base64 string into `script-src 'self' 'sha256-<HASH>'` in `/index.html`, then run `npm run lint` (which validates the hash automatically).

## GitHub Pages Deploy Check

1. Ensure `.nojekyll`, `robots.txt`, `sitemap.xml`, `404.html`, and `index.html` live at the repository root of the default branch (`main`).
2. Confirm every asset filename is lowercase kebab-case and referenced via root-relative `/assets/...` paths.
3. Verify `https://adikverma.github.io/`, `https://adikverma.github.io/#running`, and `https://adikverma.github.io/.well-known/assetlinks.json` serve with zero console or CSP errors.

## Assumptions

- **Existing subpages not present in this workspace:** `/runwiththewind/`, `/runwiththewind/privacy/`, `/runwiththewind/callback/`, and `/.well-known/assetlinks.json` were not present in this workspace container (the workspace started with only `README.md`), so their files could not be edited here; `/index.html` links directly to `/runwiththewind/` and preserves shared tokens in `/assets/css/tokens.css`.
- **No `.git` directory in workspace:** The workspace container is not a Git repository, so changes could not be recorded as separate Git commits directly here.
- **Uploaded images integrated directly:** Processed, renamed, resized, and EXIF-stripped your uploaded images into `/assets/img/me.webp`, `/assets/img/sections/about.webp`, `/assets/img/sections/running.webp`, `/assets/img/running-race.webp`, and `/assets/img/run-with-the-wind-logo.webp`. Raw reference screenshots and unstripped uploads under `public/` were removed.
- **Self-hosted fonts:** Fetched and self-hosted Latin-subset `Inter Tight` variable (`43.8 KB`) and `JetBrains Mono` variable (`30.7 KB`) WOFF2 files under `/assets/fonts/` for zero third-party requests.
- **Local dev server kept zero-dependency:** `server.mjs` and `scripts/check.mjs` use Node.js built-ins only (`package.json` has zero runtime or dev dependencies) so local preview works cleanly while GitHub Pages ignores them and serves static files directly.

---

## Product page (`/runwiththewind/`)

The Run with the Wind product site lives under `/runwiththewind/` with its own standalone stylesheet (`/assets/css/product.css`), vanilla ES modules (`/assets/js/product/*.js`), and design documentation (`/DESIGN-PRODUCT.md`).

### Routes
- `/runwiththewind/` — Product landing page template (hero, features grid, how it works, screens gallery, dev log, under the hood, FAQ, formal About & Connect section, footer).
- `/runwiththewind/privacy/` — Crawlable, indexable Privacy Policy (included in `sitemap.xml`, dated `November 28, 2026`, contact `runwiththewind.app@gmail.com`).
- `/runwiththewind/callback/` — Calm, zero-script (`script-src 'none'`), `noindex,nofollow`, `no-referrer` OAuth App Links fallback page (excluded from `sitemap.xml` and disallowed in `robots.txt`).
- `/.well-known/assetlinks.json` — Android App Links verification file served as `application/json`.

### Remaining Product Placeholders to Fill Before Launch

| Placeholder / Asset | File(s) | Current Behavior | How to Resolve |
| :--- | :--- | :--- | :--- |
| `[[APP_REPO_URL]]` | `/runwiththewind/index.html` (Hero) | "Source on GitHub ↗" link stays `hidden` while unresolved (kept hidden while `Adikverma/RunWithTheWind` is private) | Once public, replace both `href` and `data-optional-url` with `https://github.com/Adikverma/RunWithTheWind` and remove `hidden` |
| `[[YYYY-MM]]` | `/runwiththewind/index.html` (`#dev-log`) | `<time>` tags stay `hidden` while unresolved | Replace `datetime` and text content with real `YYYY-MM` dates and remove `hidden` |
| `screen-01.webp` … `screen-05.webp` | `/runwiththewind/index.html` (`#screens`) | Inline SVG previews labeled `Illustrative` | Capture device screenshots, strip metadata, save under `/assets/img/product/screens/`, swap `<svg>` for `<img>`, and remove the `Illustrative` caption tag |

*(Already populated: Android App Links identity in `/.well-known/assetlinks.json` for `io.github.adikverma.runwiththewind`, product email `runwiththewind.app@gmail.com` via split `data-contact-email` attributes, Privacy Policy date `November 28, 2026`, and Strava upload marked `Available`.)*

### Adding Real Screenshots & Stripping EXIF/GPS Metadata

Always strip all EXIF, GPS, and device metadata before committing screenshots (target `≤ 180 KB` WebP at `600×750` or native device aspect ratio):

```bash
mkdir -p assets/img/product/screens
convert raw-screen-01.png -auto-orient -resize "900x1200>" -strip -quality 88 /tmp/s1.png
ffmpeg -y -i /tmp/s1.png -map_metadata -1 -c:v libwebp -compression_level 6 -quality 80 assets/img/product/screens/screen-01.webp
```

### Adding Official Strava Brand Assets Later

No unofficial or hand-drawn Strava logos are included. Official-asset slots are marked with HTML comments (`<!-- Official Strava brand assets slot ... -->`) in `/runwiththewind/index.html` (Features "Upload to Strava" card and Step 3 "Upload to Strava"). Download approved "Connect with Strava" / "Powered by Strava" assets from the Strava Brand Guidelines, place them under `/assets/img/product/`, and follow Strava's clear-space and attribution rules.

### Updating Feature Status Badges

To change any feature's status in `/runwiththewind/index.html`, edit the single `.status-badge` element (its `data-status` attribute and visible text):

```html
<span class="status-badge" data-status="available">Available</span>
<span class="status-badge" data-status="in-progress">In progress</span>
<span class="status-badge" data-status="planned">Planned</span>
```

## Android App Links

`/.well-known/assetlinks.json` proves to Android that `https://adikverma.github.io` authorizes the `io.github.adikverma.runwiththewind` app to handle matching HTTPS links directly. This allows OAuth redirects to `/runwiththewind/callback/` to open straight inside the Android app without a disambiguation dialog (and `.nojekyll` at the repository root ensures GitHub Pages serves the `.well-known/` dot-folder directly).

### Android `AndroidManifest.xml` Intent Filter (for the Android app)

Add this intent filter to the callback activity in the Android app repository (do not add it to this website repo):

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

### Fingerprint Source & Keystore Reminder

The current SHA-256 fingerprint (`70:AF:44:32:1D:58:BA:B5:E0:36:F6:35:5A:9C:89:87:39:13:0A:81:A6:AF:99:E3:6F:58:06:56:54:7B:92:4D`) was obtained from the debug variant output of:

```bash
./gradlew signingReport
```

Because both debug and current release builds sign with that debug key, only this single fingerprint is listed right now. The debug keystore lives at `~/.android/debug.keystore` on your build machine—back it up securely, because building on a different machine generates a different keystore and SHA-256 fingerprint that must also be added here.

### Adding More Fingerprints Later

When you introduce a dedicated release keystore or enroll in Google Play App Signing (copying the SHA-256 certificate fingerprint from Play Console → *App integrity*), append the new uppercase colon-separated SHA-256 string as an additional entry in the `sha256_cert_fingerprints` array in `/.well-known/assetlinks.json`. **Never delete a currently working fingerprint until the new one has been deployed and verified.**

### Post-Deploy Verification

> **Cache note:** GitHub Pages caches static files for roughly **10 minutes**, so wait before re-testing after pushing changes to `/.well-known/assetlinks.json`.

1. **Direct fetch (must return HTTP `200`, `application/json`, and no redirect):**
   ```
   https://adikverma.github.io/.well-known/assetlinks.json
   ```
2. **Google Digital Asset Links statement check:**
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://adikverma.github.io&relation=delegate_permission/common.handle_all_urls
   ```
3. **On a connected Android 12+ device (expect `verified` for `adikverma.github.io` once the intent filter exists in the app):**
   ```bash
   adb shell pm get-app-links io.github.adikverma.runwiththewind
   ```

### Privacy Policy Note

`/runwiththewind/privacy/index.html` is a plain-language template reflecting the described app architecture and is **not legal advice**. Before distributing the app or submitting to Google Play / Strava API review, verify that every statement accurately matches the app's final runtime behavior.

### Product Page Assumptions

- **Repository link kept hidden while private:** `https://github.com/Adikverma/RunWithTheWind` returned HTTP `404` when checked (appears private), so the hero's "Source on GitHub ↗" button remains hidden via `[[APP_REPO_URL]]` to avoid a broken public link.
- **Self-hosted product fonts:** Fetched and self-hosted SIL OFL Latin-subset `Barlow Condensed` (600 & 700) and `Plus Jakarta Sans` (variable 400–700) under `/assets/fonts/` (all `≤ 28 KB` each) for zero third-party requests.
- **No `.git` repository in workspace:** Changes could not be split into Git commits inside this workspace container.

### Pre-Publish Checklist (Product Page)

1. Run `grep -R "\[\[" .` and confirm every remaining placeholder is either resolved or intentionally deferred.
2. Bump `?v=YYYYMMDD` on changed product CSS, JS, favicon, and OG image references across `/runwiththewind/**/*.html` and `/assets/css/product.css`.
3. Run `npm run lint` and verify zero errors, valid `assetlinks.json`, passing CSP hashes, and expected outbound URLs only.
4. Confirm `/runwiththewind/callback/?code=test` returns HTTP `200` with zero scripts, `noindex,nofollow`, and `no-referrer`.
5. Verify `/.well-known/assetlinks.json` returns HTTP `200` (`application/json`) and passes Digital Asset Links verification.