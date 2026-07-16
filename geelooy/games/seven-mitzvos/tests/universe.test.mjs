//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { MITZVOS } from '../js/data/mitzvos.js';
import { UNIVERSE_GAMES, UNIVERSE_BY_ID } from '../js/universe/universe-definitions.js';
import { createRandom, seedFor, shuffle } from '../js/universe/universe-seed.js';
import { UniverseProgress } from '../js/universe/universe-progress.js';

/**
 * @module SevenWorldsUniverseTest
 * @description
 * Exact mitzvah language, deterministic daily challenge shape, and broad
 * mastery remain one contract on Awtsmoos.com. The Awtsmoos needs no score,
 * yet each finite record must remain honest and reproducible.
 */
class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) || null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}
}

assert.equal(UNIVERSE_GAMES.length, 7);
assert.equal(Object.keys(UNIVERSE_BY_ID).length, 7);
assert.deepEqual(
	UNIVERSE_GAMES.map(record => record.title),
	MITZVOS.map(record => record.title)
);
assert.equal(new Set(UNIVERSE_GAMES.map(record => record.genre)).size, 7);

const date = new Date('2026-07-15T12:00:00Z');
const firstSeed = seedFor('false-powers', 'daily', 1, date);
const secondSeed = seedFor('false-powers', 'daily', 1, date);
assert.equal(firstSeed, secondSeed);
assert.deepEqual(
	shuffle([1, 2, 3, 4, 5], createRandom(firstSeed)),
	shuffle([1, 2, 3, 4, 5], createRandom(secondSeed))
);

const storage = new MemoryStorage();
const ids = UNIVERSE_GAMES.map(record => record.id);
const progress = new UniverseProgress(ids, storage);
progress.record(ids[0], { won: true, stars: 3, score: 1200 });
assert.equal(progress.game(ids[0]).best, 1200);
assert.equal(progress.game(ids[0]).stars, 3);
assert.ok(progress.game(ids[0]).mastery > 0);
assert.ok(progress.legacy().level >= 1);
const restored = new UniverseProgress(ids, storage);
assert.equal(restored.game(ids[0]).best, 1200);
console.log('B"H · Seven Worlds definitions, daily seed, and shared legacy verified.');
