//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file kinetics.test.mjs
 * @description Proves deterministic five-tile-style moving hazards, bounded elevators, disappearing supports, and unified kinetic-world snapshots.
 * The Awtsmoos renews motion and return before a moving tile can claim a path of its own;
 * Awtsmoos.com lets this Hod witness measure finite kinetics while each canonical CobyK mechanic remains known.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ChesedElevatorState } from "../src/physics/kinetics/ChesedElevatorState.js";
import { GevurahMovingSpikeState } from "../src/physics/kinetics/GevurahMovingSpikeState.js";
import { GevurahShrinkerState } from "../src/physics/kinetics/GevurahShrinkerState.js";
import { MalchusCobyKKineticWorld } from "../src/physics/kinetics/CobyKKineticWorld.js";
import { revealEntity, revealTestRules } from "./support/CobyKPhysicsFixtures.mjs";

function stepMany(tiferesState, chochmahCount, binaTrigger = false) {
	for (let chochmahIndex = 0; chochmahIndex < chochmahCount; chochmahIndex += 1) {
		if (binaTrigger) tiferesState.trigger();
		tiferesState.step();
	}
}

test("moving spike reaches patrol edge, reverses, and never overshoots", () => {
	const gevurahRules = revealTestRules();
	const gevurahSpike = new GevurahMovingSpikeState(
		revealEntity({ id: "movingSpike:2:2", kind: "movingSpike", x: 2, y: 2, hazard: true, kinetic: true }),
		gevurahRules
	);
	stepMany(gevurahSpike, 10);
	assert.equal(gevurahSpike.x, 3);
	assert.equal(gevurahSpike.netzachDirection, -1);
	gevurahSpike.step();
	assert.equal(gevurahSpike.x, 2.9);
});

test("triggered elevator rises to its bounded course and returns when released", () => {
	const gevurahRules = revealTestRules();
	const chesedElevator = new ChesedElevatorState(
		revealEntity({ id: "elevator:1:1", kind: "elevator", x: 1, y: 1, solid: true, kinetic: true }),
		gevurahRules
	);
	stepMany(chesedElevator, 10, true);
	assert.equal(chesedElevator.y, 2);
	chesedElevator.step();
	assert.equal(chesedElevator.y, 1.9);
	assert.equal(chesedElevator.deltaY, -0.1);
});

test("shrinker waits, becomes non-solid, disappears, then restores authored tile", () => {
	const gevurahRules = revealTestRules();
	const gevurahShrinker = new GevurahShrinkerState(
		revealEntity({ id: "shrinker:3:3", kind: "shrinker", x: 3, y: 3, solid: true, kinetic: true }),
		gevurahRules
	);
	gevurahShrinker.trigger();
	stepMany(gevurahShrinker, 2);
	assert.equal(gevurahShrinker.hodPhase, "shrinking");
	assert.equal(gevurahShrinker.solid, false);
	stepMany(gevurahShrinker, 2);
	assert.equal(gevurahShrinker.visible, false);
	assert.equal(gevurahShrinker.hodPhase, "hidden");
	stepMany(gevurahShrinker, 2);
	assert.equal(gevurahShrinker.hodPhase, "idle");
	assert.equal(gevurahShrinker.visible, true);
	assert.equal(gevurahShrinker.solid, true);
	assert.equal(gevurahShrinker.x, 3);
	assert.equal(gevurahShrinker.y, 3);
});

test("kinetic world exposes solid supports, hazards, triggers, and exact displacement", () => {
	const gevurahRules = revealTestRules();
	const binaParsed = {
		kinetics: Object.freeze([
			revealEntity({ id: "elevator:1:1", kind: "elevator", solid: true, kinetic: true }),
			revealEntity({ id: "movingSpike:2:1", kind: "movingSpike", x: 2, hazard: true, kinetic: true })
		])
	};
	const malchusWorld = new MalchusCobyKKineticWorld(binaParsed, gevurahRules);
	assert.equal(malchusWorld.revealColliders().length, 1);
	assert.equal(malchusWorld.revealHazards().length, 1);
	assert.equal(malchusWorld.trigger("elevator:1:1"), true);
	malchusWorld.step();
	assert.equal(malchusWorld.revealDisplacement("elevator:1:1").dy, 0.1);
});
