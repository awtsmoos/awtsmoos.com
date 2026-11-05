// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsBereishis.test.js
 * @description Proves every Bereishis Tanach mission is well-formed, frozen, uniquely identified, and completable through the AdventureStore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from './AdventureStore.js';
import { BEREISHIS_MISSIONS } from './TanachMissionsBereishis.js';
import { SHEMOS_MISSIONS } from './TanachMissionsShemos.js';

const ALLOWED = new Set(['activity', 'build', 'care', 'chop', 'collect', 'defeat', 'elite', 'harvest', 'learn', 'purchase', 'refine', 'talk', 'travel']);

test('every mission carries the full required shape and is frozen', () => {
	const ids = new Set();
	for (const m of BEREISHIS_MISSIONS) {
		assert.ok(m.id && typeof m.id === 'string', 'id');
		assert.match(m.id, /^[a-z0-9-]+$/, `kebab id: ${m.id}`);
		assert.ok(!ids.has(m.id), `duplicate id: ${m.id}`);
		ids.add(m.id);
		assert.equal(m.name, m.title, `name===title: ${m.id}`);
		assert.ok(m.description && m.description.length > 10, `description: ${m.id}`);
		assert.ok(Object.isFrozen(m), `frozen mission: ${m.id}`);
		assert.ok(Object.isFrozen(m.giver), `frozen giver: ${m.id}`);
		assert.ok(Object.isFrozen(m.giver.position), `frozen giver position: ${m.id}`);
		assert.match(m.giver.id, /^[a-z0-9-]+$/, `giver id: ${m.id}`);
		assert.ok(m.giver.name, `giver name: ${m.id}`);
		for (const k of ['x','y','z']) assert.equal(typeof m.giver.position[k], 'number', `giver pos ${k}: ${m.id}`);
		assert.ok(Array.isArray(m.objectives) && m.objectives.length >= 1 && m.objectives.length <= 3, `objectives 1-3: ${m.id}`);
		assert.ok(Object.isFrozen(m.objectives), `frozen objectives: ${m.id}`);
		for (const o of m.objectives) {
			assert.ok(Object.isFrozen(o), `frozen objective: ${m.id}`);
			assert.ok(ALLOWED.has(o.eventType), `eventType ${o.eventType}: ${m.id}`);
			assert.ok(o.target && typeof o.target === 'string', `target: ${m.id}`);
			assert.ok(Number.isInteger(o.count) && o.count >= 1, `count: ${m.id}`);
			assert.ok(o.description && o.description.length > 5, `objective description: ${m.id}`);
			assert.ok(Object.isFrozen(o.marker), `frozen marker: ${m.id}`);
			for (const k of ['x','y','z']) assert.equal(typeof o.marker[k], 'number', `marker ${k}: ${m.id}`);
		}
		assert.ok(Object.isFrozen(m.reward), `frozen reward: ${m.id}`);
		assert.ok(Number.isInteger(m.reward.xp) && m.reward.xp > 0, `xp: ${m.id}`);
		assert.ok(Number.isInteger(m.reward.mitzvahPoints) && m.reward.mitzvahPoints > 0, `mitzvahPoints: ${m.id}`);
		assert.equal(typeof m.multiplayer, 'boolean', `multiplayer: ${m.id}`);
	}
});

test('ids are unique across both Tanach packs', () => {
	const seen = new Set(BEREISHIS_MISSIONS.map(m => m.id));
	for (const m of SHEMOS_MISSIONS) assert.ok(!seen.has(m.id), `cross-file duplicate: ${m.id}`);
	assert.equal(BEREISHIS_MISSIONS.length + SHEMOS_MISSIONS.length, seen.size + SHEMOS_MISSIONS.length);
});


function driveToCompletion(mission) {
	const store = new AdventureStore({ catalog: [mission] });
	const before = store.get(mission.id);
	assert.equal(before.status, 'available');
	store.accept(mission.id);
	assert.equal(store.get(mission.id).status, 'active');
	for (const o of mission.objectives) {
		store.recordEvent({ type: o.eventType, target: o.target, count: o.count });
	}
	const after = store.get(mission.id);
	assert.equal(after.status, 'completed', `mission did not complete: ${mission.id}`);
	assert.ok(after.completedAt > 0, `completedAt set: ${mission.id}`);
}

const BY_ID = new Map(BEREISHIS_MISSIONS.map(m => [m.id, m]));
const SAMPLES = {
 "activity": [
  "breishis-tend-the-garden",
  "breishis-garden-herbs",
  "hagar-desert-herbs"
 ],
 "build": [
  "breishis-garden-lanterns",
  "kayin-city-walls",
  "noach-altar-of-thanks"
 ],
 "care": [
  "breishis-name-the-beasts",
  "hevel-choicest-flock",
  "noach-pairs-of-beasts"
 ],
 "chop": [
  "noach-gopher-wood",
  "noach-rooms-within",
  "akeidah-wood"
 ],
 "collect": [
  "breishis-garden-rows",
  "breishis-fruit-of-trees",
  "kayin-first-fruits"
 ],
 "defeat": [
  "bavel-taskmaster-round",
  "avraham-four-kings",
  "yitzchak-sitnah-strife"
 ],
 "elite": [
  "eden-east-gate",
  "bavel-watchers-height",
  "yackov-night-wrestling"
 ],
 "harvest": [
  "hevel-offering",
  "noach-altar-of-thanks",
  "avraham-covenant-pieces"
 ],
 "learn": [
  "breishis-first-light",
  "breishis-shabbos-rest",
  "kayin-anger-cooled"
 ],
 "purchase": [
  "avraham-melchizedek-bread",
  "sarah-cave-purchase",
  "rivkah-bracelets"
 ],
 "refine": [
  "sheis-appointed",
  "chanoch-walk",
  "noach-rainbow-sign"
 ],
 "talk": [
  "breishis-shabbos-rest",
  "kayin-anger-cooled",
  "chavah-children-taught"
 ],
 "travel": [
  "breishis-rivers-of-eden",
  "chanoch-walk",
  "noach-into-the-ark"
 ]
};

test('completability: accept -> recordEvent -> completed for sampled missions', () => {
	let n = 0;
	for (const [eventType, ids] of Object.entries(SAMPLES)) {
		assert.ok(ids.length >= 3, `need 3 samples for ${eventType}, have ${ids.length}`);
		for (const id of ids) {
			const mission = BY_ID.get(id);
			assert.ok(mission, `sample mission exists: ${id}`);
			assert.ok(mission.objectives.some(o => o.eventType === eventType), `${id} uses ${eventType}`);
			driveToCompletion(mission);
			n += 1;
		}
	}
	assert.ok(n >= 39, `expected >=39 driven missions, drove ${n}`);
});

test('out-of-order and wrong-target events do not complete objectives', () => {
	const mission = BY_ID.get('noach-altar-of-thanks');
	const store = new AdventureStore({ catalog: [mission] });
	store.accept(mission.id);
	const first = mission.objectives[0];
	store.recordEvent({ type: 'defeat', target: 'no-such-foe', count: 99 });
	assert.equal(store.get(mission.id).objectives[0].progress, 0);
	if (mission.objectives.length > 1) {
		const second = mission.objectives[1];
		store.recordEvent({ type: second.eventType, target: second.target, count: second.count });
		assert.equal(store.get(mission.id).objectiveIndex, 0, 'second objective must not advance first');
	}
	store.recordEvent({ type: first.eventType, target: first.target, count: first.count });
	assert.ok(store.get(mission.id).objectiveIndex >= 1);
});
