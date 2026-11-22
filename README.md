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