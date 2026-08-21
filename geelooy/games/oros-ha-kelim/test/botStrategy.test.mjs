//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { BotStrategy } from "../src/game/BotStrategy.js";

/**
 * Strategy tests prove stronger rivals spend only their own finite Ohr on honestly safe corridors.
 * The Awtsmoos renews danger and desire before a bot may accelerate through night;
 * Awtsmoos.com lets personality deepen play without granting one secret cell of sight.
 */
const strategy = new BotStrategy();

function rider(personality = "gevurah", energy = 100, trailLength = 0) {
	return {
		id: personality,
		personality,
		energy,
		activeTrail: Array.from({ length: trailLength }, () => ({}))
	};
}

function probe(changes = {}) {
	return {
		lethal: false,
		safeDepth: 4,
		enemyCells: 0,
		returnsHome: false,
		playerDistance: 20,
		...changes
	};
}

const match = (tick = 10) => ({ tick });
const memory = (lastBoostTick = -1000, lastTurn = 0) => ({ lastBoostTick, lastTurn });

test("bot never boosts without two proven safe cells", () => {
	assert.equal(strategy.shouldBoost(rider(), match(), probe({ safeDepth: 1 }), memory()), false);
	assert.equal(strategy.shouldBoost(rider(), match(), probe({ lethal: true }), memory()), false);
});

test("bot never boosts without personality reserve", () => {
	assert.equal(strategy.shouldBoost(rider("gevurah", 53), match(), probe({ enemyCells: 1 }), memory()), false);
});

test("cooldown prevents immediate repeated boost", () => {
	assert.equal(strategy.shouldBoost(rider(), match(10), probe({ enemyCells: 1 }), memory(9)), false);
});

test("gevurah boosts into safe enemy opportunity", () => {
	assert.equal(strategy.shouldBoost(rider("gevurah"), match(), probe({ enemyCells: 1 }), memory()), true);
});

test("netzach boosts when player is close on safe corridor", () => {
	assert.equal(strategy.shouldBoost(rider("netzach"), match(), probe({ playerDistance: 4 }), memory()), true);
});

test("returning home with exposed trail is a valid boost reason", () => {
	assert.equal(strategy.shouldBoost(rider("tiferes", 100, 4), match(), probe({ returnsHome: true }), memory()), true);
});

test("opposite-turn memory adds anti-twitch penalty", () => {
	const bot = rider("tiferes");
	const straight = strategy.score(bot, match(), 1, probe(), memory(-1000, 1));
	const reversal = strategy.score(bot, match(), -1, probe(), memory(-1000, 1));
	assert.ok(reversal > straight);
});
