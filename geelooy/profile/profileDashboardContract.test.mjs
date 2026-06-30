// B"H
/**
 * @module ProfileDashboardContractTest
 * @description
 * Chapter 27: the Awtsmoos verifies the split profile dashboard without lying
 * that every contract still lives in one giant file.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const html = read('geelooy/profile/index.html');
const entry = read('geelooy/profile/script.js');
const api = read('geelooy/profile/modules/api.js');
const tabs = read('geelooy/profile/modules/tabs.js');
const aliases = read('geelooy/profile/modules/aliases.js');
const heichelos = read('geelooy/profile/modules/heichelos.js');
const css = read('geelooy/style/social/profile.css');

for (const token of ['geelooy-profile-shell', 'profile-hero-card', 'profile-tabs', 'data-profile-panel="heichelos"', 'Create Alias', 'aria-live="polite"', 'role="tablist"']) {
  assert.ok(html.includes(token), `profile html missing ${token}`);
}
for (const token of ['bindTabs', 'loadProfile', 'renderHeichelos', 'renderFatalProfileError']) {
  assert.ok(entry.includes(token), `profile entry missing ${token}`);
}
for (const token of ['/api/social/aliases/details', '/api/social/alias/default', '/api/social/alias/${encoded}/heichelos/details', 'response.json().catch']) {
  assert.ok(api.includes(token), `profile api missing ${token}`);
}
for (const token of ['setDefaultAlias', 'button.disabled = true', 'announceProfile']) {
  assert.ok(aliases.includes(token), `profile aliases missing ${token}`);
}
for (const token of ['state.heichelErrors', 'emptyCard(`@${aliasId}: ${message}`']) {
  assert.ok(heichelos.includes(token), `profile heichelos missing ${token}`);
}
for (const token of ['aria-selected', 'ArrowRight', 'panel.hidden']) {
  assert.ok(tabs.includes(token), `profile tabs missing ${token}`);
}
for (const token of ['.geelooy-profile-shell', '.profile-hero-card', '.social-alias-card', '.social-heichel-card', '.profile-tabs button.active']) {
  assert.ok(css.includes(token), `profile css missing ${token}`);
}
console.log('B"H profileDashboardContract.test passed');
