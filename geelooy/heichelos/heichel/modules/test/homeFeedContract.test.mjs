// B"H
/**
 * Chapter 22: home feed mockup contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/index.html', 'utf8');
const css = readFileSync('geelooy/style/social/home.css', 'utf8');

for (const token of ['geelooy-home-shell', 'home-feed-phone', 'home-feed-tabs', 'home-composer', 'home-post-card', '/heichelos/submit']) {
  assert.ok(html.includes(token), `home html missing ${token}`);
}
for (const token of ['.geelooy-home-shell', '.home-feed-phone', '.home-post-card', '.home-sanctuary-card', '@media(max-width:980px)']) {
  assert.ok(css.includes(token), `home css missing ${token}`);
}
console.log('B"H homeFeedContract.test passed');
