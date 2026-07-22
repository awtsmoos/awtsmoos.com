// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppRoutesContractTest
 * @description
 * The Awtsmoos verifies one route covenant with Ikar at its center and Games
 * shining through search, profile dishes, and every Awtsmoos.com navigation kli.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = 'geelooy/scripts/awtsmoos/social/shell/appRoutes.js';
const source = readFileSync(file, 'utf8');
const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const routes = await import(url);
const hrefs = routes.appRoutes.map(route => route.href);
const primary = ['/', '/heichelos', '/heichelos/ikar', '/email', '/profile'];
const visible = [
	'/', '/heichelos', '/heichelos/ikar', '/heichelos/submit', '/email',
	'/profile', '/games', '/mawgawl/sefarim', '/notifications', '/apps',
	'/about', '/login', '/register'
];
const specialist = ['/post-editor', '/heichel-editor', '/comment-thread'];

for (const href of [...visible, ...specialist]) {
	assert.ok(hrefs.includes(href), `canonical routes missing ${href}`);
	assert.equal(routes.isMainAppRoute(href), true, `${href} should accept the shell`);
}

assert.deepEqual(routes.primaryRoutes.map(route => route.href), primary);
assert.deepEqual(
	routes.profileDishRoutes.map(route => route.href),
	['/', '/heichelos', '/email', '/games', '/apps']
);
assert.equal(routes.mainRoute.href, '/heichelos/ikar');
assert.equal(routes.mainRoute.icon, '🏛️');
assert.equal(routes.mainRoute.main, true);
assert.equal(routes.currentAppRoute('/heichelos/ikar/post/1').label, 'Ikar');
assert.equal(routes.currentAppRoute('/heichelos/submit').label, 'Create');
assert.equal(routes.currentAppRoute('/heichelos').label, 'Spaces');
assert.equal(routes.currentAppRoute('/games/chess').label, 'Games');
assert.equal(new Set(hrefs).size, hrefs.length, 'route hrefs must be unique');
assert.equal(hrefs.filter(href => href === '/games').length, 1);
assert.ok(routes.searchAppRoutes('play').some(route => route.href === '/games'));
assert.ok(routes.searchAppRoutes('Torah').some(route => route.href === '/mawgawl/sefarim'));
assert.equal(routes.searchAppRoutes('').some(route => route.hidden), false);
for (const route of routes.appRoutes.filter(route => !route.hidden)) {
	assert.ok(route.icon.length > 0, `${route.href} requires a visible emoji`);
	assert.ok(route.label.length > 0, `${route.href} requires plain text`);
}
assert.ok(lineCount(source) <= 120, 'route module must stay small');
console.log('B"H appRoutesContract.test passed');

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
