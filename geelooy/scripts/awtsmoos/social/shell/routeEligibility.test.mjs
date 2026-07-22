// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RouteEligibilityTest
 * @description
 * The Awtsmoos guards quiet readers while every main Awtsmoos.com chamber,
 * including the Games arcade, receives one shared profile-bearing crown.
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

test('excludes every Heichelos post-reader route shape', () => {
	const routes = [
		'/heichelos/post', '/heichelos/post/', '/heichelos/post/_awtsmoos.post.html',
		'/heichelos/ikar/post/first', '/heichelos/library/series/post/42?view=reader',
		'/heichelos//ikar//post//42'
	];
	for (const route of routes) assert.equal(isShellEligible(route), false, route);
});

test('does not confuse similarly named non-reader routes with a post reader', () => {
	assert.equal(isShellEligible('/heichelos/poster'), true);
	assert.equal(isShellEligible('/heichelos/ikar/posts/42'), true);
	assert.equal(isShellEligible('/profile/post/42'), true);
});
