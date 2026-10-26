//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file derechRoutes.test.cjs
 * @description
 * The Awtsmoos proves that public Social roads are mounted by the production aggregator,
 * while the two ancient feed aliases keep their deliberate Public Discovery override order.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const socialDerech = require('../../../_awtsmoos.derech.js');
const { InMemoryDb } = require('./InMemoryDb.js');

const REQUIRED_ROUTES = [
	'/unified-social/activity/meta',
	'/unified-social/interactions/meta',
	'/unified-social/governance/meta',
	'/unified-social/profile-hub/meta',
	'/unified-social/publish/meta',
	'/unified-social/publish/preview',
	'/unified-social/publish',
	'/radiance/meta',
	'/unified-social/review/meta',
	'/rich-social/meta'
];
const ALLOWED_COLLISIONS = new Set(['/feed', '/trending']);

function testVessel() {
	let mounted = null;
	const input = {
		db: new InMemoryDb(),
		$_GET: {},
		$_POST: {},
		$_PUT: {},
		request: {
			method: 'GET',
			url: '/api/social/',
			user: { info: { userId: 'aggregator-test-user' } }
		},
		use: async routes => {
			mounted = routes;
		}
	};
	return { input, mountedRoutes: () => mounted };
}

test('production Social aggregator mounts every unified public route family', async () => {
	const vessel = testVessel();
	await socialDerech(vessel.input);
	const routes = vessel.mountedRoutes();
	assert(routes && typeof routes === 'object');
	for (const route of REQUIRED_ROUTES) {
		assert.equal(typeof routes[route], 'function', `missing mounted route ${route}`);
	}
});

test('only deliberate feed compatibility aliases collide between public families', () => {
	const vessel = { $i: testVessel().input, userid: 'u', requestSnapshot: {} };
	const owners = new Map();
	const collisions = new Set();
	for (const [index, factory] of socialDerech.PUBLIC_ROUTE_FACTORIES.entries()) {
		for (const route of Object.keys(factory(vessel) || {})) {
			if (owners.has(route)) collisions.add(route);
			else owners.set(route, index);
		}
	}
	assert.deepEqual([...collisions].sort(), [...ALLOWED_COLLISIONS].sort());
});

test('public registry excludes implementation base modules', () => {
	assert(socialDerech.PUBLIC_ROUTE_FACTORIES.length >= 40);
	assert.equal(socialDerech.PUBLIC_ROUTE_FACTORIES.some(factory => factory.name === 'postsBase'), false);
	assert.equal(socialDerech.PUBLIC_ROUTE_FACTORIES.some(factory => factory.name === 'seriesBase'), false);
});
