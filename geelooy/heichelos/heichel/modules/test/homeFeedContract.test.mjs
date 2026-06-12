// B"H
/**
 * Chapter 22: home feed mockup contract.
 * The Home CSS entry may be a compatibility wrapper; this test follows imports
 * so it verifies the real modular vessels rather than stale wrapper text.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function read(file) {
  return readFileSync(file, 'utf8');
}

function cssGraph(entry, seen = new Set()) {
  const normalized = path.normalize(entry).replace(/\\/g, '/');
  if (seen.has(normalized)) return '';
  seen.add(normalized);

  const source = read(normalized);
  const dir = path.dirname(normalized);
  const imported = [...source.matchAll(/@import\s+(?:url\()?['"]([^'")]+)['"]/g)]
    .map(match => match[1])
    .filter(target => target.startsWith('.'))
    .map(target => cssGraph(path.join(dir, target), seen))
    .join('\n');

  return `${source}\n${imported}`;
}

const html = read('geelooy/index.html');
const css = cssGraph('geelooy/style/social/home.css');

for (const token of ['geelooy-home-shell', 'home-feed-phone', 'home-feed-tabs', 'home-composer', 'home-post-card', '/heichelos/submit']) {
  assert.ok(html.includes(token), `home html missing ${token}`);
}
for (const token of ['.geelooy-home-shell', '.home-feed-phone', '.home-post-card', '.home-sanctuary-card']) {
  assert.ok(css.includes(token), `home css missing ${token}`);
}
assert.ok(/@media\s*\(max-width:\s*980px\)/.test(css), 'home css missing max-width 980px media query');
console.log('B"H homeFeedContract.test passed');
