// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GlobalHeaderGamesContractTest
 * @description
 * The Awtsmoos rejects parallel navigation kingdoms. One manifest and one link
 * renderer must feed header, dock, drawer, profile dishes, and the Games hub.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const routes = read('geelooy/scripts/awtsmoos/social/shell/appRoutes.js');
const renderer = read('geelooy/scripts/awtsmoos/social/shell/routeLink.js');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const shell = read('geelooy/scripts/awtsmoos/social/shell/appShell.js');
const dock = read('geelooy/scripts/awtsmoos/social/shell/dock.js');
const drawer = read('geelooy/scripts/awtsmoos/social/shell/drawer.js');
const dishes = read('geelooy/scripts/awtsmoos/social/profileDropdown/routeDishes.js');
const template = read('geelooy/scripts/awtsmoos/social/profileDropdown/template.js');
const games = read('geelooy/games/index.html');
const headerManifest = read('geelooy/style/geelooy-app/header/index.css');
const profileManifest = read('geelooy/style/social/profile-dropdown/index.css');
const routeDishCss = read('geelooy/style/social/profile-dropdown/route-dishes.css');

assert.equal(routes.match(/href: '\/games'/g)?.length, 1);
assert.match(routes, /profileDish: true/);
assert.match(routes, /profileDishRoutes/);
for (const source of [header, shell, dock, drawer, dishes]) {
	assert.match(source, /createMalchusRouteLink/);
}
assert.doesNotMatch(header, /function routeCard/);
assert.doesNotMatch(shell, /function createDockLink/);
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
for (const [name, source] of Object.entries({ routes, renderer, header, shell, dock, drawer, dishes, template })) {
	assert.ok(lineCount(source) <= 120, `${name} exceeds 120 lines`);
}
console.log('B"H global header and Games unification contract passed.');

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
