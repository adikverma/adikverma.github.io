import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_HOME_JS_BYTES = 22 * 1024;
const MAX_HOME_CSS_BYTES = 28 * 1024;
const MAX_PRODUCT_JS_BYTES = 22 * 1024;
const MAX_PRODUCT_CSS_BYTES = 30 * 1024;
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

function checkJsSyntax(file) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    fail(`JS syntax error in ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

async function checkHtmlSecurity(relPath, { expectInlineScript = true, expectNoScript = false } = {}) {
  const fullPath = path.join(ROOT, relPath);
  const html = await fs.readFile(fullPath, 'utf8');

  if (/\sstyle\s*=/i.test(html) || /<style[\s>]/i.test(html)) {
    fail(`Inline style attribute or <style> tag found in ${relPath} (violates CSP style-src 'self')`);
  }
  if (/\son[a-z]+\s*=/i.test(html)) {
    fail(`Inline event handler found in ${relPath} (violates CSP)`);
  }

  // Verify target="_blank" links always include rel="noopener noreferrer"
  const blankLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/gi) || [];
  for (const tag of blankLinks) {
    if (!/rel="[^"]*noopener[^"]*noreferrer[^"]*"/i.test(tag)) {
      fail(`Missing rel="noopener noreferrer" on target="_blank" link in ${relPath}: ${tag}`);
    }
  }

  if (expectNoScript) {
    if (/<script[\s>]/i.test(html)) {
      fail(`${relPath} must not contain any <script> tags`);
    }
    if (!/script-src\s+'none'/i.test(html)) {
      fail(`${relPath} CSP must enforce script-src 'none'`);
    }
    if (!/<meta[^>]+name="robots"[^>]+content="noindex,\s*nofollow"/i.test(html)) {
      fail(`${relPath} must set meta robots noindex,nofollow`);
    }
    if (!/<meta[^>]+name="referrer"[^>]+content="no-referrer"/i.test(html)) {
      fail(`${relPath} must set meta referrer no-referrer`);
    }
    if (/\blocation\b/i.test(html)) {
      fail(`${relPath} must never reference location`);
    }
    if (/https?:\/\//i.test(html)) {
      fail(`${relPath} must not contain external http(s) URLs`);
    }
    return { relPath, hash: 'none (script-src none)' };
  }

  if (expectInlineScript) {
    const inlineScriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    const cspHashMatch = html.match(/script-src\s+'self'\s+'sha256-([^']+)'/);
    if (!inlineScriptMatch || !cspHashMatch) {
      fail(`Missing inline head script or CSP sha256 hash in ${relPath}`);
      return { relPath, hash: 'MISSING' };
    }
    const actualHash = crypto.createHash('sha256').update(inlineScriptMatch[1], 'utf8').digest('base64');
    if (actualHash !== cspHashMatch[1]) {
      fail(`CSP hash mismatch in ${relPath}: expected ${actualHash}, found ${cspHashMatch[1]}`);
    }
    return { relPath, hash: `sha256-${cspHashMatch[1]}` };
  }

  return { relPath, hash: 'n/a' };
}

// 1. Home JS syntax + budget
const homeJsFiles = await listFiles(path.join(ROOT, 'assets/js'), '.js');
let totalHomeJs = 0;
for (const file of homeJsFiles) {
  totalHomeJs += (await fs.stat(file)).size;
  checkJsSyntax(file);
}
if (totalHomeJs > MAX_HOME_JS_BYTES) {
  fail(`Home JS ${totalHomeJs} B exceeds ${MAX_HOME_JS_BYTES} B`);
}

// 2. Product JS syntax + budget
const productJsFiles = await listFiles(path.join(ROOT, 'assets/js/product'), '.js');
let totalProductJs = 0;
for (const file of productJsFiles) {
  totalProductJs += (await fs.stat(file)).size;
  checkJsSyntax(file);
}
if (totalProductJs > MAX_PRODUCT_JS_BYTES) {
  fail(`Product JS ${totalProductJs} B exceeds ${MAX_PRODUCT_JS_BYTES} B`);
}

// 3. CSS budgets (home: tokens.css + home.css; product: product.css)
const homeCssFiles = ['tokens.css', 'home.css'].map((f) => path.join(ROOT, 'assets/css', f));
let totalHomeCss = 0;
for (const file of homeCssFiles) {
  totalHomeCss += (await fs.stat(file)).size;
}
if (totalHomeCss > MAX_HOME_CSS_BYTES) {
  fail(`Home CSS ${totalHomeCss} B exceeds ${MAX_HOME_CSS_BYTES} B`);
}

const productCssFile = path.join(ROOT, 'assets/css/product.css');
const productCssBytes = (await fs.stat(productCssFile)).size;
if (productCssBytes > MAX_PRODUCT_CSS_BYTES) {
  fail(`Product CSS ${productCssBytes} B exceeds ${MAX_PRODUCT_CSS_BYTES} B`);
}

// Ensure product.css does not import home CSS/tokens
const productCssText = await fs.readFile(productCssFile, 'utf8');
if (/tokens\.css|home\.css/i.test(productCssText)) {
  fail('assets/css/product.css must not import home page tokens.css or home.css');
}

// 4. Fonts budget
const fontFiles = await listFiles(path.join(ROOT, 'assets/fonts'), '.woff2');
for (const file of fontFiles) {
  const size = (await fs.stat(file)).size;
  if (size > MAX_FONT_BYTES) {
    fail(`Font ${path.basename(file)} is ${size} B > ${MAX_FONT_BYTES} B`);
  }
}

// 5. Section image budgets
const sectionImgs = await listFiles(path.join(ROOT, 'assets/img/sections'), '.webp');
for (const file of sectionImgs) {
  const size = (await fs.stat(file)).size;
  if (size > MAX_SECTION_IMG_BYTES) {
    fail(`Section image ${path.basename(file)} is ${size} B > ${MAX_SECTION_IMG_BYTES} B`);
  }
}

// 6. HTML CSP, inline style/handler, and callback security checks
const htmlResults = [];
htmlResults.push(await checkHtmlSecurity('index.html', { expectInlineScript: true }));
htmlResults.push(await checkHtmlSecurity('runwiththewind/index.html', { expectInlineScript: true }));
htmlResults.push(await checkHtmlSecurity('runwiththewind/privacy/index.html', { expectInlineScript: true }));
htmlResults.push(await checkHtmlSecurity('runwiththewind/callback/index.html', { expectNoScript: true }));

// 7. Android App Links JSON & .nojekyll validation
const EXPECTED_ANDROID_PACKAGE = 'io.github.adikverma.runwiththewind';
const SHA256_FP_RX = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
try {
  await fs.access(path.join(ROOT, '.nojekyll'));
} catch {
  fail('Missing .nojekyll at repository root (required for GitHub Pages to serve .well-known/)');
}

const assetLinksPath = path.join(ROOT, '.well-known/assetlinks.json');
let verifiedFpCount = 0;
try {
  const parsed = JSON.parse(await fs.readFile(assetLinksPath, 'utf8'));
  const entry = Array.isArray(parsed) ? parsed[0] : null;
  const fps = entry?.target?.sha256_cert_fingerprints;
  if (!entry || !Array.isArray(entry.relation) || !entry.relation.includes('delegate_permission/common.handle_all_urls')) {
    fail('.well-known/assetlinks.json must include relation "delegate_permission/common.handle_all_urls"');
  }
  if (entry?.target?.namespace !== 'android_app') {
    fail('.well-known/assetlinks.json target.namespace must be "android_app"');
  }
  if (entry?.target?.package_name !== EXPECTED_ANDROID_PACKAGE) {
    fail(`.well-known/assetlinks.json target.package_name must be "${EXPECTED_ANDROID_PACKAGE}"`);
  }
  if (!Array.isArray(fps) || fps.length === 0) {
    fail('.well-known/assetlinks.json target.sha256_cert_fingerprints must be a non-empty array');
  } else {
    for (const fp of fps) {
      if (typeof fp !== 'string' || !SHA256_FP_RX.test(fp)) {
        fail(`.well-known/assetlinks.json contains invalid SHA-256 fingerprint: ${JSON.stringify(fp)}`);
      }
    }
    verifiedFpCount = fps.length;
  }
} catch (err) {
  fail(`.well-known/assetlinks.json is not valid JSON: ${err.message}`);
}

// 8. Sitemap & robots checks
const sitemapText = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
if (!sitemapText.includes('https://adikverma.github.io/runwiththewind/')) {
  fail('sitemap.xml is missing /runwiththewind/');
}
if (!sitemapText.includes('https://adikverma.github.io/runwiththewind/privacy/')) {
  fail('sitemap.xml is missing /runwiththewind/privacy/');
}
if (sitemapText.includes('/runwiththewind/callback')) {
  fail('sitemap.xml must NOT include /runwiththewind/callback/');
}

const robotsText = await fs.readFile(path.join(ROOT, 'robots.txt'), 'utf8');
if (!/Disallow:\s*\/runwiththewind\/callback\//i.test(robotsText)) {
  fail('robots.txt should disallow /runwiththewind/callback/');
}

// 9. Forbidden copy & outbound URL audit across home + product assets
const auditFiles = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'runwiththewind/index.html'),
  path.join(ROOT, 'runwiththewind/privacy/index.html'),
  path.join(ROOT, 'runwiththewind/callback/index.html'),
  ...homeCssFiles,
  productCssFile,
  ...homeJsFiles,
  ...productJsFiles,
];

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

console.log(`Home JS total:    ${totalHomeJs} B / ${MAX_HOME_JS_BYTES} B (${homeJsFiles.length} files)`);
console.log(`Product JS total: ${totalProductJs} B / ${MAX_PRODUCT_JS_BYTES} B (${productJsFiles.length} files)`);
console.log(`Home CSS total:   ${totalHomeCss} B / ${MAX_HOME_CSS_BYTES} B (tokens.css + home.css)`);
console.log(`Product CSS:      ${productCssBytes} B / ${MAX_PRODUCT_CSS_BYTES} B (product.css)`);
console.log(`Fonts (${fontFiles.length}):        OK (<= ${MAX_FONT_BYTES} B each)`);
console.log(`Section WebPs (${sectionImgs.length}): OK (<= ${MAX_SECTION_IMG_BYTES} B each)`);
for (const r of htmlResults) {
  console.log(`CSP verified [${r.relPath}]: ${r.hash}`);
}
console.log(`App Links (.well-known/assetlinks.json): OK (${EXPECTED_ANDROID_PACKAGE}, ${verifiedFpCount} fingerprint(s))`);
console.log('Sitemap & robots.txt: OK');
console.log(`Outbound URLs found (${urls.size}):`);
for (const entry of urls) {
  console.log(`  - ${entry}`);
}

if (failed) process.exit(1);
console.log('All checks passed.');
