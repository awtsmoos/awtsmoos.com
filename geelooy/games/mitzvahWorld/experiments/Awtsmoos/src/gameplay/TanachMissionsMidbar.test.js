// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsMidbar.js.test.js
 * @description Proves every Midbar (Bamidbar + Devarim) mission carries the
 * AdventureCatalog quest() shape, stays frozen, keeps unique ids, and completes
 * through the real AdventureStore for at least three missions of every
 * objective eventType the pack uses.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from './AdventureStore.js';
import { ADVENTURE_CATALOG } from './AdventureCatalog.js';
import { MIDBAR_MISSIONS } from './TanachMissionsMidbar.js';

const ALLOWED_TYPES = new Set([
	'defeat', 'care', 'harvest', 'purchase', 'chop', 'collect',
	'talk', 'travel', 'activity', 'elite', 'learn', 'build', 'refine'
]);
const BUILDABLE = new Set(['sukkah', 'fence', 'lantern', 'bench', 'well']);

function isFrozenDeep(mission) {
	if (!Object.isFrozen(mission)) return false;
	if (!Object.isFrozen(mission.giver)) return false;
	if (!Object.isFrozen(mission.giver.position)) return false;
	if (!Object.isFrozen(mission.objectives)) return false;
	if (!Object.isFrozen(mission.reward)) return false;
	for (const obj of mission.objectives) {
		if (!Object.isFrozen(obj)) return false;
		if (!Object.isFrozen(obj.marker)) return false;
	}
	return true;
}

function completeMission(mission) {
	const store = new AdventureStore({ catalog: MIDBAR_MISSIONS });
	store.accept(mission.id);
	for (const objective of mission.objectives) {
		store.recordEvent({
			type: objective.eventType,
			target: objective.target,
			count: objective.count
		});
	}
	const record = store.records.get(mission.id);
	assert.equal(record.status, 'completed', `mission ${mission.id} did not complete`);
}

test('midbar pack holds 100 missions', () => {
	assert.equal(MIDBAR_MISSIONS.length, 100);
	assert.ok(Object.isFrozen(MIDBAR_MISSIONS));
});

test('every midbar mission carries the full quest shape', () => {
	for (const mission of MIDBAR_MISSIONS) {
		assert.equal(typeof mission.id, 'string');
		assert.ok(mission.id.length > 0);
		assert.equal(typeof mission.name, 'string');
		assert.equal(mission.title, mission.name);
		assert.equal(typeof mission.description, 'string');
		assert.ok(mission.description.length > 20);
		assert.equal(typeof mission.giver.id, 'string');
		assert.equal(typeof mission.giver.name, 'string');
		assert.equal(typeof mission.giver.position.x, 'number');
		assert.equal(mission.giver.position.y, 0);
		assert.equal(typeof mission.giver.position.z, 'number');
		assert.ok(mission.objectives.length >= 1 && mission.objectives.length <= 3);
		for (const objective of mission.objectives) {
			assert.ok(ALLOWED_TYPES.has(objective.eventType), `bad type ${objective.eventType}`);
			assert.equal(typeof objective.target, 'string');
			assert.ok(Number.isInteger(objective.count) && objective.count > 0);
			assert.equal(typeof objective.description, 'string');
			assert.equal(typeof objective.marker.x, 'number');
			assert.equal(objective.marker.y, 0);
			assert.equal(typeof objective.marker.z, 'number');
			for (const n of [mission.giver.position.x, mission.giver.position.z, objective.marker.x, objective.marker.z]) {
				assert.ok(n >= -180 && n <= 110, `coordinate ${n} out of range in ${mission.id}`);
			}
			if (objective.eventType === 'learn') assert.equal(objective.target, 'torah-passage');
			if (objective.eventType === 'refine') assert.equal(objective.target, 'spark');
			if (objective.eventType === 'build') assert.ok(BUILDABLE.has(objective.target));
		}
		assert.ok(Number.isInteger(mission.reward.xp) && mission.reward.xp > 0);
		assert.ok(Number.isInteger(mission.reward.mitzvahPoints) && mission.reward.mitzvahPoints > 0);
		assert.equal(typeof mission.multiplayer, 'boolean');
	}
});

test('midbar mission ids are unique and avoid AdventureCatalog ids', () => {
	const ids = MIDBAR_MISSIONS.map(m => m.id);
	assert.equal(new Set(ids).size, ids.length);
	const catalogIds = new Set(ADVENTURE_CATALOG.map(m => m.id));
	for (const id of ids) assert.ok(!catalogIds.has(id), `collision with catalog: ${id}`);
});

test('every midbar mission record is deeply frozen', () => {
	for (const mission of MIDBAR_MISSIONS) {
		assert.ok(isFrozenDeep(mission), `not deeply frozen: ${mission.id}`);
	}
});

test('at least three midbar missions complete per eventType', () => {
	const byType = new Map();
	for (const mission of MIDBAR_MISSIONS) {
		for (const objective of mission.objectives) {
			if (!byType.has(objective.eventType)) byType.set(objective.eventType, []);
			byType.get(objective.eventType).push(mission);
		}
	}
	assert.ok(byType.size >= 10, 'pack should exercise most event types');
	for (const [eventType, missions] of byType) {
		const unique = [...new Map(missions.map(m => [m.id, m])).values()];
		assert.ok(unique.length >= 3, `only ${unique.length} missions use ${eventType}`);
		for (const mission of unique.slice(0, 3)) completeMission(mission);
	}
});

test('midbar missions complete in objective order with exact counts', () => {
	const mission = MIDBAR_MISSIONS.find(m => m.id === 'spies-kalev-quiet');
	const store = new AdventureStore({ catalog: MIDBAR_MISSIONS });
	store.accept(mission.id);
	store.recordEvent({ type: 'learn', target: 'torah-passage', count: 1 });
	let record = store.records.get(mission.id);
	assert.equal(record.status, 'active');
	assert.equal(record.objectiveIndex, 1);
	store.recordEvent({ type: 'talk', target: 'kalev', count: 1 });
	record = store.records.get(mission.id);
	assert.equal(record.status, 'completed');
});

test('midbar multi-objective counts accumulate across partial events', () => {
	const mission = MIDBAR_MISSIONS.find(m => m.id === 'balak-seven-altars');
	const store = new AdventureStore({ catalog: MIDBAR_MISSIONS });
	store.accept(mission.id);
	store.recordEvent({ type: 'collect', target: 'ram-offering', count: 5 });
	store.recordEvent({ type: 'collect', target: 'ram-offering', count: 9 });
	const record = store.records.get(mission.id);
	assert.equal(record.status, 'completed');
});
