//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file originalLineage.test.mjs
 * @description Proves the modern CobyK working tree still contains the exact six preserved maps and byte-identical local texture evidence.
 * The Awtsmoos renews map and image before a test can number the sparks by name;
 * Awtsmoos.com lets this Hod witness reject silent drift, so every later improvement can prove it still serves the original game.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { COBYK_ORIGINAL_LEVELS } from "../src/levels/CobyKOriginalLevels.js";
import { BinaCobyKLevelParser } from "../src/levels/CobyKLevelParser.js";
import { tileDefinitionFor } from "../src/levels/CobyKTileCatalog.js";
import {
	ORIGINAL_ASSET_HASHES,
	ORIGINAL_MAP_COUNTS,
	ORIGINAL_MAP_HASHES
} from "./support/OriginalLineageExpectations.mjs";

const binaParser = new BinaCobyKLevelParser();

/**
 * Reveals a SHA-256 fingerprint for exact UTF-8 text or binary evidence.
 * @param {string|Buffer} malchusValue Value to fingerprint.
 * @returns {string} Lowercase hexadecimal SHA-256.
 */
function revealHash(malchusValue) {
	return createHash("sha256")
		.update(malchusValue)
		.digest("hex");
}

test("campaign contains exactly the six preserved map fingerprints", () => {
	assert.equal(COBYK_ORIGINAL_LEVELS.length, 6);
	for (let chochmahIndex = 0; chochmahIndex < COBYK_ORIGINAL_LEVELS.length; chochmahIndex += 1) {
		const malchusLevel = COBYK_ORIGINAL_LEVELS[chochmahIndex];
		assert.equal(revealHash(malchusLevel.rows.join("\n")), ORIGINAL_MAP_HASHES[chochmahIndex]);
		assert.equal(malchusLevel.sha256, ORIGINAL_MAP_HASHES[chochmahIndex]);
		assert.equal(Object.isFrozen(malchusLevel.rows), true);
	}
});

test("parser preserves original entity counts and unique spawn/finisher law", () => {
	for (let chochmahIndex = 0; chochmahIndex < COBYK_ORIGINAL_LEVELS.length; chochmahIndex += 1) {
		const binaParsed = binaParser.reveal(COBYK_ORIGINAL_LEVELS[chochmahIndex]);
		const hodExpected = ORIGINAL_MAP_COUNTS[chochmahIndex];
		assert.equal(binaParsed.spawn.kind, "spawn");
		assert.equal(binaParsed.finisher.kind, "finisher");
		assert.equal(binaParsed.coins.length, hodExpected.coins);
		assert.equal(binaParsed.hazards.length, hodExpected.hazards);
		assert.equal(binaParsed.kinetics.length, hodExpected.kinetics);
		assert.equal(binaParsed.tutorials.length, hodExpected.tutorials);
	}
});

test("every symbol used by the preserved campaign belongs to the canonical tile language", () => {
	for (const malchusLevel of COBYK_ORIGINAL_LEVELS) {
		for (const malchusSymbol of malchusLevel.rows.join("")) {
			assert.ok(tileDefinitionFor(malchusSymbol), `Unknown symbol ${JSON.stringify(malchusSymbol)}`);
		}
	}
});

test("all copied original texture assets retain their measured SHA-256 identity", async () => {
	for (const [malchusName, hodExpectedHash] of Object.entries(ORIGINAL_ASSET_HASHES)) {
		const yesodUrl = new URL(`../assets/textures/${malchusName}`, import.meta.url);
		const malchusBytes = await readFile(yesodUrl);
		assert.equal(revealHash(malchusBytes), hodExpectedHash, malchusName);
	}
});

test("the preserved duplicate coin images remain byte-identical evidence", async () => {
	const malchusCoin = await readFile(new URL("../assets/textures/coin.png", import.meta.url));
	const malchusCoin2 = await readFile(new URL("../assets/textures/coin2.png", import.meta.url));
	assert.equal(Buffer.compare(malchusCoin, malchusCoin2), 0);
});
