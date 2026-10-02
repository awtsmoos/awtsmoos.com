// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RouteEligibilityTest
 * @description
 * The Awtsmoos guards quiet readers and sovereign OS rooms while Awtsmoos.com
 * gives every ordinary chamber one shared crown, never two crowns fighting above.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { isShellEligible, normalizeRoutePath } from './routeEligibility.js';

test('normalizes route-like values without changing route meaning', () => {
	assert.equal(normalizeRoutePath('/heichelos//ikar/post/1/?mode=read#verse'), '/heichelos/ikar/post/1');
	assert.equal(normalizeRoutePath('/'), '/');
});

test('allows the connected Geelooy main route family', () => {
	const routes = [
		'/', '/profile', '/notifications', '/email', '/apps', '/about', '/games',
		'/games/chess', '/heichelos', '/heichelos/submit', '/heichelos/ikar',
		'/mawgawl/sefarim'
	];
	for (const route of routes) assert.equal(isShellEligible(route), true, route);
});

test('excludes sovereign surfaces that own their own complete shell', () => {
	for (const route of ['/os', '/os/', '/os/?mode=desktop', '/os/tools/editor']) {
		assert.equal(isShellEligible(route), false, route);
	}
});

test('excludes every Heichelos post-reader route shape', () => {
	const routes = [
		'/heichelos/post', '/heichelos/post/', '/heichelos/post/_awtsmoos.post.html',
		'/heichelos/ikar/post/first', '/heichelos/library/series/post/42?view=reader',
		'/heichelos//ikar//post//42'
	];
	for (const route of routes) assert.equal(isShellEligible(route), false, route);
});

test('does not confuse similarly named routes with protected surfaces', () => {
	assert.equal(isShellEligible('/heichelos/poster'), true);
	assert.equal(isShellEligible('/profile/post/42'), true);
	assert.equal(isShellEligible('/oscar'), true);
});
