// B"H
/**
 * Chapter 42: The watchman at the CSS gate sharpens again.
 * The Awtsmoos appoints this blade to guard every visual vessel: no broad
 * ghosts, no duplicate blocks, no stolen sidebar crown, no floating rail war,
 * no chrome header ghost-rule crawling back from an older age.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const classicCssFiles = [
  'geelooy/style/heichelos/revamped-partials/content.css',
  'geelooy/style/heichelos/revamped-partials/platform-panels.css',
  'geelooy/style/heichelos/revamped-partials/platform-mobile.css',
  'geelooy/style/heichelos/revamped-partials/notifications.css',
  'geelooy/style/heichelos/revamped-partials/notifications-mobile.css',
  'geelooy/style/social/alias.css',
  'geelooy/style/social/profileStyles.css',
  'geelooy/email/css/sidebar.css',
  'geelooy/email/css/composer.css'
];

const idealDir = 'geelooy/heichelos/post/styles/ideal';
const idealFiles = fs.readdirSync(idealDir).filter(file => file.endsWith('.css')).map(file => path.join(idealDir, file));
const sacredDomain = /\.sidebar\b|\.sidebar\.|hidden-comments|awtsmoos-sidebar(?!-breadcrumbs)|awtsmoos-slide|awtsmoos-view|keeper-|keepers-|awtsmoos-ideal-sidebar|awtsmoos-inline-commentary-root|comment-body-vessel|awtsmoos-floating-controls|awtsmoos-auto-scroll-floating|awtsmoos-sidebar-header-chrome|awtsmoos-chrome-row|awtsmoos-current-view-title|awtsmoos-chrome-btn|fullscreen-mode/;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function importedCssGraph(entry) {
  const root = 'geelooy/heichelos/post/styles';
  const seen = new Set();
  const walk = file => {
    const full = path.normalize(file);
    if (seen.has(full)) return;
    seen.add(full);
    const dir = path.dirname(full);
    for (const match of read(full).matchAll(/@import\s+url\(["'](.+?)["']\)/g)) walk(path.join(dir, match[1]));
  };
  walk(path.join(root, entry));
  return [...seen];
}

function selectorsOf(source) {
  const selectors = [];
  for (const part of stripComments(source).split('}')) {
    const index = part.indexOf('{');
    if (index < 0) continue;
    const raw = part.slice(0, index).trim();
    if (!raw || raw.startsWith('@')) continue;
    raw.split(',').map(item => item.trim()).filter(Boolean).forEach(selector => selectors.push(selector));
  }
  return selectors;
}

function assertNoExactDuplicateBlocks(file) {
  const seen = new Set();
  const duplicates = [];
  const re = /([^{}@]+)\{([^{}]+)\}/g;
  let match;
  while ((match = re.exec(read(file)))) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    if (!selector || selector === 'from' || selector === 'to') continue;
    const block = `${selector}{${match[2].trim().replace(/\s+/g, ' ')}}`;
    if (seen.has(block)) duplicates.push(selector);
    seen.add(block);
  }
  assert.deepEqual(duplicates, [], `${file} exact duplicate CSS blocks: ${duplicates.join(', ')}`);
}

function assertIdealSingleOwner() {
  const owners = new Map();
  for (const file of idealFiles) {
    const local = new Map();
    for (const selector of selectorsOf(read(file))) {
      local.set(selector, (local.get(selector) || 0) + 1);
      if (!owners.has(selector)) owners.set(selector, new Set());
      owners.get(selector).add(file);
    }
    const dupes = [...local].filter(([, count]) => count > 1).map(([selector]) => selector);
    assert.deepEqual(dupes, [], `${file} repeats ideal selectors: ${dupes.join(', ')}`);
  }
  const shared = [...owners].filter(([, files]) => files.size > 1).map(([selector]) => selector);
  assert.deepEqual(shared, [], `ideal selector cross-file conflicts: ${shared.join(', ')}`);
}

function assertOnlyIdealOwnsSacredDomains() {
  const files = importedCssGraph('main.css');
  const offenders = [];
  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    const isIdeal = normalized.includes('/styles/ideal/') || normalized.endsWith('/styles/forever-ui-fixes.css');
    const isSafe = /\/styles\/reset\//.test(normalized) || /sidebar-breadcrumbs\.css$/.test(normalized) || /polished-shell\.css$/.test(normalized);
    if (isIdeal || isSafe) continue;
    read(file).split(/\r?\n/).forEach((line, index) => {
      if (sacredDomain.test(line) && !line.includes('Legacy shim')) offenders.push(`${normalized}:${index + 1}`);
    });
  }
  assert.deepEqual(offenders, [], `non-ideal owners found: ${offenders.join(', ')}`);
}

assert.deepEqual(classicCssFiles, [...new Set(classicCssFiles)], 'cssQuality.test must not scan duplicate file paths');
classicCssFiles.forEach(file => {
  assert.doesNotMatch(read(file), /z-index:\s*999999/, `${file} has excessive z-index`);
  if (file.endsWith('profileStyles.css')) assert.doesNotMatch(read(file), /(^|\n)\.hidden\s*\{/, `${file} has broad .hidden rule`);
  assertNoExactDuplicateBlocks(file);
});
idealFiles.forEach(assertNoExactDuplicateBlocks);
assertIdealSingleOwner();
assertOnlyIdealOwnsSacredDomains();

console.log('B"H cssQuality.test passed with ideal ownership guards');
