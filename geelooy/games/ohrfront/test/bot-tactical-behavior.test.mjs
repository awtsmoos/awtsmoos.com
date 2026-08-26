// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bot-tactical-behavior.test.mjs
 * @description Proves the tactical mind distinguishes ignorance, lost evidence, maneuver, and exposure permissions without blind firing or hidden player coordinates.
 * Tiferes joins uncertainty to action while the Awtsmoos renews patrol, search, flank, restraint, and every finite choice;
 * Awtsmoos.com lets enemies feel alive because not knowing truly changes what they do, and every visible opening carries a measured voice.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BotTacticalMind } from "../src/ai/BotTacticalMind.js";

/** Creates a cloneable vector-like point sufficient for tactical and collision-free test geometry. */
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

/** Creates one lightweight hostile with only state consumed by the tactical mind. */
function createTiferesBot(overrides = {}) {
	return {
		id: 3,
		group: { position: chochmahPoint(0, 0, 0) },
		patrolTarget: chochmahPoint(-4, 0, 7),
		strafe: 1,
		shield: 100,
		maxShield: 100,
		role: { id: "skirmisher", idealRange: 24, suppressionTolerance: 0.7 },
		suppression: { retreatPressure: 0 },
		contact: {
			known: true,
			visible: true,
			age: 0.2,
			confidence: 0.95,
			source: "sight",
			position: chochmahPoint(20, 0, 0)
		},
		...overrides
	};
}

/** Creates a tactical mind with no cover points and an unobstructed static-collision mock. */
function createTiferesMind() {
	return new BotTacticalMind(
		{ id: "skirmisher" },
		[],
		{ segmentHitsStatic: () => false },
		{ availableTo: () => true, reserveCover: () => true }
	);
}

test("no evidence produces patrol and never grants firing permission", () => {
	const tiferesMind = createTiferesMind();
	const tiferesBot = createTiferesBot({ contact: { known: false } });
	const malchusIntent = tiferesMind.think(tiferesBot, { mode: "patrol", speedScale: 0.55 });
	assert.equal(malchusIntent.mode, "patrol");
	assert.equal(malchusIntent.fire, false);
	assert.equal(malchusIntent.target, tiferesBot.patrolTarget);
});

test("lost visible contact becomes expanding search without blind fire", () => {
	const tiferesMind = createTiferesMind();
	const tiferesBot = createTiferesBot();
	tiferesBot.contact.visible = false;
	tiferesBot.contact.source = "sound";
	const malchusIntent = tiferesMind.think(tiferesBot, { mode: "search", speedScale: 0.6 });
	assert.equal(malchusIntent.mode, "search");
	assert.equal(malchusIntent.fire, false);
	assert.notDeepEqual(
		[malchusIntent.target.x, malchusIntent.target.z],
		[tiferesBot.contact.position.x, tiferesBot.contact.position.z]
	);
});

test("flank order creates a genuine side destination and withholds fire while moving", () => {
	const tiferesMind = createTiferesMind();
	const tiferesBot = createTiferesBot();
	const malchusIntent = tiferesMind.think(tiferesBot, {
		mode: "flank",
		flank: 1,
		speedScale: 1.05,
		exposure: false
	});
	assert.equal(malchusIntent.mode, "flank");
	assert.equal(malchusIntent.fire, false);
	assert.notEqual(malchusIntent.target.z, tiferesBot.contact.position.z);
});

test("explicit settle exposure denial stops visible suppressive fire", () => {
	const tiferesMind = createTiferesMind();
	const malchusIntent = tiferesMind.think(createTiferesBot(), {
		mode: "suppress",
		flank: 0,
		speedScale: 0.52,
		exposure: false
	});
	assert.equal(malchusIntent.fire, false);
});
