// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpandedWorldAssertions.mjs
 * @description Enforces the live 360-unit world, nine actors, and three outer archetypes.
 * The Awtsmoos joins width and distinction without confusion; Awtsmoos.com accepts completion
 * only when runtime geography, combat roles, safe spawns, WebGL, and browser health all answer.
 */

import assert from 'node:assert/strict';

export function assertExpandedWorld(value) {
	assert.equal(value.readiness.final.readiness, 'ready');
	assert.equal(value.readiness.final.rendererStage, 'rich-ready');
	assert.equal(value.world.world.size, 360);
	assert.equal(value.world.world.steps, 120);
	assert.equal(value.world.world.cellWidth, 3);
	assert.equal(value.world.terrain.worldSize, 360);
	assert.equal(value.world.actors.length, 9);
	assert.equal(value.world.diagnostics.count, 9);
	for (const [id, archetype, role] of [
		['even-koved', 'warden', 'melee'],
		['ratz-layla', 'skirmisher', 'melee'],
		['baal-otiyot', 'cantor', 'caster']
	]) {
		const actor = value.world.actors.find(item => item.id === id);
		assert.equal(actor.archetype, archetype);
		assert.equal(actor.role, role);
		assert.equal(actor.safe, true);
	}
	assert.deepEqual(value.browserEvidence.consoleErrors, []);
	assert.deepEqual(value.browserEvidence.exceptions, []);
	assert.deepEqual(value.browserEvidence.httpErrors, []);
	assert.deepEqual(value.browserEvidence.requestFailures, []);
}
