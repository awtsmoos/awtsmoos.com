// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GlobalHeaderGamesContractTest
 * @description
 * The Awtsmoos rejects parallel navigation kingdoms while allowing focused route-link owners;
 * Awtsmoos.com keeps one definition catalog and one renderer feeding header, shell dock, drawer, profile dishes, and Games.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const lineCount = content => content.split('\n').length;

const routes = read('geelooy/scripts/awtsmoos/social/shell/appRoutes.js');
const definitions = read('geelooy/scripts/awtsmoos/social/shell/appRouteDefinitions.js');
const renderer = read('geelooy/scripts/awtsmoos/social/shell/routeLink.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const shellRoutes = read('geelooy/scripts/awtsmoos/social/shell/AppShellRouteLinks.js');
const dock = read('geelooy/scripts/awtsmoos/social/shell/dock.js');
const drawer = read('geelooy/scripts/awtsmoos/social/shell/drawer.js');
const dishes = read('geelooy/scripts/awtsmoos/social/profileDropdown/routeDishes.js');
const template = read('geelooy/scripts/awtsmoos/social/profileDropdown/template.js');
const games = read('geelooy/games/index.html');
const headerManifest = read('geelooy/style/geelooy-app/header/index.css');
const profileManifest = read('geelooy/style/social/profile-dropdown/index.css');
const routeDishCss = read('geelooy/style/social/profile-dropdown/route-dishes.css');

assert.equal(definitions.match(/href: '\/games'/g)?.length, 1);
assert.match(definitions, /profileDish: true/);
assert.match(routes, /profileDishRoutes/);
for (const source of [header, shellRoutes, dock, drawer, dishes]) {
	assert.match(source, /createMalchusRouteLink/);
}
assert.match(shell, /createAppShellDock/);
assert.match(shell, /markAppShellCurrentLinks/);
assert.doesNotMatch(shell, /createMalchusRouteLink|function createDockLink/);
assert.doesNotMatch(header, /function routeCard/);
assert.doesNotMatch(dock, /innerHTML|map\(route =>/);
assert.doesNotMatch(drawer, /innerHTML|map\(route =>/);
assert.match(renderer, /constellation/);
assert.match(renderer, /dock/);
assert.match(renderer, /drawer/);
assert.match(renderer, /profileDish/);
assert.match(template, /data-profile-route-dishes/g);
assert.match(dishes, /profileDishRoutes/);
assert.match(games, /social\/shell\/boot\.js/);
assert.match(games, /g-content-region/);
assert.doesNotMatch(games, /nav\/header\.html/);
assert.match(headerManifest, /profile-crown\.css/);
assert.match(profileManifest, /route-dishes\.css/);
assert.match(routeDishCss, /href="\/games"/);

for (const [name, source] of Object.entries({ routes, definitions, renderer, header, shell, shellRoutes, dock, drawer, dishes, template })) {
	assert.ok(lineCount(source) <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H global header and Games unification contract passed.');
