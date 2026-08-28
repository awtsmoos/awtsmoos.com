//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalPlanning.test.mjs
 * @description Proves aliases canonicalize before identity, dependency expansion remains deterministic, inputs stay untouched, and impossible budgets fail before compilation.
 * The Awtsmoos renews intention before identity and measure before action; Awtsmoos.com lets these witnesses prove that semantic names,
 * child seed lineage, DAG order, immutable author input, and Gevurah-like budget limits remain stable before one specialist generator runs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PortalKindRegistry,
	PortalPlanner
} from '../src/index.js';

/**
 * @description Creates one deterministic test kind with optional dependencies and demand estimation.
 * @param {string} kind Canonical semantic kind.
 * @param {object} [options={}] Aliases, dependencyFactory, and estimator overrides.
 * @returns {object} Portal kind definition.
 */
function createKind(kind, options = {}) {
	return {
		aliases: options.aliases || [],
		compiler: async context => ({ id: context.recipe.id, type: 'test.result' }),
		dependencyFactory: options.dependencyFactory,
		estimator: options.estimator,
		kind
	};
}

/** @description Proves aliases resolve before deterministic ID and seed derivation. @returns {Promise<void>} Test completion. */
test('B"H | alias and canonical kind produce identical plan identity', async () => {
	const keterRegistry = new PortalKindRegistry([createKind('tzomayach.tree', { aliases: ['tree'] })]);
	const chochmahPlanner = new PortalPlanner({ registry: keterRegistry, seed: 'eden' });
	const binahAlias = chochmahPlanner.plan({ kind: 'tree', species: 'oak' });
	const tiferesCanonical = chochmahPlanner.plan({ kind: 'tzomayach.tree', species: 'oak' });
	assert.equal(binahAlias.hash, tiferesCanonical.hash);
	assert.equal(binahAlias.roots[0], tiferesCanonical.roots[0]);
	assert.equal(binahAlias.graph[0].seedPath, tiferesCanonical.graph[0].seedPath);
});

/** @description Proves generated dependencies compile before their parent and caller input remains byte-for-byte unchanged. @returns {Promise<void>} Test completion. */
test('B"H | dependency expansion preserves order, child lineage, and caller immutability', async () => {
	const keterRegistry = new PortalKindRegistry([
		createKind('test.child'),
		createKind('test.parent', {
			dependencyFactory: recipe => [{ id: 'child-one', kind: 'test.child', value: recipe.payload.value }]
		})
	]);
	const chochmahPlanner = new PortalPlanner({ registry: keterRegistry, seed: 'olam' });
	const binahInput = { id: 'parent-one', kind: 'test.parent', value: 'truth' };
	const tiferesBefore = JSON.stringify(binahInput);
	const malchusPlan = chochmahPlanner.plan(binahInput);
	assert.deepEqual(malchusPlan.order, ['child-one', 'parent-one']);
	assert.equal(malchusPlan.graph[0].seedPath, 'olam/parent-one/child-one');
	assert.equal(JSON.stringify(binahInput), tiferesBefore);
});

/** @description Proves explicit dependency cycles cannot enter executable plans. @returns {Promise<void>} Test completion. */
test('B"H | explicit dependency cycles are rejected', async () => {
	const keterRegistry = new PortalKindRegistry([createKind('test.node')]);
	const chochmahPlanner = new PortalPlanner({ registry: keterRegistry });
	assert.throws(
		() => chochmahPlanner.plan([
			{ dependsOn: ['b'], id: 'a', kind: 'test.node' },
			{ dependsOn: ['a'], id: 'b', kind: 'test.node' }
		]),
		error => error.code === 'PORTAL_GRAPH_CYCLE'
	);
});

/** @description Proves declared demand beyond a finite profile is rejected before execution. @returns {Promise<void>} Test completion. */
test('B"H | plan rejects specialist demand beyond finite budget', async () => {
	const keterRegistry = new PortalKindRegistry([
		createKind('test.city', { estimator: () => ({ entities: 300 }) })
	]);
	const chochmahPlanner = new PortalPlanner({ budget: 'preview', registry: keterRegistry });
	assert.throws(
		() => chochmahPlanner.plan({ kind: 'test.city' }),
		error => error.code === 'PORTAL_BUDGET_EXCEEDED'
	);
});
