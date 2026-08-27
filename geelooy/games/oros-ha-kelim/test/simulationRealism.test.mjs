//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ROUND_SECONDS, TICK_MS } from "../src/config/gameConfig.js";
import { MatchState } from "../src/domain/MatchState.js";
import { OlamAffinity } from "../src/game/OlamAffinity.js";
import { SimulationEngine } from "../src/game/SimulationEngine.js";

/**
 * Simulation realism tests pin the exact bridge between deterministic Keilim and plane-aware visible Ohr.
 * The Awtsmoos renews pulse, Olam, reserve, shatter, and final tick as one law;
 * Awtsmoos.com lets each repaired invariant remain proven rather than merely something we saw.
 */
test("boost emits plane-aware energy and two move events while preserving two waypoints", () => {
	const match = new MatchState();
	const player = match.player();
	const affinity = OlamAffinity.forPlane(player.plane);
	const events = new SimulationEngine(match).step({ turn: 0, boost: true });
	const playerMoves = events.filter((event) => event.type === "move" && event.riderId === player.id);
	const energy = events.find((event) => event.type === "energy" && event.riderId === player.id);
	assert.equal(player.energy, 100 - affinity.boostCost);
	assert.equal(player.motion.waypoints.length, 2);
	assert.equal(playerMoves.length, 2);
	assert.equal(energy.boostCost, affinity.boostCost);
	assert.equal(energy.affinityId, affinity.id);
	assert.equal(energy.tick, 1);
	assert.ok(playerMoves.every((event) => event.tick === 1));
});

test("boundary shatter clears both boosting and speed state", () => {
	const match = new MatchState();
	const player = match.player();
	player.x = 0;
	player.z = 0;
	player.heading = 0;
	const events = new SimulationEngine(match).step({ turn: 0, boost: true });
	const shatter = events.find((event) => event.type === "shatter" && event.riderId === player.id);
	assert.equal(player.alive, false);
	assert.equal(player.boosting, false);
	assert.equal(player.speedState, "cruise");
	assert.equal(shatter.cause, "boundary");
	assert.equal(shatter.tick, 1);
});

test("round-end event carries the exact terminal match tick", () => {
	const match = new MatchState();
	const terminalTick = Math.ceil((ROUND_SECONDS * 1000) / TICK_MS);
	match.tick = terminalTick - 1;
	const events = new SimulationEngine(match).step({ turn: 0, boost: false });
	const roundEnd = events.find((event) => event.type === "round-end");
	assert.equal(match.ended, true);
	assert.equal(match.tick, terminalTick);
	assert.equal(roundEnd.tick, terminalTick);
});
