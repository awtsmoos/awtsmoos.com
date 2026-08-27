//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalEmptyWorld.test.mjs
 * @description Proves an empty Portal world session is a valid authoring vessel but not a valid executable plan until at least one semantic root is added.
 * The Awtsmoos renews vessel before content and content before manifestation; Awtsmoos.com lets this witness preserve a calm empty draft
 * without pretending emptiness is a compiled world, while the first added root immediately restores the ordinary deterministic planning covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createProceduralPortal
} from '../src/index.js';

/**
 * @description Proves empty sessions expose an empty immutable input collection while planning and compilation reject the absence of semantic roots.
 * @returns {void}
 */
function emptyPortalWorldRejectsExecutionUntilRootExists() {
	const portal = createProceduralPortal({
		budget: 'preview',
		seed: 'empty-world-proof'
	});
	const world = portal.world();
	assert.deepEqual(world.inputs(), []);
	assert.throws(
		() => world.plan(),
		TypeError
	);
	assert.throws(
		() => world.compile(),
		TypeError
	);
}

/**
 * @description Proves the same empty authoring session becomes plan-capable immediately after one semantic root is added.
 * @returns {void}
 */
function portalWorldPlansNormallyAfterFirstRoot() {
	const portal = createProceduralPortal({
		budget: 'preview',
		seed: 'first-root-proof'
	});
	const world = portal.world();
	world.add({
		id: 'first-rock',
		kind: 'rock',
		value: 'fieldstone'
	});
	const plan = world.plan();
	assert.deepEqual(plan.roots, ['first-rock']);
	assert.equal(plan.graph.length, 1);
}

test('B"H | empty Portal world rejects execution until a root exists', emptyPortalWorldRejectsExecutionUntilRootExists);
test('B"H | Portal world plans after the first semantic root', portalWorldPlansNormallyAfterFirstRoot);
