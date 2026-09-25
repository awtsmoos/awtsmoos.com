//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppShellContractTest
 * @description
 * The Awtsmoos verifies one light shell composer above focused route, dock, search, and lifecycle vessels;
 * Awtsmoos.com may split responsibility inwardly without losing one canonical navigation covenant outwardly.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const lines = source => source.split('\n').length;
const requireTokens = (source, tokens, label) => {
	for (const token of tokens) {
		assert.ok(source.includes(token), `${label} missing ${token}`);
	}
};

const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const shellRoutes = read('geelooy/scripts/awtsmoos/social/shell/AppShellRouteLinks.js');
const routeLink = read('geelooy/scripts/awtsmoos/social/shell/routeLink.js');
const routeState = read('geelooy/scripts/awtsmoos/social/shell/routeCurrentState.js');
const ribbon = read('geelooy/scripts/awtsmoos/social/shell/contextRibbon.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const icons = read('geelooy/scripts/awtsmoos/social/shell/headerIcons.js');
const menu = read('geelooy/scripts/awtsmoos/social/shell/constellationMenu.js');
const search = read('geelooy/scripts/awtsmoos/social/shell/headerSearch.js');
const searchView = read('geelooy/scripts/awtsmoos/social/shell/headerSearchView.js');
const suggestions = read('geelooy/scripts/awtsmoos/social/shell/headerSearchSuggestions.js');
const boot = read('geelooy/scripts/awtsmoos/social/shell/boot.js');
const vessel = read('geelooy/scripts/awtsmoos/social/shell/foundations/ShellDocumentVessel.js');
const styles = read('geelooy/scripts/awtsmoos/social/shell/revelation/ShellStyleGateway.js');
const identity = read('geelooy/scripts/awtsmoos/social/shell/revelation/ShellRouteIdentity.js');
const revelation = read('geelooy/scripts/awtsmoos/social/shell/revelation/ShellRevelation.js');
const performance = read('geelooy/scripts/awtsmoos/social/shell/performanceProfile.js');
const home = read('geelooy/index.html');
const homeEntry = read('geelooy/scripts/home-simple/index.js');
const games = read('geelooy/games/index.html');

requireTokens(shell, ['createUnusualHeader', 'createContextRibbon', 'createAppShellDock', 'markAppShellCurrentLinks'], 'app shell');
assert.doesNotMatch(shell, /createMalchusRouteLink|function createDockLink|className = 'g-dock'/);
requireTokens(shellRoutes, ['g-dock', 'dockRoutes', 'createMalchusRouteLink', 'aria-current', 'a[data-g-route-link]'], 'shell route links');
requireTokens(routeLink, ['g-route-icon', 'g-route-label', 'profile-route-dish'], 'route link');
assert.match(routeLink, /data\.gamesRoute|dataset\.gamesRoute/);
requireTokens(routeState, ['isCanonicalRouteLink', 'normalizeRoutePath', 'linkUrl.origin'], 'route state');
requireTokens(ribbon, ['data-g-context-visible', 'g-context-title', 'g-context-action'], 'context ribbon');
requireTokens(header, ['awtsmoosificationalisticaticalism', 'createProfileDropdown', 'createHeaderSearch', 'bindConstellationMenu'], 'header');
requireTokens(icons, ['search:', 'mail:', 'bell:', 'compass:'], 'header icons');
requireTokens(menu, ['Escape', 'restoreFocus', 'button.focus()', 'data-global-menu-open'], 'menu');
requireTokens(search, ['createHeaderSearchView', 'bindSearchLifecycle', 'renderSearchSuggestions', 'bindHeaderSearchKeyboard'], 'search');
requireTokens(searchView, ["form.action = '/mawgawl/sefarim'", "input.name = 'q'", "form.method = 'get'"], 'search view');
requireTokens(suggestions, ['searchAppRoutes', '/mawgawl/sefarim', 'encodeURIComponent'], 'suggestions');
requireTokens(boot, ['bootGeelooyShell', 'TiferesShellRevelation', 'scheduleShellBoot'], 'boot');
requireTokens(vessel, ['DomemShellDocumentVessel', 'isShellEligible', 'findYesod'], 'document vessel');
requireTokens(styles, ['YesodShellStyleGateway', 'interface-dark-013', 'geelooyAppStyle'], 'style gateway');
requireTokens(identity, ['BinahShellRouteIdentity', 'currentAppRoute', 'revealThemeName'], 'route identity');
requireTokens(revelation, ['extends DomemShellDocumentVessel', 'ensureAppShell', 'applyPerformanceProfile', 'bindSharedCovenants'], 'revelation');
requireTokens(performance, ['deviceMemory', 'hardwareConcurrency', 'saveData', 'g-performance-lean'], 'performance');
requireTokens(home, ['/heichelos/ikar', 'data-profile-mount', 'data-menu-root', '/scripts/home-simple/index.js'], 'home');
requireTokens(homeEntry, ['HomeTiferesRuntime', 'revealHomeTiferes', '.connect()'], 'home runtime');
requireTokens(games, ['social/shell/boot.js', 'g-content-region', 'data-geelooy-route="games"'], 'games');
assert.doesNotMatch(games, /nav\/header\.html/);

for (const [name, source] of Object.entries({ shell, shellRoutes, routeLink, routeState, ribbon, header, icons, menu, search, searchView, suggestions, boot, vessel, styles, identity, revelation, performance, homeEntry })) {
	assert.ok(lines(source) <= 120, `${name} must stay within 120 lines`);
}
assert.ok(!shell.includes('g-rail') && !header.includes('g-rail'));
console.log('B"H appShellContract.test passed');
