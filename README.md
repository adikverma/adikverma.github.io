# adikverma.github.io

Minimal single-screen home page for Aditya Kumar Verma — plain HTML, CSS, and vanilla ES modules with zero frameworks, zero bundlers, zero npm dependencies, and zero third-party runtime requests.

## Local Preview & Verification

Serve locally with the zero-dependency Node static server (port `3000`) or Python:

```bash
npm run dev
# or: node server.mjs
# or: python3 -m http.server 3000
```

Run the static verification checks (JS syntax, byte budgets, forbidden strings, and outbound URL audit):

```bash
npm run lint
```

## Remaining Placeholders

| Placeholder / File | Location | Current Behavior | How to Resolve |
| :--- | :--- | :--- | :--- |
| `[[RESUME_PDF]]` | `/index.html` (`#resume-link`) | Pill stays `hidden` (neither disabled nor broken) | Add your PDF, replace `href="[[RESUME_PDF]]"` with `/assets/resume.pdf`, and remove the `hidden` attribute |
| Portrait placeholder | `/assets/img/me.webp` and `/assets/img/me.jpg` | Neutral warm-dark abstract gradient (`720×900`) | Replace both files with your portrait using the steps below |

## How to Add Your Portrait Photo

1. Choose a photo with a clean, uncluttered background.
2. Crop to a **4:5 vertical portrait** (e.g., `720×900` px) with your face centered horizontally and positioned slightly above vertical center (the arch frame uses `object-position: center 22%`).
3. **Strip all EXIF/GPS metadata** before committing, and export both WebP (`≤ 150 KB`) and JPG fallback:

```bash
# Using ImageMagick (strips all EXIF/GPS/IPTC metadata via -strip)
convert original.jpg -auto-orient -gravity center -crop 4:5 +repage -resize 720x900^ -extent 720x900 -strip -quality 84 assets/img/me.jpg
convert assets/img/me.jpg -strip -quality 82 assets/img/me.webp

# Or using exiftool + ffmpeg to strip metadata cleanly
exiftool -all= -overwrite_original assets/img/me.jpg
ffmpeg -y -i assets/img/me.jpg -map_metadata -1 -c:v libwebp -quality 82 assets/img/me.webp
```

4. Confirm `assets/img/me.webp` is `≤ 150 KB` and contains no metadata (`exiftool assets/img/me.webp`). No HTML changes are required once the two files are replaced.

## How to Add Your Resume PDF

1. Place your PDF at `/assets/resume.pdf` (or another path inside `/assets/`).
2. In `/index.html`, update `#resume-link`:
   - Change `href="[[RESUME_PDF]]"` to `href="/assets/resume.pdf"`.
   - Remove the `hidden` attribute.
3. **Privacy note:** This is a public repository and public website. Make sure the published resume PDF **does not contain your phone number or home street address**.

## Assumptions

- **Subpages not present in this workspace:** `/runwiththewind/`, `/runwiththewind/privacy/`, `/runwiththewind/callback/`, and `/.well-known/assetlinks.json` did not exist in this repository when starting this task (only the starter root files were present). The home page links cleanly to `/runwiththewind/` and keeps shared CSS tokens in `/assets/css/tokens.css` ready for those pages when merged.
- **No `.git` history in workspace:** This workspace container did not contain a `.git` directory, so changes could not be split into Git commits directly here.
- **Self-hosted fonts:** Latin-subset `Plus Jakarta Sans` variable (`26.7 KB`) and `Instrument Serif` italic (`21.6 KB`) WOFF2 files were downloaded and self-hosted under `/assets/fonts/` so the page makes zero third-party font or CDN requests at runtime.
- **Zero-404 portrait placeholder:** Neutral abstract gradient placeholder files are stored at `/assets/img/me.webp` (`3.6 KB`) and `/assets/img/me.jpg` (`8.6 KB`) with a matching CSS fallback gradient on `.portrait-arch`, preventing 404 console errors and layout shift until you drop in your real portrait.
- **OG image PNG:** Exported a `1200×630` PNG (`/assets/img/og-card.png`) alongside the SVG source (`/assets/img/og-card.svg`) using ImageMagick.