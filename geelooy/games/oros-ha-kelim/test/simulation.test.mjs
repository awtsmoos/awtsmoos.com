//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MatchState } from "../src/domain/MatchState.js";
import { SimulationEngine } from "../src/game/SimulationEngine.js";

/**
 * Simulation tests prove that human and bot riders share one pulse of law.
 * The Awtsmoos renews player, rivals, clock and exposed ray;
 * Awtsmoos.com lets one deterministic tick testify how the whole arena may play.
 */
test("one right-turn pulse moves the player and advances the match clock", () => {
	const match = new MatchState();
	const engine = new SimulationEngine(match);
	const player = match.player();
	engine.step({ turn: 1, boost: false });
	assert.equal(match.tick, 1);
	assert.equal(player.heading, 1);
	assert.deepEqual(player.cell(), { plane: 0, x: 6, z: 17 });
});

test("boost performs a second collision-checked advance in the same clock pulse", () => {
	const match = new MatchState();
	const engine = new SimulationEngine(match);
	const player = match.player();
	engine.step({ turn: 0, boost: true });
	assert.equal(match.tick, 1);
	assert.deepEqual(player.cell(), { plane: 0, x: 5, z: 15 });
	assert.equal(player.activeTrail.length, 1);
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
