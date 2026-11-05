// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hostileTorahAbilitySystem.test.mjs
 * @description Proves construction, direct identity, and bounded regional Torah targeting.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { ENEMY_STATE } from '../../world/enemy/EnemyStates.js';
import { HostileNpcPopulation } from '../../world/enemy/HostileNpcPopulation.js';
import { HostileTorahAbilitySystem } from '../../world/enemy/HostileTorahAbilitySystem.js';

test('live hostile population constructs and hydrates the setActors seam', () => {
	const population = new HostileNpcPopulation({
		bus: new AwtsmoosEventBus(),
		camera: { position: { x: 0, y: 0, z: 0 } },
		canvas: {},
		ground: { heightAt() { return 0; } },
		quality: 'low'
	});
	assert.equal(typeof population.abilitySystem.setActors, 'function');
	assert.equal(population.actors.length, 1);
	assert.equal(population.diagnostics().torahTargeting.actorCount, 1);
	population.destroy();
});

test('single-target ability resolves the canonical actor by stable ID without a regional query', () => {
	const canonical = hostile('shadow-stable', 4, 0);
	const decoy = hostile('shadow-decoy', 7, 0);
	const system = systemFor([canonical, decoy]);
	const staleReference = hostile('shadow-stable', 200, 200);
	const result = system.apply({ id: 'modeh-ani' }, staleReference);
	assert.equal(result.accepted, true);
	assert.deepEqual(result.targetIds, ['shadow-stable']);
	assert.equal(canonical.hits.length, 1);
	assert.equal(staleReference.hits.length, 0);
	assert.equal(decoy.hits.length, 0);
	assert.deepEqual(system.diagnostics().targeting, {
		actorCount: 2,
		cellCount: 1,
		directLookups: 1,
		lastQuery: { candidateCount: 0, radius: 0, visitedCells: 0 },
		regionalQueries: 0
	});
});

test('area ability visits only cells intersecting its bounded range', () => {
	const nearby = [hostile('near-one', 2, 0), hostile('near-two', 8, 0)];
	const distant = Array.from({ length: 80 }, (_, index) => (
		hostile(`far-${index}`, 120 + index * 24, 120)
	));
	const system = systemFor([...nearby, ...distant]);
	const result = system.apply({ id: 'creation-light' }, null);
	const diagnostics = system.diagnostics().targeting;
	assert.equal(result.accepted, true);
	assert.deepEqual(result.targetIds, ['near-one', 'near-two']);
	assert.equal(diagnostics.actorCount, 82);
	assert.equal(diagnostics.regionalQueries, 1);
	assert.equal(diagnostics.directLookups, 0);
	assert.equal(diagnostics.lastQuery.radius, 9);
	assert.equal(diagnostics.lastQuery.candidateCount, 2);
	assert.ok(diagnostics.lastQuery.candidateCount < diagnostics.actorCount);
});

test('moving and defeated actors update spatial membership explicitly', () => {
	const moving = hostile('moving-shadow', 60, 0);
	const system = systemFor([moving]);
	assert.equal(system.apply({ id: 'creation-light' }, null).accepted, false);
	moving.group.position.x = 3;
	system.updateActor(moving);
	assert.deepEqual(system.apply({ id: 'creation-light' }, null).targetIds, ['moving-shadow']);
	moving.state = ENEMY_STATE.DEFEATED;
	system.updateActor(moving);
	assert.equal(system.apply({ id: 'modeh-ani' }, 'moving-shadow').accepted, false);
	assert.equal(system.diagnostics().targeting.actorCount, 0);
});

test('legacy actor assignment and setActors both rebuild the same index', () => {
	const system = systemFor([]);
	system.actors = [hostile('legacy-assignment', 1, 0)];
	assert.equal(system.diagnostics().targeting.actorCount, 1);
	assert.equal(system.setActors([hostile('method-assignment', 2, 0)]), 1);
	assert.equal(system.diagnostics().targeting.actorCount, 1);
	assert.deepEqual(system.apply({ id: 'modeh-ani' }, 'method-assignment').targetIds, [
		'method-assignment'
	]);
});

function systemFor(actors) {
	const system = new HostileTorahAbilitySystem(new AwtsmoosEventBus(), actors);
	system.setPlayerState({ x: 0, y: 0, z: 0 });
	return system;
}

function hostile(id, x, z) {
	const hits = [];
	return {
		group: { position: { x, y: 0, z } },
		hits,
		profile: { id },
		state: ENEMY_STATE.IDLE,
		applyTorahPassage(passage) {
			hits.push(passage.id);
			return { accepted: true, targetId: id };
		}
	};
}
