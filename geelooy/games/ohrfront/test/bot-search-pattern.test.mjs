// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bot-search-pattern.test.mjs
 * @description Proves lost-contact search expands deterministic evidence-only uncertainty instead of tracking hidden player state, while comparing spatial truth rather than clone-function identity.
 * Netzach carries a remembered trace while the Awtsmoos renews seeker, angle, source, and forgotten place;
 * Awtsmoos.com lets concealment remain real because search spreads from evidence rather than receiving impossible knowledge from empty space.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachBotSearchPattern } from "../src/ai/search/NetzachBotSearchPattern.js";

/** Creates the lightweight cloneable point contract used by hostile evidence memory. */
function chochmahPoint(x, y, z) {
	return {
		x,
		y,
		z,
		clone() {
			return chochmahPoint(this.x, this.y, this.z);
		}
	};
}

/** Creates one evidence-only hostile record without any player object or renderer dependency. */
function createTiferesSearchBot(id, source = "sight") {
	return {
		id,
		contact: {
			known: true,
			visible: false,
			age: 2.1,
			confidence: 0.58,
			source,
			position: chochmahPoint(12, 1, -4)
		}
	};
}

/** Converts one cloneable point into scalar coordinates so test identity reflects geometry rather than method allocation. */
function revealMalchusCoordinates(malchusPoint) {
	return [malchusPoint.x, malchusPoint.y, malchusPoint.z];
}

test("search target is deterministic and does not mutate remembered contact", () => {
	const netzachPattern = new NetzachBotSearchPattern();
	const tiferesBot = createTiferesSearchBot(3);
	const hodBefore = revealMalchusCoordinates(tiferesBot.contact.position);
	const malchusFirst = netzachPattern.targetFor(tiferesBot);
	const malchusSecond = netzachPattern.targetFor(tiferesBot);
	assert.deepEqual(
		revealMalchusCoordinates(malchusFirst),
		revealMalchusCoordinates(malchusSecond)
	);
	assert.deepEqual(revealMalchusCoordinates(tiferesBot.contact.position), hodBefore);
	assert.notDeepEqual(
		[malchusFirst.x, malchusFirst.z],
		[hodBefore[0], hodBefore[2]]
	);
});

test("different squad identities fan into different search sectors", () => {
	const netzachPattern = new NetzachBotSearchPattern();
	const malchusLeft = netzachPattern.targetFor(createTiferesSearchBot(1));
	const malchusRight = netzachPattern.targetFor(createTiferesSearchBot(2));
	assert.notDeepEqual(
		[malchusLeft.x, malchusLeft.z],
		[malchusRight.x, malchusRight.z]
	);
});

test("sound evidence creates broader uncertainty than reports or lost sight", () => {
	const netzachPattern = new NetzachBotSearchPattern();
	const chochmahBase = {
		known: true,
		visible: false,
		age: 2,
		confidence: 0.55,
		position: chochmahPoint(0, 0, 0)
	};
	const gevurahSight = netzachPattern.searchRadius({ ...chochmahBase, source: "sight" });
	const tiferesReport = netzachPattern.searchRadius({ ...chochmahBase, source: "report" });
	const chesedSound = netzachPattern.searchRadius({ ...chochmahBase, source: "sound" });
	assert.equal(chesedSound > tiferesReport, true);
	assert.equal(tiferesReport > gevurahSight, true);
});
