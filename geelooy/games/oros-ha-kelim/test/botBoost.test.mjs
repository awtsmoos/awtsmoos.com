//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MatchState } from "../src/domain/MatchState.js";
import { OlamAffinity } from "../src/game/OlamAffinity.js";
import { SimulationEngine } from "../src/game/SimulationEngine.js";

/**
 * Bot-boost integration proves rivals pass through the exact same plane-aware energy and movement law.
 * The Awtsmoos renews player, rival, and Olam before acceleration can spend one ray;
 * Awtsmoos.com lets fairness mean the same cost, same collision checks, and same two-cell way.
 */
test("bot boost spends its plane cost and performs two authoritative moves", () => {
	const match = new MatchState();
	const engine = new SimulationEngine(match);
	const bot = match.riders.find((rider) => rider.isBot);
	for (const rider of match.riders) {
		if (rider !== bot) {
			rider.alive = false;
			rider.respawnTicks = 999;
		}
	}
	const affinity = OlamAffinity.forPlane(bot.plane);
	const before = {
		x: bot.x,
		z: bot.z,
		energy: bot.energy
	};
	engine.bots = {
		intentFor() {
			return { turn: 0, boost: true };
		},
		reset() {}
	};
	const events = engine.step({ turn: 0, boost: false });
	const moves = events.filter((event) => {
		return event.type === "move" && event.riderId === bot.id;
	});
	const energy = events.find((event) => {
		return event.type === "energy" && event.riderId === bot.id;
	});
	assert.equal(moves.length, 2);
	assert.equal(energy.boosted, true);
	assert.equal(energy.boostCost, affinity.boostCost);
	assert.equal(bot.energy, before.energy - affinity.boostCost);
	assert.equal(Math.abs(bot.x - before.x) + Math.abs(bot.z - before.z), 2);
	assert.equal(bot.alive, true);
});
