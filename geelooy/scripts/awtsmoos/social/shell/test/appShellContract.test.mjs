// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppShellContractTest
 * @description
 * The Awtsmoos verifies one Horizon, Context Ribbon, search lens, constellation,
 * and mobile dock at Awtsmoos.com without duplicate navigation ownership.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const routeState = read('geelooy/scripts/awtsmoos/social/shell/routeCurrentState.js');
const ribbon = read('geelooy/scripts/awtsmoos/social/shell/contextRibbon.js');
const model = read('geelooy/scripts/awtsmoos/social/shell/contextModel.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const menu = read('geelooy/scripts/awtsmoos/social/shell/constellationMenu.js');
const search = read('geelooy/scripts/awtsmoos/social/shell/headerSearch.js');
const command = read('geelooy/scripts/awtsmoos/social/shell/appCommand.js');
const boot = read('geelooy/scripts/awtsmoos/social/shell/boot.js');
const home = read('geelooy/index.html');

for (const token of ['createUnusualHeader', 'createContextRibbon', 'g-dock', 'aria-current', 'primaryRoutes']) {
	assert.ok(shell.includes(token), `app shell missing ${token}`);
}
assert.ok(shell.includes("a[data-g-route-link]"), 'current state must stay inside shell route links');
for (const token of ['isCanonicalRouteLink', 'normalizeRoutePath', 'linkUrl.origin']) {
	assert.ok(routeState.includes(token), `route current-state rule missing ${token}`);
}
for (const token of ['publishRouteContext', 'data-g-context-visible', 'g-context-title', 'g-context-action']) {
	assert.ok(ribbon.includes(token), `context ribbon missing ${token}`);
}
for (const token of ['createContextModel', 'Object.freeze', 'normalizeLink', 'stateToken']) {
	assert.ok(model.includes(token), `context model missing ${token}`);
}
for (const token of ['awtsmoosificationalisticaticalism', 'createProfileDropdown', 'createHeaderSearch', 'bindConstellationMenu']) {
	assert.ok(header.includes(token), `unusual header missing ${token}`);
}
assert.ok(!header.includes('route.match(location.pathname)'), 'header must not duplicate current-route ownership');
for (const token of ['Escape', 'restoreFocus', 'button.focus()', 'data-global-menu-open']) {
	assert.ok(menu.includes(token), `constellation menu missing ${token}`);
}
for (const token of ['/heichelos', '/mawgawl/sefarim', 'searchAppRoutes', 'metaKey', 'ctrlKey']) {
	assert.ok(search.includes(token), `header search missing ${token}`);
}
assert.ok(command.includes('focusHeaderSearch'), 'command bridge must focus the visible search lens');
for (const token of ['ensureAppShell', 'bindAppCommand', 'startOptionalNavigation', 'geelooy-spectral-shell']) {
	assert.ok(boot.includes(token), `shell boot missing ${token}`);
}
assert.ok(boot.includes("await import('../navigation/appNavigation.js')"), 'hybrid navigation must stay optional');
assert.ok(boot.includes('catch (error)'), 'optional navigation failure must preserve native pages');
for (const token of ['g-home-orbit', 'g-home-portal-search', 'g-home-torah-portal', 'data-home-feed']) {
	assert.ok(home.includes(token), `Home missing extreme shell token ${token}`);
}
for (const [name, source] of Object.entries({ shell, routeState, ribbon, model, header, menu, boot })) {
	assert.ok(source.split('\n').length <= 120, `${name} must stay within 120 lines`);
}
assert.ok(!shell.includes('g-rail') && !header.includes('g-rail'), 'shell must not restore a conventional rail');
console.log('B"H appShellContract.test passed');
