// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hostilePopulationConstruction.test.mjs
 * @description Proves the versioned application import graph constructs indexed hostiles.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createEretzHostilePopulation } from '../../app/EretzActorFactories.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('application factory loads the coherent hostile module graph', () => {
	let attachedGroup = null;
	const population = createEretzHostilePopulation({
		bus: new AwtsmoosEventBus(),
		camera: { position: { x: 0, y: 0, z: 0 } },
		canvas: {},
		ground: { heightAt() { return 0; } },
		qualityProfile: { quality: 'low' },
		scene: { add(group) { attachedGroup = group; } }
	});
	assert.equal(attachedGroup, population.group);
	assert.equal(typeof population.abilitySystem.setActors, 'function');
	assert.equal(population.diagnostics().torahTargeting.actorCount, 1);
	population.destroy();
});
