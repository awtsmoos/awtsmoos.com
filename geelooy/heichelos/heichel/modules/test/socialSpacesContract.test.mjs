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
for (const token of ['./spaces/tokens.css', './spaces/hero.css', './spaces/actions.css', './spaces/card.css', './spaces/empty.css']) {
  assert.ok(css.includes(token), `spaces css manifest missing ${token}`);
}
assert.ok(!html.includes('spaces-route-rail'), 'spaces page should not duplicate global route rail');
assert.ok(!html.includes('href="/email">Mail'), 'empty state should not duplicate mail navigation');
console.log('B"H socialSpacesContract.test passed');
