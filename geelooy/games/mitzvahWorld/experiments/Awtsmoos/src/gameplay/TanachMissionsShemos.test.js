// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsShemos.test.js
 * @description Proves every Shemos Tanach mission is well-formed, frozen, uniquely identified, and completable through the AdventureStore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from './AdventureStore.js';
import { SHEMOS_MISSIONS } from './TanachMissionsShemos.js';


const ALLOWED = new Set(['activity', 'build', 'care', 'chop', 'collect', 'defeat', 'elite', 'harvest', 'learn', 'purchase', 'refine', 'talk', 'travel']);

test('every mission carries the full required shape and is frozen', () => {
	const ids = new Set();
	for (const m of SHEMOS_MISSIONS) {
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

const BY_ID = new Map(SHEMOS_MISSIONS.map(m => [m.id, m]));
const SAMPLES = {
 "activity": [
  "pesach-bitter-herbs",
  "manna-coriander-glean",
  "midbar-spice-gather"
 ],
 "build": [
  "plague-hail-shelter",
  "plague-darkness",
  "exodus-pillar-fire"
 ],
 "care": [
  "plague-pestilence",
  "pesach-lamb-chosen",
  "mishkan-goat-hair"
 ],
 "chop": [
  "yamsuf-tree-sweetens",
  "midbar-tamarisk-wood",
  "mishkan-acacia"
 ],
 "collect": [
  "shemos-brick-yoke",
  "shemos-basket-nile",
  "plague-blood-nile"
 ],
 "defeat": [
  "plague-frogs",
  "plague-lice",
  "plague-wild-beasts"
 ],
 "elite": [
  "plague-paro-night",
  "yamsuf-horse-rider",
  "amalek-hands-up"
 ],
 "harvest": [
  "pesach-lamb-chosen",
  "quail-evening",
  "quail-plucked"
 ],
 "learn": [
  "shemos-holy-ground",
  "shemos-staff-serpent",
  "shemos-leprous-hand"
 ],
 "purchase": [
  "pesach-blood-doorpost",
  "exodus-spoils",
  "yamsuf-miriam-timbrel"
 ],
 "refine": [
  "yamsuf-marah-water",
  "midbar-spark-refining",
  "mishkan-menorah"
 ],
 "talk": [
  "shemos-staff-serpent",
  "shemos-aharon-mouth",
  "shemos-elders-gathered"
 ],
 "travel": [
  "shemos-burning-bush",
  "shemos-return-mitzrayim",
  "exodus-pillar-cloud"
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
	const mission = BY_ID.get('pesach-lamb-chosen');
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
