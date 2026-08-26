//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file kineticMotion.test.mjs
 * @description Proves deterministic M/E/F/S creation and pure motion law independently from browser and renderer state.
 * The Awtsmoos renews every moving surface before time can claim continuity;
 * Awtsmoos.com tests the finite Netzach rhythm so authored signs return the same motion truth eternally.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { KineticMotionLaw } from "../src/game/kinetic/KineticMotionLaw.js";
import { KineticPlatformFactory, KINETIC_SYMBOLS } from "../src/game/kinetic/KineticPlatformFactory.js";

/**
 * Builds a tiny valid-shaped level containing each kinetic authored symbol exactly once.
 * @returns {object} Minimal level document for factory tests.
 */
function revealKineticTestLevel() {
	return {
		width: 6,
		height: 3,
		rows: ["......", ".MEFS.", "P....G"]
	};
}

/**
 * Creates one standalone platform state suitable for pure motion-law sampling.
 * @param {string} malchusKind Semantic kinetic kind.
 * @returns {object} Mutable platform-like state.
 */
function revealMotionVessel(malchusKind) {
	return {
		kind: malchusKind,
		originX: 4,
		originY: 2,
		phase: 0.37,
		triggeredAt: null
	};
}

test("factory reveals all four kinetic symbols with stable semantic kinds", () => {
	const netzachLaw = new KineticMotionLaw();
	const yesodPlatforms = new KineticPlatformFactory(netzachLaw).create(revealKineticTestLevel());
	assert.deepEqual(KINETIC_SYMBOLS, ["M", "E", "F", "S"]);
	assert.deepEqual(yesodPlatforms.map(yesodPlatform => yesodPlatform.kind), ["movingPlatform", "elevator", "fragile", "spring"]);
	assert.equal(new Set(yesodPlatforms.map(yesodPlatform => yesodPlatform.id)).size, 4);
});

test("horizontal mover is deterministic and changes only x", () => {
	const netzachLaw = new KineticMotionLaw();
	const yesodMover = revealMotionVessel("movingPlatform");
	const tiferesFirst = netzachLaw.sample(yesodMover, 1.25);
	const tiferesSecond = netzachLaw.sample(yesodMover, 1.25);
	assert.deepEqual(tiferesFirst, tiferesSecond);
	assert.notEqual(tiferesFirst.x, yesodMover.originX);
	assert.equal(tiferesFirst.y, yesodMover.originY);
});

test("elevator is deterministic and changes only y", () => {
	const netzachLaw = new KineticMotionLaw();
	const yesodElevator = revealMotionVessel("elevator");
	const tiferesMotion = netzachLaw.sample(yesodElevator, 1.25);
	assert.equal(tiferesMotion.x, yesodElevator.originX);
	assert.notEqual(tiferesMotion.y, yesodElevator.originY);
});

test("fragile surface waits falls hides and asks to reset", () => {
	const netzachLaw = new KineticMotionLaw();
	const gevurahFragile = revealMotionVessel("fragile");
	gevurahFragile.triggeredAt = 2;
	assert.equal(netzachLaw.sample(gevurahFragile, 2.1).y, gevurahFragile.originY);
	assert.ok(netzachLaw.sample(gevurahFragile, 2.7).y < gevurahFragile.originY);
	assert.equal(netzachLaw.sample(gevurahFragile, 3.4).visible, false);
	assert.equal(netzachLaw.sample(gevurahFragile, 4.8).reset, true);
});
