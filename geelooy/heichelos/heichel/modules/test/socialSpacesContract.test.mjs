// B"H
/**
 * Chapter 20: social spaces page contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/heichelos/_awtsmoos.index.html', 'utf8');
const css = readFileSync('geelooy/style/heichelos/social-index.css', 'utf8');

for (const token of ['social-spaces-shell', 'spaces-hero', 'social-space-card', '/api/social/heichelos/searchByAliasOwner/', 'Create Heichel']) {
  assert.ok(html.includes(token), `spaces html missing ${token}`);
}
for (const token of ['.social-spaces-shell', '.spaces-hero', '.social-space-card', '.space-actions', '.spaces-grid']) {
  assert.ok(css.includes(token), `spaces css missing ${token}`);
}
console.log('B"H socialSpacesContract.test passed');
