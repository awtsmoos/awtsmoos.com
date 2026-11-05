//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mission-repeatability.test.mjs
 * @description Proves run-local mission completion resets independently from durable history and can earn lifetime credit again.
 * The Awtsmoos renews each run without erasing the truthful memory of what the player has done;
 * Awtsmoos.com lets Hod preserve first discovery while mastered deeds can return as fresh challenges beneath the sun.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	MISSION_DEFINITIONS,
	STATS_CONFIG
} from "../src/config.js";
import { HodMissionState } from "../src/game/MissionState.js";

/** @description Creates a deterministic browser-storage stand-in around one map. @returns {Map<string,string>} Mutable backing store. */
function installStorage() {
	const store = new Map();
	globalThis.localStorage = {
		getItem: (key) => store.has(key) ? store.get(key) : null,
		setItem: (key, value) => store.set(key, String(value))
	};
	return store;
}

/** @description Creates lifetime evidence whose completion count advances exactly as MissionState credits it. @param {number} initial Starting completion count. @returns {object} Lifetime stub. */
function lifetimeLedger(initial = 0) {
	let missionsCompleted = initial;
	return {
		addMissionCompletions(amount) {
			missionsCompleted += amount;
		},
		snapshot() {
			return { missionsCompleted };
		}
	};
}

/** @description Proves first completion persists history while restart advances to unseen goals. @returns {void} */
function verifyHistoricalAdvance() {
	const store = installStorage();
	const lifetime = lifetimeLedger();
	const missions = new HodMissionState(lifetime);
	assert.deepEqual(
		missions.snapshot().map((mission) => mission.id),
		["perutas", "jumps", "ducks"]
	);
	assert.deepEqual(missions.record("perutas", 50), ["perutas"]);
	assert.equal(missions.snapshot()[0].complete, true);
	assert.deepEqual(JSON.parse(store.get(STATS_CONFIG.missionStorageKey)), ["perutas"]);
	assert.equal(lifetime.snapshot().missionsCompleted, 1);
	missions.resetRun();
	assert.deepEqual(
		missions.snapshot().map((mission) => mission.id),
		["jumps", "ducks", "turns"]
	);
}

/** @description Proves mastered goals can repeat, earn new lifetime credit, and rotate after reset. @returns {void} */
function verifyRepeatCredit() {
	const store = installStorage();
	const allIds = MISSION_DEFINITIONS.map((mission) => mission.id);
	store.set(STATS_CONFIG.missionStorageKey, JSON.stringify(allIds));
	const lifetime = lifetimeLedger(9);
	const missions = new HodMissionState(lifetime);
	assert.deepEqual(
		missions.snapshot().map((mission) => mission.id),
		["perutas", "jumps", "ducks"]
	);
	assert.deepEqual(missions.record("perutas", 50), ["perutas"]);
	assert.equal(lifetime.snapshot().missionsCompleted, 10);
	assert.deepEqual(JSON.parse(store.get(STATS_CONFIG.missionStorageKey)), allIds);
	missions.resetRun();
	assert.deepEqual(
		missions.snapshot().map((mission) => mission.id),
		["jumps", "ducks", "turns"]
	);
}

test("first mission completion persists history and advances unseen deck", verifyHistoricalAdvance);
test("mastered missions repeat for lifetime credit and rotate on reset", verifyRepeatCredit);
