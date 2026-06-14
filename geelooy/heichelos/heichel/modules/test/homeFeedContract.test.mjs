// B"H
/**
 * Chapter 22: home feed live contract.
 * The home screen must be styled, navigable, and honest: no fake demo cards
 * may masquerade as real posts. The live feed script owns the online river and
 * must open API posts through the root series when no series id is supplied.
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
const liveFeed = read('geelooy/scripts/awtsmoos/social/home/liveFeed.js');

for (const token of ['geelooy-home-shell', 'home-feed-phone', 'home-feed-tabs', 'home-composer', 'home-post-card', '/heichelos/submit']) {
  assert.ok(html.includes(token), `home html missing ${token}`);
}
for (const token of ['data-feed-mode="forYou"', 'data-feed-mode="following"', 'data-feed-mode="trending"', 'data-home-feed', 'liveFeed.js']) {
  assert.ok(html.includes(token), `home html missing live token ${token}`);
}
for (const forbidden of ['Awtsmoos Network</strong>', 'Every sunrise is a new song', 'Build spaces, write posts']) {
  assert.ok(!html.includes(forbidden), `home html must not contain fake feed text: ${forbidden}`);
}
for (const token of ['.geelooy-home-shell', '.home-feed-phone', '.home-post-card', '.home-sanctuary-card', '.home-menu-button']) {
  assert.ok(css.includes(token), `home css missing ${token}`);
}
for (const token of ['getFeedHome', 'getTrendingFeed', 'getDiscoverFeed', 'data-home-feed', "seriesId || 'root'", 'encodeURIComponent(postId)']) {
  assert.ok(liveFeed.includes(token), `live feed script missing ${token}`);
}
assert.ok(/@media\s*\(max-width:\s*980px\)/.test(css), 'home css missing max-width 980px media query');
console.log('B"H homeFeedContract.test passed');
