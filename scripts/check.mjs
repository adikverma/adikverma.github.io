import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_JS_BYTES = 12 * 1024;
const MAX_CSS_BYTES = 20 * 1024;
const MAX_SANS_FONT_BYTES = 45 * 1024;
const MAX_SERIF_FONT_BYTES = 25 * 1024;
const MAX_PHOTO_WEBP_BYTES = 150 * 1024;

const FORBIDDEN_PATTERNS = [
  /edit\s+site/i,
  /personal\s+site/i,
  /welcome\s+to\s+my\s+site/i,
  /selected\s+work/i,
  /notes\s*&\s*writing/i,
  /add\s+project/i,
  /open\s+to\s+work/i,
  /adityakumarv333@gmail\.com/i,
];

let failed = false;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

async function listFiles(dir, ext) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => path.join(dir, e.name));
}

const jsFiles = await listFiles(path.join(ROOT, 'assets/js'), '.js');
let totalJs = 0;
for (const file of jsFiles) {
  const stat = await fs.stat(file);
  totalJs += stat.size;
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    fail(`JS syntax error in ${path.relative(ROOT, file)}: ${err.message}`);
  }
}
if (totalJs > MAX_JS_BYTES) {
  fail(`Total JS ${totalJs} B exceeds ${MAX_JS_BYTES} B limit`);
}

const cssFiles = await listFiles(path.join(ROOT, 'assets/css'), '.css');
let totalCss = 0;
for (const file of cssFiles) {
  totalCss += (await fs.stat(file)).size;
}
if (totalCss > MAX_CSS_BYTES) {
  fail(`Total CSS ${totalCss} B exceeds ${MAX_CSS_BYTES} B limit`);
}

const sansFont = await fs.stat(path.join(ROOT, 'assets/fonts/plus-jakarta-sans-var-latin.woff2'));
if (sansFont.size > MAX_SANS_FONT_BYTES) {
  fail(`Sans font ${sansFont.size} B exceeds ${MAX_SANS_FONT_BYTES} B`);
}

const serifFont = await fs.stat(path.join(ROOT, 'assets/fonts/instrument-serif-italic-latin.woff2'));
if (serifFont.size > MAX_SERIF_FONT_BYTES) {
  fail(`Serif font ${serifFont.size} B exceeds ${MAX_SERIF_FONT_BYTES} B`);
}

const photoWebp = await fs.stat(path.join(ROOT, 'assets/img/me.webp'));
if (photoWebp.size > MAX_PHOTO_WEBP_BYTES) {
  fail(`Photo WebP ${photoWebp.size} B exceeds ${MAX_PHOTO_WEBP_BYTES} B`);
}

const checkTextFiles = [path.join(ROOT, 'index.html'), ...cssFiles, ...jsFiles];
const urls = new Set();

for (const file of checkTextFiles) {
  const text = await fs.readFile(file, 'utf8');
  for (const rx of FORBIDDEN_PATTERNS) {
    if (rx.test(text)) {
      fail(`Forbidden pattern ${rx} matched in ${path.relative(ROOT, file)}`);
    }
  }
  const matches = text.match(/https?:\/\/[^\s"'<>)]+/g);
  if (matches) {
    for (const url of matches) {
      urls.add(`${path.relative(ROOT, file)}: ${url}`);
    }
  }
}

console.log(`JS total: ${totalJs} B / ${MAX_JS_BYTES} B (${jsFiles.length} files)`);
console.log(`CSS total: ${totalCss} B / ${MAX_CSS_BYTES} B (${cssFiles.length} files)`);
console.log(`Sans WOFF2: ${sansFont.size} B / ${MAX_SANS_FONT_BYTES} B`);
console.log(`Serif WOFF2: ${serifFont.size} B / ${MAX_SERIF_FONT_BYTES} B`);
console.log(`Photo WebP: ${photoWebp.size} B / ${MAX_PHOTO_WEBP_BYTES} B`);
console.log(`URLs found (${urls.size}):`);
for (const entry of urls) {
  console.log(`  - ${entry}`);
}

if (failed) {
  process.exit(1);
}
console.log('All static checks passed.');
