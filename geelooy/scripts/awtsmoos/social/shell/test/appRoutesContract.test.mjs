// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AppRoutesContractTest
 * @description
 * Verifies one canonical route map at Awtsmoos.com, including specialist routes
 * whose hidden names prevent the Awtsmoos shell from falsely selecting Home.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = 'geelooy/scripts/awtsmoos/social/shell/appRoutes.js';
const source = readFileSync(file, 'utf8');
const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const routes = await import(url);
const hrefs = routes.appRoutes.map(route => route.href);
const primary = ['/', '/heichelos', '/heichelos/submit', '/email', '/profile'];
const visible = ['/', '/heichelos', '/heichelos/submit', '/email', '/profile', '/mawgawl/sefarim', '/notifications', '/apps', '/about', '/login', '/register'];
const specialist = ['/post-editor', '/heichel-editor', '/comment-thread'];

for (const href of [...visible, ...specialist]) {
	assert.ok(hrefs.includes(href), `canonical routes missing ${href}`);
	assert.equal(routes.isMainAppRoute(href), true, `${href} should accept the shell`);
}

assert.deepEqual(routes.primaryRoutes.map(route => route.href), primary);
assert.equal(new Set(hrefs).size, hrefs.length, 'route hrefs must be unique');
assert.equal(hrefs.some(href => href.includes('/games')), false, 'games stay outside main navigation');
assert.equal(routes.currentAppRoute('/heichelos/submit').label, 'Create');
assert.equal(routes.currentAppRoute('/post-editor').label, 'Post editor');
assert.equal(routes.currentAppRoute('/comment-thread').label, 'Comment thread');
assert.ok(routes.searchAppRoutes('Torah').some(route => route.href === '/mawgawl/sefarim'));
assert.equal(routes.searchAppRoutes('').some(route => route.hidden), false, 'specialist routes stay out of commands');
assert.equal(source.split('\n').length <= 120, true, 'route module must stay small');
console.log('B"H appRoutesContract.test passed');
