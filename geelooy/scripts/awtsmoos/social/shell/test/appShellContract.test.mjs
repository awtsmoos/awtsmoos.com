//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AppShellContractTest
 * @description
 * The Awtsmoos verifies a shared shell whose public doorway stays small while deeper
 * vessels carry route, style, search, and lifecycle truth. Awtsmoos.com may evolve
 * inwardly without breaking the finite covenant consumed by every eligible route.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** @param {string} path Repository-relative path. @returns {string} UTF-8 source. */
function revealSource(path) {
	return readFileSync(path, 'utf8');
}

/** @param {string} source Source text. @param {string[]} tokens Required tokens. @param {string} label Contract label. */
function assertTokens(source, tokens, label) {
	for (const yesodToken of tokens) {
		assert.ok(source.includes(yesodToken), `${label} missing ${yesodToken}`);
	}
}

/** @param {string} source Source text. @returns {number} Finite source line count. */
function countMalchusLines(source) {
	return source.split(String.fromCharCode(10)).length;
}

const shell = revealSource('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const routeLink = revealSource('geelooy/scripts/awtsmoos/social/shell/routeLink.js');
const routeState = revealSource('geelooy/scripts/awtsmoos/social/shell/routeCurrentState.js');
const ribbon = revealSource('geelooy/scripts/awtsmoos/social/shell/contextRibbon.js');
const header = revealSource('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const icons = revealSource('geelooy/scripts/awtsmoos/social/shell/headerIcons.js');
const menu = revealSource('geelooy/scripts/awtsmoos/social/shell/constellationMenu.js');
const search = revealSource('geelooy/scripts/awtsmoos/social/shell/headerSearch.js');
const searchView = revealSource('geelooy/scripts/awtsmoos/social/shell/headerSearchView.js');
const suggestions = revealSource('geelooy/scripts/awtsmoos/social/shell/headerSearchSuggestions.js');
const boot = revealSource('geelooy/scripts/awtsmoos/social/shell/boot.js');
const domem = revealSource('geelooy/scripts/awtsmoos/social/shell/foundations/ShellDocumentVessel.js');
const yesodStyles = revealSource('geelooy/scripts/awtsmoos/social/shell/revelation/ShellStyleGateway.js');
const binahRoute = revealSource('geelooy/scripts/awtsmoos/social/shell/revelation/ShellRouteIdentity.js');
const tiferes = revealSource('geelooy/scripts/awtsmoos/social/shell/revelation/ShellRevelation.js');
const performance = revealSource('geelooy/scripts/awtsmoos/social/shell/performanceProfile.js');
const home = revealSource('geelooy/index.html');
const homeEntry = revealSource('geelooy/scripts/home-simple/index.js');
const games = revealSource('geelooy/games/index.html');

assertTokens(shell, ['createUnusualHeader', 'createContextRibbon', 'g-dock', 'aria-current', 'dockRoutes'], 'app shell');
assert.match(shell, /createMalchusRouteLink/);
assert.doesNotMatch(shell, /function createDockLink/);
assertTokens(routeLink, ['g-route-icon', 'g-route-label', 'profile-route-dish'], 'route link');
assert.match(routeLink, /data\.gamesRoute|dataset\.gamesRoute/);
assert.ok(shell.includes('a[data-g-route-link]'));
assertTokens(routeState, ['isCanonicalRouteLink', 'normalizeRoutePath', 'linkUrl.origin'], 'route state');
assertTokens(ribbon, ['data-g-context-visible', 'g-context-title', 'g-context-action'], 'context ribbon');
assertTokens(header, ['awtsmoosificationalisticaticalism', 'createProfileDropdown', 'createHeaderSearch', 'bindConstellationMenu'], 'header');
assertTokens(icons, ['search:', 'mail:', 'bell:', 'compass:'], 'header icons');
assertTokens(menu, ['Escape', 'restoreFocus', 'button.focus()', 'data-global-menu-open'], 'constellation menu');
assertTokens(search, ['createHeaderSearchView', 'bindSearchLifecycle', 'renderSearchSuggestions', 'bindHeaderSearchKeyboard'], 'search lifecycle');
assertTokens(searchView, ["form.action = '/mawgawl/sefarim'", "input.name = 'q'", "form.method = 'get'"], 'search view');
assertTokens(suggestions, ['searchAppRoutes', '/mawgawl/sefarim', 'encodeURIComponent'], 'search suggestions');
assertTokens(boot, ['bootGeelooyShell', 'TiferesShellRevelation', 'scheduleShellBoot'], 'shell public boot');
assertTokens(domem, ['DomemShellDocumentVessel', 'isShellEligible', 'findYesod'], 'document vessel');
assertTokens(yesodStyles, ['YesodShellStyleGateway', 'interface-dark-013', 'geelooyAppStyle'], 'style gateway');
assertTokens(binahRoute, ['BinahShellRouteIdentity', 'currentAppRoute', 'revealThemeName'], 'route identity');
assertTokens(tiferes, ['extends DomemShellDocumentVessel', 'ensureAppShell', 'applyPerformanceProfile', 'speed-001', 'geelooy-spectral-shell'], 'shell revelation');
assertTokens(tiferes, ['YesodShellStyleGateway', 'BinahShellRouteIdentity', 'bindSharedCovenants'], 'shell collaborators');
assertTokens(performance, ['deviceMemory', 'hardwareConcurrency', 'saveData', 'g-performance-lean'], 'performance profile');
assertTokens(home, ['/heichelos/ikar', 'data-profile-mount', 'data-menu-root', '/scripts/home-simple/index.js'], 'Home');
assertTokens(homeEntry, ['HomeTiferesRuntime', 'revealHomeTiferes', '.connect()'], 'Home public runtime entry');
assertTokens(games, ['social/shell/boot.js', 'g-content-region', 'data-geelooy-route="games"'], 'Games');
assert.doesNotMatch(games, /nav\/header\.html/);

const boundedModules = {
	shell,
	routeLink,
	routeState,
	ribbon,
	header,
	icons,
	menu,
	search,
	searchView,
	suggestions,
	boot,
	domem,
	yesodStyles,
	binahRoute,
	tiferes,
	performance,
	homeEntry
};
for (const [malchusName, source] of Object.entries(boundedModules)) {
	assert.ok(countMalchusLines(source) <= 120, `${malchusName} must stay within 120 lines`);
}
assert.ok(!shell.includes('g-rail') && !header.includes('g-rail'));
console.log('B"H appShellContract.test passed');
