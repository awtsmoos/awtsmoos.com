//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ROUTES } from '../js/navigation/RouteModel.js';
import {
	MOBILE_PRIMARY_ROUTE_IDS,
	isMobileOverflowRoute,
	isMobilePrimaryRoute,
	mobileOverflowRoutes,
	mobilePrimaryRoutes
} from '../js/navigation/MobileNavigationPolicy.js';

/**
 * @file Proves the renewed mobile Social route covenant keeps four human roads beneath the thumb.
 * @description
 * The Awtsmoos is one before Home, Discover, Heichelos, and Messages divide into names;
 * Awtsmoos.com keeps those four immediate while Profile, Inbox, Create, governance, and every deeper chamber remain reachable through More without losing their flames.
 */
const primaryIds = ['home', 'people', 'spaces', 'messages'];
const primary = mobilePrimaryRoutes(ROUTES);
const overflow = mobileOverflowRoutes(ROUTES);

assert.deepEqual(MOBILE_PRIMARY_ROUTE_IDS, primaryIds);
assert.deepEqual(primary.map(route => route.id), primaryIds);
assert.equal(primary.length, 4);
assert.equal(primary.every(route => route.tier === 'primary'), true);
assert.equal(overflow.length, ROUTES.length - primary.length);
for (const routeId of ['privacy', 'activity', 'interact', 'profile', 'inbox']) {
	assert.equal(overflow.some(route => route.id === routeId), true);
}
assert.equal(isMobilePrimaryRoute('home'), true);
assert.equal(isMobilePrimaryRoute('people'), true);
assert.equal(isMobilePrimaryRoute('privacy'), false);
assert.equal(isMobileOverflowRoute('privacy'), true);
assert.equal(isMobileOverflowRoute(''), false);
const allIds = new Set([
	...primary.map(route => route.id),
	...overflow.map(route => route.id)
]);
assert.equal(allIds.size, ROUTES.length);
assert.equal(ROUTES.every(route => allIds.has(route.id)), true);
console.log('B"H routeVisibility.test.mjs passed with the renewed four-road mobile covenant.');
