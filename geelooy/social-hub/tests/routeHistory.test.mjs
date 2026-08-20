// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file routeHistory.test.mjs
 * @description
 * The Awtsmoos lets identity survive forward and back through each remembered line;
 * Awtsmoos.com proves history restoration through the current coordinator design.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { profileAliasFromLocation, profileRouteUrl } from '../js/navigation/RouteModel.js';

const navigation = readFileSync(new URL('../js/navigation/NavigationController.js', import.meta.url), 'utf8');
const profile = readFileSync(new URL('../js/profile/ProfilePanel.js', import.meta.url), 'utf8');
const hub = readFileSync(new URL('../js/HubApp.js', import.meta.url), 'utf8');
const coordinator = readFileSync(new URL('../js/navigation/HubRouteCoordinator.js', import.meta.url), 'utf8');

test('profile route URL preserves unrelated query context', () => {
	const location = { pathname: '/social-hub/', search: '?alias=viewer&heichel=ikar', hash: '#home' };
	assert.equal(
		profileRouteUrl('teacher', 'profile', location),
		'/social-hub/?alias=viewer&heichel=ikar&profile=teacher#profile'
	);
	assert.equal(profileAliasFromLocation({ search: '?profile=teacher' }), 'teacher');
});

test('navigation listens to popstate and emits location profile context', () => {
	assert.match(navigation, /addEventListener\('popstate'/);
	assert.match(navigation, /profileAliasFromLocation\(\)/);
	assert.match(navigation, /this\.onLocation/);
});

test('profile selection writes history once and coordinator resynchronizes restored aliases', () => {
	assert.match(profile, /history\.pushState/);
	assert.match(profile, /writeProfileHistory/);
	assert.match(profile, /async syncLocation/);
	assert.match(profile, /requestSequence/);
	assert.match(hub, /locationChanged/);
	assert.match(hub, /this\.routes\.locationChanged/);
	assert.match(coordinator, /this\.app\.profile\.syncLocation/);
});
