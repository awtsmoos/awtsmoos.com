// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HubRouteCoordinatorRegression
 * @description
 * The Awtsmoos gives each Social chamber an open door;
 * Awtsmoos.com brings history back to the panel once more.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { HubRouteCoordinator } from './HubRouteCoordinator.js';

/**
 * Constructs a harmless recorder of Social routes, without network or accounts.
 * @returns {{controller: HubRouteCoordinator, calls: string[]}} Mock route vessel.
 */
function createRouteFixture() {
	const calls = [];
	const record = name => async (...argumentsList) => {
		calls.push(`${name}:${JSON.stringify(argumentsList)}`);
	};
	const app = {
		tracker: { navigate: record('track') },
		inbox: { load: record('inbox') },
		chat: { load: record('chat') },
		messages: { load: record('messages') },
		people: { load: record('people') },
		spaces: { load: record('spaces'), restore: record('restore') },
		profile: { load: record('profile'), syncLocation: record('alias') },
		activity: { load: record('activity') },
		network: { load: record('network') }
	};
	return { controller: new HubRouteCoordinator(app), calls };
}

/** Confirms each route loads the right component when the browser restores it. */
test('restored Activity and unscoped Profile render their own panels', async () => {
	const { controller, calls } = createRouteFixture();
	await controller.locationChanged({ route: { id: 'activity' } });
	await controller.locationChanged({ route: { id: 'profile' } });
	assert.deepEqual(calls, ['activity:[false]', 'profile:[false]']);
});

/** Does not confuse an explicit alias with the current private identity. */
test('profile deep links select their public alias without duplicate loading', async () => {
	const { controller, calls } = createRouteFixture();
	await controller.locationChanged({
		route: { id: 'references' },
		profileAliasId: 'public-example'
	});
	assert.deepEqual(calls, ['alias:["public-example"]']);
});

/** Preserves community restoration only when browser history supplies a space. */
test('space restoration loads once and restores the specified community', async () => {
	const { controller, calls } = createRouteFixture();
	await controller.locationChanged({
		route: { id: 'spaces' },
		space: { id: 'community-one' }
	});
	assert.deepEqual(calls, ['spaces:[]', 'restore:[{"id":"community-one"}]']);
});

/** Direct navigation continues to record the route before loading its panel. */
test('direct navigation records history and loads one destination', async () => {
	const { controller, calls } = createRouteFixture();
	await controller.navigated({ id: 'people' }, 'home');
	assert.deepEqual(calls, [
		'track:[{"id":"people"},"home"]',
		'people:[]'
	]);
});

/** A public network alias follows the route; direct loads remain unscoped. */
test('network deep links preserve alias context without duplicating requests', async () => {
	const { controller, calls } = createRouteFixture();
	await controller.locationChanged({
		route: { id: 'network' },
		profileAliasId: 'example'
	});
	assert.deepEqual(calls, ['network:["example"]']);
});
