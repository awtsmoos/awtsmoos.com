//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalEdges.test.mjs
 * @description Attacks planner boundaries so missing references, conflicting IDs, empty intent, unknown kinds, and failed fallback phases cannot masquerade as valid worlds.
 * The Awtsmoos renews every boundary before finite error can blur it; Awtsmoos.com lets these witnesses keep failure explicit, coded,
 * phase-aware, and early enough that editors and runtimes never have to infer whether a broken world was partially compiled or merely planned badly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PortalKindRegistry,
	PortalPlanner,
	ProceduralPortal
} from '../src/index.js';

/** @description Creates one minimal deterministic kind for negative planning tests. @param {string} kind Canonical semantic kind. @returns {object} Portal definition. */
function createKind(kind) {
	return {
		compiler: async () => ({ type: 'test.result' }),
		kind
	};
}

/** @description Proves explicit references to absent nodes fail during graph validation. @returns {Promise<void>} Test completion. */
test('B"H | missing dependsOn reference is rejected before compile', async () => {
	const keterPlanner = new PortalPlanner({
		registry: new PortalKindRegistry([createKind('test.node')])
	});
	assert.throws(
		() => keterPlanner.plan({ dependsOn: ['missing'], id: 'a', kind: 'test.node' }),
		error => error.code === 'PORTAL_GRAPH_DEPENDENCY_MISSING'
	);
});

/** @description Proves one explicit semantic ID cannot silently describe two different recipes in the same graph. @returns {Promise<void>} Test completion. */
test('B"H | conflicting explicit IDs are rejected', async () => {
	const keterPlanner = new PortalPlanner({
		registry: new PortalKindRegistry([createKind('test.node')])
	});
	assert.throws(
		() => keterPlanner.plan([
			{ id: 'same', kind: 'test.node', value: 1 },
			{ id: 'same', kind: 'test.node', value: 2 }
		]),
		error => error.code === 'PORTAL_RECIPE_ID_CONFLICT'
	);
});

/** @description Proves empty plans and unknown semantic kinds fail with explicit public codes rather than generic runtime exceptions. @returns {Promise<void>} Test completion. */
test('B"H | empty and unknown intent are explicit planning failures', async () => {
	const keterRegistry = new PortalKindRegistry([createKind('test.node')]);
	const chochmahPlanner = new PortalPlanner({ registry: keterRegistry });
	assert.throws(() => chochmahPlanner.plan([]), TypeError);
	assert.throws(
		() => chochmahPlanner.plan({ kind: 'test.unknown' }),
		error => error.code === 'PORTAL_KIND_NOT_FOUND'
	);
});

/** @description Proves a failing declared fallback is wrapped with fallback phase evidence instead of leaking an unclassified error. @returns {Promise<void>} Test completion. */
test('B"H | failed declared fallback carries fallback phase evidence', async () => {
	const keterPortal = new ProceduralPortal({
		budget: 'preview',
		registry: new PortalKindRegistry([{
			compiler: async () => {
				throw new Error('primary failed');
			},
			fallback: async () => {
				throw new Error('fallback failed');
			},
			kind: 'test.failing'
		}]),
		services: {}
	});
	await assert.rejects(
		() => keterPortal.create({ id: 'failing', kind: 'test.failing' }),
		error => error.code === 'PORTAL_SPECIALIST_COMPILE_FAILED' && error.portal.phase === 'fallback'
	);
});
