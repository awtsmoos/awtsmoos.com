// B"H
/**
 * Chapter 9: The imported style mirror guards the living river.
 *
 * The Awtsmoos makes every selector a boundary stone. This gate walks the live
 * `main.css` import graph, rejects ownership wars, and now proves the sidebar
 * viewport seal remains imported so Main Menu can never return to black void.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const styleRoot = path.join('geelooy', 'heichelos', 'post', 'styles');
const safeDuplicateSelectors = new Set([':root', '.post-reader-localized-context']);
const safeDuplicatePrefixes = [
  '@media',
  '.post-reader-localized-context :where(',
  '.post-reader-localized-context h',
  '.post-reader-localized-context p',
  '.post-reader-localized-context a',
  '.post-reader-localized-context input',
  '.post-reader-localized-context textarea',
  '.post-reader-localized-context select'
];

function read(file) { return fs.readFileSync(file, 'utf8'); }
function normalize(file) { return file.replace(/\\/g, '/'); }

function importedCssGraph(entry) {
  const seen = new Set();
  const walk = file => {
    const full = path.normalize(file);
    if (seen.has(full)) return;
    seen.add(full);
    const dir = path.dirname(full);
    for (const match of read(full).matchAll(/@import\s+url\(["'](.+?)["']\)/g)) walk(path.join(dir, match[1]));
  };
  walk(path.join(styleRoot, entry));
  return [...seen];
}

function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ''); }

function splitSelectorList(raw) {
  const result = [];
  let current = '';
  let depth = 0;
  for (const char of raw) {
    if (char === '(') depth++;
    if (char === ')') depth = Math.max(0, depth - 1);
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function isFrameSelector(selector) {
  return selector === 'from' || selector === 'to' || /^\d+(?:\.\d+)?%$/.test(selector) || selector.startsWith('@keyframes');
}

function selectorsOf(file) {
  const selectors = [];
  const re = /([^{}]+?)\s*\{/g;
  let match;
  while ((match = re.exec(stripComments(read(file))))) {
    const raw = match[1].trim().replace(/\s+/g, ' ');
    if (!raw || raw.startsWith('@import') || raw.startsWith('@font-face')) continue;
    splitSelectorList(raw).map(selector => selector.replace(/\s+/g, ' '))
      .filter(selector => selector && !isFrameSelector(selector))
      .forEach(selector => selectors.push(selector));
  }
  return selectors;
}

function isSafeDuplicate(selector) {
  return safeDuplicateSelectors.has(selector) || safeDuplicatePrefixes.some(prefix => selector.startsWith(prefix));
}

const importedFiles = importedCssGraph('main.css');
const owners = new Map();
for (const file of importedFiles) {
  for (const selector of selectorsOf(file)) {
    const list = owners.get(selector) || new Set();
    list.add(normalize(file));
    owners.set(selector, list);
  }
}

const conflicts = [...owners.entries()]
  .map(([selector, files]) => [selector, [...files]])
  .filter(([selector, files]) => files.length > 1 && !isSafeDuplicate(selector));

assert.deepEqual(conflicts, [], `imported CSS selector ownership conflicts: ${JSON.stringify(conflicts.slice(0, 80), null, 2)}`);

const sealPath = path.join(styleRoot, 'ideal', 'reborn', 'sidebar-viewport-seal.css');
const sealText = read(sealPath);
assert(importedFiles.map(normalize).includes(normalize(sealPath)), 'sidebar viewport seal must be imported by main.css');
assert.match(sealText, /> \.main > \.sidebar > \.awtsmoos-sidebar-shell[\s\S]*height:\s*100%/, 'sidebar shell must receive definite height');
assert.match(sealText, /> \.awtsmoos-sidebar-shell > \.awtsmoos-slide-viewport[\s\S]*flex:\s*1 1 auto/, 'sidebar viewport must flex into the shell');
assert.match(sealText, /@media \(max-width:\s*900px\)[\s\S]*height:\s*min\(88dvh/, 'mobile sidebar must keep a tall usable chamber');
assert.match(sealText, /@media \(min-width:\s*901px\)[\s\S]*\.sidebar:not\(\.hidden-comments\)[\s\S]*min-height:\s*100dvh/, 'desktop sidebar must use equal specificity to fill the viewport');

console.log('B"H importedStyleOwnership.test passed');
