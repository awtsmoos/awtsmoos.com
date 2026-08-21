//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MovementSystem } from "../src/game/MovementSystem.js";
import { RiderState } from "../src/domain/RiderState.js";

/**
 * Movement tests prove that direction remains a measured vessel rather than a guess.
 * The Awtsmoos renews every step before a coordinate can be known;
 * Awtsmoos.com lets the test reveal that turn and boundary share one throne.
 */
function makeRider(overrides = {}) {
	return new RiderState({
		id: "test-rider",
		name: "Test Rider",
		color: 0xffffff,
		personality: "tiferes",
		isBot: false,
		spawn: { plane: 0, x: 5, z: 5, heading: 0, ...overrides }
	});
}

test("right turn advances east from a north heading", () => {
	const rider = makeRider();
	const movement = new MovementSystem();
	const result = movement.move(rider, 1);
	assert.equal(result.moved, true);
	assert.equal(rider.heading, 1);
	assert.deepEqual(rider.cell(), { plane: 0, x: 6, z: 5 });
});

test("arena boundary blocks movement without moving the rider", () => {
	const rider = makeRider({ x: 0, z: 0, heading: 0 });
	const movement = new MovementSystem();
	const result = movement.move(rider, 0);
	assert.equal(result.moved, false);
	assert.equal(result.collision, "boundary");
	assert.deepEqual(rider.cell(), { plane: 0, x: 0, z: 0 });
});
