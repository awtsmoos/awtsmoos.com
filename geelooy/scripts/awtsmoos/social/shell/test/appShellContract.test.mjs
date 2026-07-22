// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppShellContractTest
 * @description
 * The Awtsmoos verifies one profile-bearing horizon, one canonical route-link
 * renderer, and one Games doorway across Awtsmoos.com without shadow headers.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const routeLink = read('geelooy/scripts/awtsmoos/social/shell/routeLink.js');
const routeState = read('geelooy/scripts/awtsmoos/social/shell/routeCurrentState.js');
const ribbon = read('geelooy/scripts/awtsmoos/social/shell/contextRibbon.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const menu = read('geelooy/scripts/awtsmoos/social/shell/constellationMenu.js');
const search = read('geelooy/scripts/awtsmoos/social/shell/headerSearch.js');
const boot = read('geelooy/scripts/awtsmoos/social/shell/boot.js');
const performance = read('geelooy/scripts/awtsmoos/social/shell/performanceProfile.js');
const home = read('geelooy/index.html');
const games = read('geelooy/games/index.html');

for (const token of ['createUnusualHeader', 'createContextRibbon', 'g-dock', 'aria-current', 'primaryRoutes']) {
	assert.ok(shell.includes(token), `app shell missing ${token}`);
}
assert.match(shell, /createMalchusRouteLink/);
assert.doesNotMatch(shell, /function createDockLink/);
assert.match(routeLink, /g-route-icon/);
assert.match(routeLink, /g-route-label/);
assert.match(routeLink, /profile-route-dish/);
assert.match(routeLink, /data\.gamesRoute|dataset\.gamesRoute/);
assert.ok(shell.includes('a[data-g-route-link]'));
for (const token of ['isCanonicalRouteLink', 'normalizeRoutePath', 'linkUrl.origin']) {
	assert.ok(routeState.includes(token), `route current-state rule missing ${token}`);
}
for (const token of ['data-g-context-visible', 'g-context-title', 'g-context-action']) {
	assert.ok(ribbon.includes(token), `context ribbon missing ${token}`);
}
for (const token of ['awtsmoosificationalisticaticalism', 'createProfileDropdown', 'createHeaderSearch', 'bindConstellationMenu', 'createMalchusRouteLink']) {
	assert.ok(header.includes(token), `unusual header missing ${token}`);
}
assert.doesNotMatch(header, /function routeCard/);
for (const emoji of ['🔍', '📬', '🧭']) {
	assert.ok(header.includes(emoji));
}
for (const token of ['Escape', 'restoreFocus', 'button.focus()', 'data-global-menu-open']) {
	assert.ok(menu.includes(token), `constellation menu missing ${token}`);
}
for (const token of ['/heichelos', '/mawgawl/sefarim', 'searchAppRoutes']) {
	assert.ok(search.includes(token));
}
for (const token of ['ensureAppShell', 'applyPerformanceProfile', 'speed-001', 'geelooy-spectral-shell']) {
	assert.ok(boot.includes(token));
}
for (const token of ['deviceMemory', 'hardwareConcurrency', 'saveData', 'g-performance-lean']) {
	assert.ok(performance.includes(token));
}
for (const token of ['/heichelos/ikar', 'data-home-feed', 'geelooy-social-surface', 'social/shell/boot.js']) {
	assert.ok(home.includes(token));
}
for (const token of ['social/shell/boot.js', 'g-content-region', 'data-geelooy-route="games"']) {
	assert.ok(games.includes(token));
}
assert.doesNotMatch(games, /nav\/header\.html/);
assert.doesNotMatch(home, /class="civilization-header"/);
for (const [name, source] of Object.entries({ shell, routeLink, routeState, ribbon, header, menu, boot, performance })) {
	assert.ok(lineCount(source) <= 120, `${name} must stay within 120 lines`);
}
assert.ok(!shell.includes('g-rail') && !header.includes('g-rail'));
console.log('B"H appShellContract.test passed');

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
