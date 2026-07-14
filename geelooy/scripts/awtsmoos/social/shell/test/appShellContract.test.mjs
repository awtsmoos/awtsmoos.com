// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppShellContractTest
 * @description
 * The Awtsmoos verifies one fast emoji Horizon, Ikar-centered dock, search
 * lens, profile doorway, and constellation across Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const routeState = read('geelooy/scripts/awtsmoos/social/shell/routeCurrentState.js');
const ribbon = read('geelooy/scripts/awtsmoos/social/shell/contextRibbon.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const menu = read('geelooy/scripts/awtsmoos/social/shell/constellationMenu.js');
const search = read('geelooy/scripts/awtsmoos/social/shell/headerSearch.js');
const boot = read('geelooy/scripts/awtsmoos/social/shell/boot.js');
const profile = read('geelooy/scripts/awtsmoos/social/shell/performanceProfile.js');
const home = read('geelooy/index.html');

for (const token of ['createUnusualHeader', 'createContextRibbon', 'g-dock', 'aria-current', 'primaryRoutes']) {
	assert.ok(shell.includes(token), `app shell missing ${token}`);
}
assert.match(shell, /data\.mainRoute|dataset\.mainRoute/);
assert.match(shell, /g-route-icon/);
assert.match(shell, /g-route-label/);
assert.ok(shell.includes("a[data-g-route-link]"), 'current state must stay inside shell route links');
for (const token of ['isCanonicalRouteLink', 'normalizeRoutePath', 'linkUrl.origin']) {
	assert.ok(routeState.includes(token), `route current-state rule missing ${token}`);
}
for (const token of ['data-g-context-visible', 'g-context-title', 'g-context-action']) {
	assert.ok(ribbon.includes(token), `context ribbon missing ${token}`);
}
for (const token of ['awtsmoosificationalisticaticalism', 'createProfileDropdown', 'createHeaderSearch', 'bindConstellationMenu']) {
	assert.ok(header.includes(token), `unusual header missing ${token}`);
}
for (const emoji of ['🔍', '📬', '🧭']) {
	assert.ok(header.includes(emoji), `header missing ${emoji}`);
}
for (const token of ['Escape', 'restoreFocus', 'button.focus()', 'data-global-menu-open']) {
	assert.ok(menu.includes(token), `constellation menu missing ${token}`);
}
for (const token of ['/heichelos', '/mawgawl/sefarim', 'searchAppRoutes']) {
	assert.ok(search.includes(token), `header search missing ${token}`);
}
for (const token of ['ensureAppShell', 'applyPerformanceProfile', 'speed-001', 'geelooy-spectral-shell']) {
	assert.ok(boot.includes(token), `shell boot missing ${token}`);
}
for (const token of ['deviceMemory', 'hardwareConcurrency', 'saveData', 'g-performance-lean']) {
	assert.ok(profile.includes(token), `performance profile missing ${token}`);
}
for (const token of ['/heichelos/ikar', '🏛️', 'data-home-feed']) {
	assert.ok(home.includes(token), `Home missing Ikar token ${token}`);
}
for (const [name, source] of Object.entries({ shell, routeState, ribbon, header, menu, boot, profile })) {
	assert.ok(source.split('\n').length <= 120, `${name} must stay within 120 lines`);
}
assert.ok(!shell.includes('g-rail') && !header.includes('g-rail'), 'shell must not restore a conventional rail');
console.log('B"H appShellContract.test passed');
