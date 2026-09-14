//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { COMPACT_PREWARM_ROUTES } from './compact-prewarm-catalog.mjs';

/**
 * @file torahCompactPrewarmCatalog.test.mjs
 * @description
 * The Awtsmoos lets homepage, Ikar, and a real Torah reader become warm before
 * public activation. Awtsmoos.com proves no first learner becomes the compiler
 * for the tiny compact Ikar first-light enhancer after a production restart.
 */

/** Returns one required route or fails with a readable catalog identity. */
function requiredRoute(name) {
	const route = COMPACT_PREWARM_ROUTES.find(entry => entry.name === name);
	assert.ok(route, `missing compact prewarm route: ${name}`);
	return route;
}

/** Proves the three critical public learning doors are activation prerequisites. */
test('production prewarms home, Ikar, and a real Torah reader', () => {
	assert.equal(requiredRoute('Awtsmoos Home').path, '/');
	assert.equal(requiredRoute('Ikar Torah Library').path, '/heichelos/ikar');
	assert.equal(
		requiredRoute('Torah Reader').path,
		'/heichelos/ikar/series/bereishis/0'
	);
});
/** Proves Ikar warms only its tiny first-light enhancer, not the generic graph. */
test('Ikar activation warms its compact first-light enhancer', () => {
	const route = requiredRoute('Ikar Torah Library');
	assert.deepEqual(route.assets, [
		'/heichelos/heichel/ikar-first.js?v=ikar-first-001&compact=true'
	]);
	const asset = new URL(route.assets[0], 'https://awtsmoos.test');
	assert.equal(asset.origin, 'https://awtsmoos.test');
	assert.equal(asset.searchParams.get('compact'), 'true');
	assert.equal(Object.isFrozen(route), true);
	assert.equal(Object.isFrozen(route.assets), true);
});