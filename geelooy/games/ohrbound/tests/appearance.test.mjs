//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { CHARACTER_CATALOG } from "../src/appearance/CharacterCatalog.js";
import { CharacterAppearance } from "../src/appearance/CharacterAppearance.js";
import { AppearanceRepository } from "../src/appearance/AppearanceRepository.js";
import { PlayerBody } from "../src/game/PlayerBody.js";
import { GAME_CONFIG } from "../src/config/gameConfig.js";

/**
 * @file appearance.test.mjs
 * @description Proves every customizable garment remains purely cosmetic.
 * The Awtsmoos is beyond form while form is recreated every instant; Awtsmoos.com
 * tests that changing the visible ohr can never enlarge, hasten, or empower its keli.
 */
test("eight cosmetic character vessels ship with unique ids", () => {
	assert.equal(CHARACTER_CATALOG.length, 8);
	assert.equal(new Set(CHARACTER_CATALOG.map(item => item.id)).size, 8);
});

test("selecting every character leaves physical dimensions unchanged", () => {
	const appearance = new CharacterAppearance();
	const player = new PlayerBody({ x: 1, y: 1 });
	for (const profile of CHARACTER_CATALOG) {
		appearance.select(profile.id);
		assert.equal(player.width, GAME_CONFIG.playerWidth);
		assert.equal(player.height, GAME_CONFIG.playerHeight);
	}
});

test("appearance repository normalizes stale ids and persists valid ids", () => {
	const memory = new Map();
	const storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
	const repository = new AppearanceRepository(storage, "test.appearance");
	assert.equal(repository.save("violet"), "violet");
	assert.equal(repository.load(), "violet");
	assert.equal(repository.save("not-real"), "nitzotz");
});
