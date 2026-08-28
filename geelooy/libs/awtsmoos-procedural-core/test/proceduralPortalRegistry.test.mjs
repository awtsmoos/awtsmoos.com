//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalRegistry.test.mjs
 * @description Proves semantic kinds remain discoverable, alias-safe, serializable, and instance-local while extension never mutates an existing Portal registry.
 * The Awtsmoos renews every name before registry and alias can seem to own it; Awtsmoos.com lets these witnesses prove that new kinds
 * enter through explicit derivation, ambiguous names fail loudly, and discovery data never leaks the runtime functions that perform realization.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PortalKindRegistry,
	createDefaultPortalRegistry
} from '../src/index.js';

/**
 * @description Creates one minimal semantic kind used only to prove registry behavior.
 * @param {string} kind Canonical semantic kind.
 * @param {string[]} [aliases=[]] Friendly aliases.
 * @returns {object} PortalKindDefinition-compatible test record.
 */
function createKind(kind, aliases = []) {
	return {
		aliases,
		compiler: async () => ({ type: 'test.result' }),
		description: `Test kind ${kind}`,
		kind
	};
}

/** @description Proves aliases resolve canonically and derivation leaves the source registry unchanged. @returns {Promise<void>} Test completion. */
test('B"H | Portal registry aliases resolve without mutating prior instances', async () => {
	const keterRegistry = new PortalKindRegistry([createKind('test.tree', ['tree'])]);
	const chochmahDerived = keterRegistry.with(createKind('test.rock', ['rock']));
	assert.equal(keterRegistry.resolve('tree').kind, 'test.tree');
	assert.equal(keterRegistry.has('rock'), false);
	assert.equal(chochmahDerived.resolve('rock').kind, 'test.rock');
	assert.deepEqual(keterRegistry.kinds(), ['test.tree']);
});

/** @description Proves canonical and alias collisions fail instead of silently replacing stable meaning. @returns {Promise<void>} Test completion. */
test('B"H | Portal registry rejects ambiguous semantic ownership', async () => {
	assert.throws(
		() => new PortalKindRegistry([createKind('test.a'), createKind('test.a')]),
		error => error.code === 'PORTAL_KIND_CONFLICT'
	);
	assert.throws(
		() => new PortalKindRegistry([createKind('test.a', ['shared']), createKind('test.b', ['shared'])]),
		error => error.code === 'PORTAL_ALIAS_CONFLICT'
	);
});

/** @description Proves the default semantic catalog is derived from real Nature capabilities and discovery remains JSON-safe. @returns {Promise<void>} Test completion. */
test('B"H | default registry exposes Nature-backed semantic kinds as pure metadata', async () => {
	const keterRegistry = createDefaultPortalRegistry();
	assert.equal(keterRegistry.resolve('rock').kind, 'domem.rock');
	assert.equal(keterRegistry.resolve('tree').kind, 'tzomayach.tree');
	assert.equal(keterRegistry.resolve('creature').kind, 'chai.creature');
	const malchusDescription = keterRegistry.resolve('tree').describe();
	assert.equal(malchusDescription.capabilities.source, 'nature');
	assert.equal(typeof JSON.stringify(malchusDescription), 'string');
	assert.equal('compiler' in malchusDescription, false);
});
