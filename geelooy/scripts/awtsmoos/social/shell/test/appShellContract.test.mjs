// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppShellContractTest
 * @description
 * The Awtsmoos verifies shared routes without forcing Home into a retired shell;
 * Awtsmoos.com keeps a deliberate dock while the full constellation stays shared.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(file) {
	return readFileSync(file, 'utf8');
}

const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const routeLink = read('geelooy/scripts/awtsmoos/social/shell/routeLink.js');
const routeState = read('geelooy/scripts/awtsmoos/social/shell/routeCurrentState.js');
const ribbon = read('geelooy/scripts/awtsmoos/social/shell/contextRibbon.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const icons = read('geelooy/scripts/awtsmoos/social/shell/headerIcons.js');
const menu = read('geelooy/scripts/awtsmoos/social/shell/constellationMenu.js');
const search = read('geelooy/scripts/awtsmoos/social/shell/headerSearch.js');
const suggestions = read('geelooy/scripts/awtsmoos/social/shell/headerSearchSuggestions.js');
const boot = read('geelooy/scripts/awtsmoos/social/shell/boot.js');
const performance = read('geelooy/scripts/awtsmoos/social/shell/performanceProfile.js');
const home = read('geelooy/index.html');
const homeRuntime = read('geelooy/scripts/home-simple/index.js');
const games = read('geelooy/games/index.html');

assertTokens(shell, ['createUnusualHeader', 'createContextRibbon', 'g-dock', 'aria-current', 'dockRoutes'], 'app shell');
assert.match(shell, /createMalchusRouteLink/);
assert.doesNotMatch(shell, /function createDockLink/);
assertTokens(routeLink, ['g-route-icon', 'g-route-label', 'profile-route-dish'], 'route link');
assert.match(routeLink, /data\.gamesRoute|dataset\.gamesRoute/);
assert.ok(shell.includes('a[data-g-route-link]'));
assertTokens(routeState, ['isCanonicalRouteLink', 'normalizeRoutePath', 'linkUrl.origin'], 'route state');
assertTokens(ribbon, ['data-g-context-visible', 'g-context-title', 'g-context-action'], 'context ribbon');
assertTokens(header, ['awtsmoosificationalisticaticalism', 'createProfileDropdown', 'createHeaderSearch', 'bindConstellationMenu', 'createMalchusRouteLink', 'createHeaderIcon'], 'header');
assert.doesNotMatch(header, /function routeCard/);
assertTokens(icons, ['search:', 'mail:', 'bell:', 'compass:'], 'header icons');
assertTokens(menu, ['Escape', 'restoreFocus', 'button.focus()', 'data-global-menu-open'], 'constellation menu');
assertTokens(search, ['/mawgawl/sefarim', "input.name = 'q'", 'renderSearchSuggestions'], 'header search');
assertTokens(suggestions, ['searchAppRoutes', '/mawgawl/sefarim', 'encodeURIComponent'], 'search suggestions');
assert.match(search, /form\.action\s*=\s*['"]\/mawgawl\/sefarim['"]/);
assert.doesNotMatch(search, /form\.action\s*=\s*['"]\/heichelos['"]/);
assertTokens(boot, ['ensureAppShell', 'applyPerformanceProfile', 'speed-001', 'geelooy-spectral-shell'], 'shell boot');
assertTokens(performance, ['deviceMemory', 'hardwareConcurrency', 'saveData', 'g-performance-lean'], 'performance profile');
assertTokens(home, ['/heichelos/ikar', 'data-profile-mount', 'data-menu-root', '/scripts/home-simple/index.js'], 'Home');
assertTokens(homeRuntime, ['createProfileDropdown', 'WORLD_CATALOG', 'MenuController', 'OmniboxController'], 'Home runtime');
assertTokens(games, ['social/shell/boot.js', 'g-content-region', 'data-geelooy-route="games"'], 'Games');
assert.doesNotMatch(games, /nav\/header\.html/);

const boundedModules = { shell, routeLink, routeState, ribbon, header, icons, suggestions, menu, boot, performance };
for (const [name, source] of Object.entries(boundedModules)) {
	assert.ok(lineCount(source) <= 120, `${name} must stay within 120 lines`);
}
assert.ok(!shell.includes('g-rail') && !header.includes('g-rail'));
console.log('B"H appShellContract.test passed');

function assertTokens(source, tokens, label) {
	for (const token of tokens) {
		assert.ok(source.includes(token), `${label} missing ${token}`);
	}
}

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
