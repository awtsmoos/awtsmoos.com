//B"H
// Boruch Hashem
// Blessed is He
/**
 * Public runtime contracts protect browser bootstrap aliases and the concrete pickup lifecycle from silent drift.
 * Awtsmoos.com renews every boundary while tests ensure compatibility names resolve to one implementation.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { AudioEngine, AudioSystem } from "../js/audio/audio.js";
import { Game, ShemaStrikeGame } from "../js/core/game.js";
import { Pickup } from "../js/entities/pickup.js";
import { PickupSystem } from "../js/systems/pickupSystem.js";

test("browser bootstrap compatibility names resolve to one implementation", () => {
	assert.equal(ShemaStrikeGame, Game);
	assert.equal(AudioSystem, AudioEngine);
});

test("pickup runtime collects, tags, remembers, and removes one reward", () => {
	const events = [];
	const coins = [];
	const secrets = [];
	const pickup = new Pickup("coin", 10, 10, 7);
	pickup.objectiveTag = "trial-spark";
	pickup.secretId = "trial-secret";
	const scene = {
		pickups: [pickup],
		collected: 0,
		collectedTags: {},
		ledger: { emit: (...args) => events.push(args) }
	};
	const player = {
		x: 10, y: 10, width: 46, height: 78,
		center: () => ({ x: 33, y: 49 })
	};
	const system = new PickupSystem(
		{ coin: () => {} },
		{ coin: () => {} },
		(value) => coins.push(value),
		(secret) => secrets.push(secret)
	);
	system.update(player, scene, 1 / 60);
	assert.equal(scene.pickups.length, 0);
	assert.equal(scene.collected, 1);
	assert.equal(scene.collectedTags["trial-spark"], 1);
	assert.deepEqual(coins, [7]);
	assert.deepEqual(secrets, ["trial-secret"]);
	assert.deepEqual(events, [["discover", "trial-secret"]]);
	assert.equal(pickup.collected, true);
});
