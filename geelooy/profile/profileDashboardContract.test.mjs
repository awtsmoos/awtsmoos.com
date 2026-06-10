// B"H
/**
 * Chapter 18: profile dashboard contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/profile/index.html', 'utf8');
const script = readFileSync('geelooy/profile/script.js', 'utf8');
const css = readFileSync('geelooy/style/social/profile.css', 'utf8');

for (const token of ['geelooy-profile-shell', 'profile-hero-card', 'profile-tabs', 'data-profile-panel="heichelos"', 'Create Alias']) {
  assert.ok(html.includes(token), `profile html missing ${token}`);
}
for (const token of ['/api/social/aliases/details', '/api/social/alias/default', '/api/social/alias/${encodeURIComponent(alias.id)}/heichelos/details', 'setDefaultAlias', 'renderHeichelos']) {
  assert.ok(script.includes(token), `profile script missing ${token}`);
}
for (const token of ['.geelooy-profile-shell', '.profile-hero-card', '.social-alias-card', '.social-heichel-card', '.profile-tabs button.active']) {
  assert.ok(css.includes(token), `profile css missing ${token}`);
}
console.log('B"H profileDashboardContract.test passed');
