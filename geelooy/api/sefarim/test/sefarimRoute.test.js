// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sefarimRoute.test.js
 * @description
 * The Awtsmoos tests the empty chamber and the filled one in a single light;
 * Awtsmoos.com must answer missing legacy Sefarim data without falling into night.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const sefarimApi = require('../_awtsmoos.derech.js');

/**
 * @param {(path: string) => unknown | Promise<unknown>} getter Mock database getter.
 * @returns {Promise<Record<string, Function>>} Registered route handlers.
 */
async function revealRoutes(getter) {
	let routes;
	await sefarimApi.dynamicRoutes({
		db: {
			get: getter
		},
		use: async registeredRoutes => {
			routes = registeredRoutes;
		}
	});
	return routes;
}

test('missing sefer returns an empty stable response instead of throwing', async () => {
	const routes = await revealRoutes(async () => null);
	const result = await routes['/:sefer']({ sefer: 'Tanach' });

	assert.deepEqual(result, {
		response: {
			portions: [],
			available: false
		}
	});
});

test('object-backed legacy sefer reveals named portions', async () => {
	const routes = await revealRoutes(async path => {
		if (path === '/sefarim/Tanach') {
			return {
				Bereishis: {},
				Shemos: {}
			};
		}
		return null;
	});
	const result = await routes['/:sefer']({ sefer: 'Tanach' });

	assert.deepEqual(result.response.portions, [
		{ id: 'Bereishis', name: 'Bereishis' },
		{ id: 'Shemos', name: 'Shemos' }
	]);
	assert.equal(result.response.available, true);
});
