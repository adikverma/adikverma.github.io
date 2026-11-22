import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_JS_BYTES = 22 * 1024;
const MAX_CSS_BYTES = 28 * 1024;
const MAX_FONT_BYTES = 45 * 1024;
const MAX_SECTION_IMG_BYTES = 220 * 1024;

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

// 1. JS syntax + budget
const jsFiles = await listFiles(path.join(ROOT, 'assets/js'), '.js');
let totalJs = 0;
for (const file of jsFiles) {
  totalJs += (await fs.stat(file)).size;
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    fail(`JS syntax error in ${path.relative(ROOT, file)}: ${err.message}`);
  }
}
if (totalJs > MAX_JS_BYTES) fail(`Total JS ${totalJs} B exceeds ${MAX_JS_BYTES} B`);

// 2. CSS budget (tokens.css + home.css)
const homeCssFiles = ['tokens.css', 'home.css'].map((f) => path.join(ROOT, 'assets/css', f));
let totalCss = 0;
for (const file of homeCssFiles) {
  totalCss += (await fs.stat(file)).size;
}
if (totalCss > MAX_CSS_BYTES) fail(`Total CSS ${totalCss} B exceeds ${MAX_CSS_BYTES} B`);

// 3. Fonts budget
const fontFiles = await listFiles(path.join(ROOT, 'assets/fonts'), '.woff2');
for (const file of fontFiles) {
  const size = (await fs.stat(file)).size;
  if (size > MAX_FONT_BYTES) fail(`Font ${path.basename(file)} is ${size} B > ${MAX_FONT_BYTES} B`);
}

// 4. Section image budgets
const sectionImgs = await listFiles(path.join(ROOT, 'assets/img/sections'), '.webp');
for (const file of sectionImgs) {
  const size = (await fs.stat(file)).size;
  if (size > MAX_SECTION_IMG_BYTES) {
    fail(`Section image ${path.basename(file)} is ${size} B > ${MAX_SECTION_IMG_BYTES} B`);
  }
}

// 5. CSP inline script hash + zero inline styles/handlers in index.html
const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
if (/\sstyle\s*=/i.test(html) || /<style[\s>]/i.test(html)) {
  fail('Inline style attribute or <style> tag found in index.html (violates CSP style-src self)');
}
if (/\son[a-z]+\s*=/i.test(html)) {
  fail('Inline event handler found in index.html (violates CSP)');
}

const inlineScriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const cspHashMatch = html.match(/script-src\s+'self'\s+'sha256-([^']+)'/);
if (!inlineScriptMatch || !cspHashMatch) {
  fail('Missing inline head script or CSP sha256 hash in index.html');
} else {
  const actualHash = crypto.createHash('sha256').update(inlineScriptMatch[1], 'utf8').digest('base64');
  if (actualHash !== cspHashMatch[1]) {
    fail(`CSP hash mismatch: expected ${actualHash}, found ${cspHashMatch[1]}`);
  }
}

// 6. Forbidden copy & outbound URL audit
const auditFiles = [path.join(ROOT, 'index.html'), ...homeCssFiles, ...jsFiles];
const urls = new Set();
for (const file of auditFiles) {
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
console.log(`CSS total: ${totalCss} B / ${MAX_CSS_BYTES} B (tokens.css + home.css)`);
console.log(`Fonts (${fontFiles.length}): OK (<= ${MAX_FONT_BYTES} B each)`);
console.log(`Section WebPs (${sectionImgs.length}): OK (<= ${MAX_SECTION_IMG_BYTES} B each)`);
console.log(`CSP SHA-256 hash verified: sha256-${cspHashMatch?.[1]}`);
console.log(`URLs found (${urls.size}):`);
for (const entry of urls) {
  console.log(`  - ${entry}`);
}

if (failed) process.exit(1);
console.log('All checks passed.');
