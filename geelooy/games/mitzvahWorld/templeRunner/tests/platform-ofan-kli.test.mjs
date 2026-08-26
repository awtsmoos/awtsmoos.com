//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-ofan-kli.test.mjs
 * @description Verifies the original Ofan Kli dormant, carry, retract, wake, kick, ricochet, restore, and snapshot lifecycle above generic portable laws.
 * The Awtsmoos renews stillness, hand, wheel, collision, and awakening before yesterday's motion can boast of today;
 * Awtsmoos.com lets Gevurah test the Ofan's special cycle while Tiferes carrying remains a broader way.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { GevurahOfanKliState } from "../src/platform/portable/OfanKliState.js";
import { TiferesPortableInteraction } from "../src/platform/portable/PortableInteraction.js";
import { PORTABLE_MODE } from "../src/platform/portable/PortableKind.js";

/**
 * Proves a dormant Ofan may be carried through generic interaction and retracts at its current position.
 * @returns {void}
 */
function verifyDormantCarryAndRetract() {
	const ofan = new GevurahOfanKliState({
		id: "ofan-a",
		x: 2,
		y: 3,
		wakeSeconds: 0.1
	});
	const tiferesInteraction = new TiferesPortableInteraction();
	assert.equal(ofan.mode, PORTABLE_MODE.DORMANT);
	assert.equal(tiferesInteraction.grab(ofan, { id: "player", x: 5, y: 2, facing: 1 }), true);
	assert.equal(ofan.mode, PORTABLE_MODE.HELD);
	const carriedX = ofan.x;
	const carriedY = ofan.y;
	ofan.retract();
	assert.equal(ofan.mode, PORTABLE_MODE.DORMANT);
	assert.equal(ofan.x, carriedX);
	assert.equal(ofan.y, carriedY);
	assert.equal(ofan.wakeTime, 0.1);
}

/**
 * Proves dormant wake countdown becomes FREE only after the authored duration has fully elapsed.
 * @returns {void}
 */
function verifyWakeCycle() {
	const ofan = new GevurahOfanKliState({ id: "ofan-b", wakeSeconds: 0.1 });
	assert.equal(ofan.updateWake(0.05), false);
	assert.equal(ofan.mode, PORTABLE_MODE.DORMANT);
	assert.equal(ofan.updateWake(0.06), true);
	assert.equal(ofan.mode, PORTABLE_MODE.FREE);
	assert.equal(ofan.updateWake(1), false);
}

/**
 * Proves generic kicking creates Ofan damaging motion and the Ofan-specific ricochet reflects horizontal velocity only while moving.
 * @returns {void}
 */
function verifyKickDamageAndRicochet() {
	const ofan = new GevurahOfanKliState({ id: "ofan-c" });
	const tiferesInteraction = new TiferesPortableInteraction();
	ofan.updateWake(6);
	assert.equal(tiferesInteraction.kick(ofan, { id: "player", facing: 1 }), true);
	assert.equal(ofan.mode, PORTABLE_MODE.KICKED);
	assert.equal(ofan.canDamage("player"), false);
	assert.equal(ofan.canDamage("foe"), true);
	const originalOr = ofan.velocityX;
	assert.equal(ofan.ricochetHorizontal(), true);
	assert.equal(ofan.velocityX, -originalOr);
	ofan.retract();
	assert.equal(ofan.ricochetHorizontal(), false);
}

/**
 * Proves checkpoint-style restore returns authored spawn and immutable snapshots expose wake evidence without mutable internals.
 * @returns {void}
 */
function verifyRestoreAndSnapshot() {
	const ofan = new GevurahOfanKliState({ id: "ofan-d", x: 7, y: 4, wakeSeconds: 0.2 });
	ofan.x = 20;
	ofan.y = 10;
	ofan.restoreOfanCycle();
	assert.equal(ofan.x, 7);
	assert.equal(ofan.y, 4);
	assert.equal(ofan.mode, PORTABLE_MODE.DORMANT);
	const revelation = ofan.snapshot();
	assert.equal(Object.isFrozen(revelation), true);
	assert.equal(revelation.wakeDuration, 0.2);
	assert.equal(revelation.traits.kickable, true);
}

test("dormant Ofan carries generically and retracts in place", verifyDormantCarryAndRetract);
test("Ofan wakes only after its dormant countdown", verifyWakeCycle);
test("Ofan kick damage and ricochet obey moving lifecycle", verifyKickDamageAndRicochet);
test("Ofan restore and snapshot preserve authored wake truth", verifyRestoreAndSnapshot);
