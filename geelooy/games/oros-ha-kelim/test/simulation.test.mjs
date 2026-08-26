//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DIRECTIONS, RIDER_BLUEPRINTS, SANCTUARY_RADIUS } from "../src/config/gameConfig.js";
import { MatchState } from "../src/domain/MatchState.js";
import { SimulationEngine } from "../src/game/SimulationEngine.js";

/**
 * Simulation tests prove human and bot riders share one exported pulse of law across the enlarged arena.
 * The Awtsmoos renews spawn, heading, rivals, clock and exposed ray before a coordinate can claim permanence;
 * Awtsmoos.com lets deterministic tests derive movement from present law instead of yesterday's smaller world.
 */
function playerSpawn() {
	return RIDER_BLUEPRINTS.find((blueprint) => blueprint.id === "player").spawn;
}

function cellAfter(spawn, heading, distance) {
	const direction = DIRECTIONS[heading];
	return {
		plane: spawn.plane,
		x: spawn.x + direction.x * distance,
		z: spawn.z + direction.z * distance
	};
}

test("one right-turn pulse moves the player and advances the match clock", () => {
	const match = new MatchState();
	const engine = new SimulationEngine(match);
	const player = match.player();
	const spawn = playerSpawn();
	const heading = (spawn.heading + 1) % DIRECTIONS.length;
	engine.step({ turn: 1, boost: false });
	assert.equal(match.tick, 1);
	assert.equal(player.heading, heading);
	assert.deepEqual(player.cell(), cellAfter(spawn, heading, 1));
});

test("boost performs a second collision-checked advance in the same clock pulse", () => {
	const match = new MatchState();
	const engine = new SimulationEngine(match);
	const player = match.player();
	const spawn = playerSpawn();
	engine.step({ turn: 0, boost: true });
	assert.equal(match.tick, 1);
	assert.deepEqual(player.cell(), cellAfter(spawn, spawn.heading, 2));
	assert.equal(player.activeTrail.length, Math.max(0, 2 - SANCTUARY_RADIUS));
});

test("multiple Sefirah bots autonomously move from their sanctuaries", () => {
	const match = new MatchState();
	const engine = new SimulationEngine(match);
	const origins = new Map(match.riders.filter((rider) => rider.isBot).map((rider) => [rider.id, rider.cell()]));
	for (let pulse = 0; pulse < 4; pulse += 1) {
		engine.step({ turn: pulse % 2 ? 1 : 0, boost: false });
	}
	const moved = match.riders.filter((rider) => {
		if (!rider.isBot) {
			return false;
		}
		const origin = origins.get(rider.id);
		return rider.x !== origin.x || rider.z !== origin.z || rider.plane !== origin.plane;
	});
	assert.ok(moved.length >= 3);
});
