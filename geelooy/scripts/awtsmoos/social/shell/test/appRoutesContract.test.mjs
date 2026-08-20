// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppRoutesContractTest
 * @description
 * The Awtsmoos verifies one route covenant while Awtsmoos.com distinguishes full
 * discovery from the five destinations worthy of permanent compact-dock space.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const routeFile = 'geelooy/scripts/awtsmoos/social/shell/appRoutes.js';
const definitionFile = 'geelooy/scripts/awtsmoos/social/shell/appRouteDefinitions.js';
const matcherFile = 'geelooy/scripts/awtsmoos/social/shell/routeMatchers.js';
const routes = await import(pathToFileURL(routeFile).href + `?v=${Date.now()}`);
const hrefs = routeHrefs(routes.appRoutes);
const primary = ['/', '/heichelos', '/social-hub', '/heichelos/ikar', '/email', '/profile'];
const dock = ['/', '/heichelos', '/social-hub', '/profile', '/mawgawl/sefarim'];
const visible = [
	'/', '/heichelos', '/social-hub', '/heichelos/ikar', '/email', '/profile',
	'/mawgawl/sefarim', '/notifications', '/apps/universal-chat/', '/games',
	'/apps', '/os', '/heichelos/submit', '/contact/', '/about', '/login', '/register'
];
const specialist = ['/post-editor', '/heichel-editor', '/comment-thread'];
const requiredProfileDishes = ['/', '/heichelos', '/email', '/games', '/apps'];

for (const href of [...visible, ...specialist]) {
	assert.ok(hrefs.includes(href), `canonical routes missing ${href}`);
	assert.equal(routes.isMainAppRoute(href), true, `${href} should accept the shell`);
}

assert.deepEqual(routeHrefs(routes.primaryRoutes), primary);
assert.deepEqual(routeHrefs(routes.dockRoutes), dock);
assert.equal(routes.dockRoutes.length, 5, 'compact dock must remain intentionally bounded');
for (const href of requiredProfileDishes) {
	assert.ok(routeHrefs(routes.profileDishRoutes).includes(href), `profile dishes missing ${href}`);
}

assert.equal(routes.mainRoute.href, '/heichelos/ikar');
assert.equal(routes.currentAppRoute('/social-hub').label, 'Social');
assert.equal(routes.currentAppRoute('/heichelos/ikar/post/1').label, 'Ikar');
assert.equal(routes.currentAppRoute('/heichelos/submit').label, 'Create');
assert.equal(routes.currentAppRoute('/games/chess').label, 'Games');
assert.equal(new Set(hrefs).size, hrefs.length, 'route hrefs must be unique');
assert.equal(includesRoute(routes.searchAppRoutes('post, comment'), '/social-hub'), true);
assert.equal(includesRoute(routes.searchAppRoutes('Torah'), '/mawgawl/sefarim'), true);
assert.equal(includesRoute(routes.searchAppRoutes('discussion'), '/apps/universal-chat/'), true);
assert.equal(hasHiddenRoute(routes.searchAppRoutes('')), false);

for (const routeItem of routes.appRoutes) {
	if (!routeItem.hidden) {
		assert.ok(routeItem.icon.length > 0, `${routeItem.href} requires a visible icon`);
		assert.ok(routeItem.label.length > 0, `${routeItem.href} requires plain text`);
	}
}

for (const file of [routeFile, definitionFile, matcherFile]) {
	assert.ok(lineCount(readFileSync(file, 'utf8')) <= 120, `${file} must stay small`);
}
console.log('B"H appRoutesContract.test passed');

function routeHrefs(routeItems) {
	return routeItems.map(routeItem => routeItem.href);
}

function includesRoute(routeItems, href) {
	return routeHrefs(routeItems).includes(href);
}

function hasHiddenRoute(routeItems) {
	return routeItems.some(routeItem => routeItem.hidden);
}

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
