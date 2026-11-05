// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsBuilding.test.mjs
 * @description Guards the Tanach building-mission contract: every mission carries
 * the frozen AdventureCatalog shape, every build target is a real buildable
 * structure, and build events from the player-building runtime complete missions
 * through the AdventureStore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BUILDING_MISSIONS,
	buildingMissionDefinition
} from './TanachMissionsBuilding.js';
import { BUILDABLE_STRUCTURES } from '../app/MitzvahWorldPlayerBuilding.js';
import { AdventureStore } from './AdventureStore.js';

test('at least five build missions exist in the frozen quest shape', () => {
	assert.ok(BUILDING_MISSIONS.length >= 5, 'need at least five build missions');
	assert.ok(Object.isFrozen(BUILDING_MISSIONS), 'missions list is frozen');
	const seen = new Set();
	for (const mission of BUILDING_MISSIONS) {
		assert.ok(Object.isFrozen(mission), `${mission.id} is frozen`);
		assert.ok(mission.id && mission.name && mission.title, `${mission.id} has names`);
		assert.ok(mission.description.length >= 10, `${mission.id} has a description`);
		assert.ok(mission.giver?.id && mission.giver?.name, `${mission.id} has a giver`);
		assert.ok(
			typeof mission.giver.position.x === 'number' && typeof mission.giver.position.z === 'number',
			`${mission.id} giver has a position`
		);
		assert.ok(mission.objectives.length >= 1, `${mission.id} has objectives`);
		assert.ok(mission.reward.xp > 0 && mission.reward.mitzvahPoints > 0, `${mission.id} has a reward`);
		assert.ok(typeof mission.multiplayer === 'boolean', `${mission.id} states multiplayer`);
		assert.ok(!seen.has(mission.id), `${mission.id} is unique`);
		seen.add(mission.id);
		for (const objective of mission.objectives) {
			assert.equal(objective.eventType, 'build', `${mission.id} objectives are build events`);
			assert.ok(objective.count >= 1, `${mission.id} objective has a count`);
			assert.ok(objective.description.length >= 10, `${mission.id} objective has a description`);
			assert.ok(
				typeof objective.marker.x === 'number' && typeof objective.marker.z === 'number',
				`${mission.id} objective has a marker`
			);
		}
	}
});

test('every mission build target is a real buildable structure', () => {
	for (const mission of BUILDING_MISSIONS) {
		for (const objective of mission.objectives) {
			assert.ok(
				BUILDABLE_STRUCTURES[objective.target],
				`${mission.id} targets unknown structure ${objective.target}`
			);
		}
	}
});

test('new structures are actually used by the missions', () => {
	const targets = new Set();
	for (const mission of BUILDING_MISSIONS) {
		for (const objective of mission.objectives) targets.add(objective.target);
	}
	for (const id of ['mishkan-curtain', 'menorah-stand', 'mizbeach-evanim', 'avraham-tent', 'yitzchak-well']) {
		assert.ok(targets.has(id), `a mission should send travelers to build ${id}`);
	}
});

test('buildingMissionDefinition finds missions by id', () => {
	const found = buildingMissionDefinition('tent-of-avraham');
	assert.ok(found && found.id === 'tent-of-avraham');
	assert.equal(buildingMissionDefinition('no-such-mission'), null);
});

test('a build mission completes through the AdventureStore via build events', () => {
	const store = new AdventureStore({ catalog: BUILDING_MISSIONS });
	store.accept('altar-of-whole-stones');
	let record = store.get('altar-of-whole-stones');
	assert.equal(record.status, 'active');
	// The building runtime emits { type: 'build', target: structureId } on commit.
	store.recordEvent({ type: 'build', target: 'mizbeach-evanim', count: 1 });
	record = store.get('altar-of-whole-stones');
	assert.equal(record.status, 'completed', 'single-count mission completes after one build');
});

test('multi-objective mission completes only after every build objective', () => {
	const store = new AdventureStore({ catalog: BUILDING_MISSIONS });
	store.accept('light-of-the-menorah');
	store.recordEvent({ type: 'build', target: 'menorah-stand', count: 1 });
	assert.equal(store.get('light-of-the-menorah').status, 'active', 'still waiting on lanterns');
	store.recordEvent({ type: 'build', target: 'lantern', count: 2 });
	assert.equal(store.get('light-of-the-menorah').status, 'completed');
});

test('partial progress tracks build counts honestly', () => {
	const store = new AdventureStore({ catalog: BUILDING_MISSIONS });
	store.accept('curtains-of-the-mishkan');
	for (let i = 0; i < 3; i += 1) {
		store.recordEvent({ type: 'build', target: 'mishkan-curtain', count: 1 });
	}
	const record = store.get('curtains-of-the-mishkan');
	assert.equal(record.status, 'active');
	assert.equal(record.objectives[0].progress, 3);
	store.recordEvent({ type: 'build', target: 'mishkan-curtain', count: 1 });
	assert.equal(store.get('curtains-of-the-mishkan').status, 'completed');
});

test('unrelated build events do not advance the mission', () => {
	const store = new AdventureStore({ catalog: BUILDING_MISSIONS });
	store.accept('fold-of-the-flock');
	store.recordEvent({ type: 'build', target: 'watchtower', count: 1 });
	const record = store.get('fold-of-the-flock');
	assert.equal(record.status, 'active');
	assert.equal(record.objectives[0].progress, 0);
});
