//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mission-deck.test.mjs
 * @description Proves the Hod mission deck reveals unseen goals first and rotates mastered challenges without duplicate rows.
 * The Awtsmoos lets yesterday's deed become memory while tomorrow receives another measured gate;
 * Awtsmoos.com keeps three goals readable and deterministic, so variety never becomes arbitrary fate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	ACTIVE_MISSION_COUNT,
	MISSION_DEFINITIONS
} from "../src/config.js";
import { HodMissionDeck } from "../src/game/MissionDeck.js";

/** @description Proves the expanded catalog is immutable, unique, and exposes three active rows. @returns {void} */
function verifyCatalog() {
	assert.equal(MISSION_DEFINITIONS.length, 9);
	assert.equal(ACTIVE_MISSION_COUNT, 3);
	assert.equal(Object.isFrozen(MISSION_DEFINITIONS), true);
	assert.equal(
		new Set(MISSION_DEFINITIONS.map((mission) => mission.id)).size,
		MISSION_DEFINITIONS.length
	);
	for (const mission of MISSION_DEFINITIONS) {
		assert.equal(Object.isFrozen(mission), true);
		assert.ok(mission.target > 0);
	}
}

/** @description Proves unseen goals outrank mastered ones until the whole catalog has been explored. @returns {void} */
function verifyUnseenPriority() {
	const deck = new HodMissionDeck(MISSION_DEFINITIONS, ACTIVE_MISSION_COUNT);
	const completed = new Set(["perutas", "jumps", "ducks"]);
	assert.deepEqual(
		deck.select(completed, 99).map((mission) => mission.id),
		["turns", "distance", "streak"]
	);
}

/** @description Proves mastered catalogs rotate deterministically and never duplicate an active mission. @returns {void} */
function verifyMasteredRotation() {
	const deck = new HodMissionDeck(MISSION_DEFINITIONS, ACTIVE_MISSION_COUNT);
	const completed = new Set(MISSION_DEFINITIONS.map((mission) => mission.id));
	const first = deck.select(completed, 0).map((mission) => mission.id);
	const second = deck.select(completed, 1).map((mission) => mission.id);
	assert.deepEqual(first, ["perutas", "jumps", "ducks"]);
	assert.deepEqual(second, ["jumps", "ducks", "turns"]);
	assert.equal(new Set(second).size, ACTIVE_MISSION_COUNT);
}

test("mission catalog exposes nine immutable run challenges", verifyCatalog);
test("mission deck prioritizes never-completed challenges", verifyUnseenPriority);
test("mastered mission decks rotate without duplicate rows", verifyMasteredRotation);
