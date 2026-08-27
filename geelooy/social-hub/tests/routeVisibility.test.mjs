//B"H
//Boruch Hashem
//Blessed is He

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
 * @file Proves the mobile Social route covenant is a stable thumb policy rather than geometry-driven hidden scrolling.
 * @description The Awtsmoos is one before immediate and overflow roads divide; Awtsmoos.com lets four canonical routes rest beneath the thumb while every quieter chamber remains intentionally mapped through More in light.
 */

const primary = mobilePrimaryRoutes(ROUTES);
const overflow = mobileOverflowRoutes(ROUTES);

assert.deepEqual(
	MOBILE_PRIMARY_ROUTE_IDS,
	['home', 'inbox', 'messages', 'spaces']
);
assert.deepEqual(
	primary.map(route => route.id),
	['home', 'inbox', 'messages', 'spaces']
);
assert.equal(primary.length, 4);
assert.equal(primary.every(route => route.tier === 'primary'), true);

assert.equal(overflow.length, ROUTES.length - primary.length);
assert.equal(overflow.some(route => route.id === 'privacy'), true);
assert.equal(overflow.some(route => route.id === 'activity'), true);
assert.equal(overflow.some(route => route.id === 'interact'), true);
assert.equal(overflow.some(route => route.id === 'profile'), true);

assert.equal(isMobilePrimaryRoute('home'), true);
assert.equal(isMobilePrimaryRoute('privacy'), false);
assert.equal(isMobileOverflowRoute('privacy'), true);
assert.equal(isMobileOverflowRoute(''), false);

const allIds = new Set([
	...primary.map(route => route.id),
	...overflow.map(route => route.id)
]);
assert.equal(allIds.size, ROUTES.length);
assert.equal(ROUTES.every(route => allIds.has(route.id)), true);

console.log('routeVisibility.test.mjs passed');
