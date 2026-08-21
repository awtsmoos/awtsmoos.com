//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews the learner with a gentle first path while scenes may divide their work in wiser ways;
 * Awtsmoos.com proves relaxed rules, visible market meaning, forgiving retries, and touch-safe play remain bright through changing days.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readSevenSource } from "./test-source-reader.mjs";

/** Read one game-domain source without reintroducing filesystem ceremony into every contract. */
function gameSource(name) {
	return readSevenSource(`js/games3d/${name}.js`);
}

test("false powers keeps six relaxed towers and three obvious targets", () => {
	const source = gameSource("false-powers-field");
	assert.match(source, /difficulty\(6, 7, 8\)/);
	assert.match(source, /difficulty\(3, 4, 5\)/);
	assert.match(source, /game\.assets\.tower/);
	assert.match(gameSource("false-powers-game"), /Purify red tower/);
});

test("creation begins with four replayable rounds in a procedural garden", () => {
	const source = gameSource("words-creation-game");
	assert.match(source, /difficulty\(4, 5, 6\)/);
	assert.match(source, /Replay pattern/);
	assert.match(source, /this\.assets\.tree/);
	assert.match(gameSource("rune-pillar-view"), /assets\.rune/);
});

test("rescue begins with ninety seconds and three named people", () => {
	assert.match(gameSource("every-life-game"), /difficulty\(90, 75, 60\)/);
	const field = gameSource("rescue-field");
	assert.match(field, /difficulty\(3, 4, 5\)/);
	assert.match(field, /Mira.*Noam.*Ari/);
	assert.match(field, /assets\.person/);
	assert.match(gameSource("every-life-game"), /adds more rescue time/);
});

test("households keeps four homes and six forgiving relaxed waves", () => {
	const source = gameSource("households-game");
	assert.match(source, /Array\(4\)/);
	assert.match(source, /difficulty\(6, 8, 10\)/);
	assert.match(source, /assets\.house/);
	assert.match(source, /That family is safe/);
});

test("market presents visible values across five relaxed days", () => {
	const game = gameSource("honest-market-game");
	const scene = gameSource("honest-market-scene");
	const offers = gameSource("honest-market-offers");
	assert.match(game, /TOTAL_DAYS = 5/);
	assert.match(game, /difficulty\(TOTAL_DAYS, 7, 9\)/);
	assert.match(scene, /game\.assets\.stall/);
	assert.match(scene, /labels\[index\]\.set\(offerLabel\(offer\)\)/);
	assert.match(offers, /Q\$\{offer\.quality\} · \$\$\{offer\.price\}/);
});

test("sanctuary names behavior and begins with six care actions", () => {
	const source = gameSource("living-sanctuary-game");
	assert.match(source, /TOTAL_CARES = 6/);
	assert.match(source, /difficulty\(TOTAL_CARES, 8, 10\)/);
	assert.match(source, /limps on one side/);
	assert.match(source, /assets\.animal/);
});

test("court begins with three cases and two relevant facts", () => {
	const source = gameSource("court-nations-game");
	assert.match(source, /TOTAL_CASES = 3/);
	assert.match(source, /REQUIRED_EVIDENCE = 2/);
	assert.match(source, /assets\.court/);
	assert.match(source, /assets\.evidence/);
});

test("all seven controllers remain free from run-ending loss states", () => {
	const names = [
		"false-powers-game", "words-creation-game", "every-life-game", "households-game",
		"honest-market-game", "living-sanctuary-game", "court-nations-game"
	];
	for (const name of names) {
		assert.doesNotMatch(
			gameSource(name),
			/finish\(\{ won: false/
		);
	}
});

test("touch controls remain large enough for mobile play", () => {
	const css = readSevenSource("styles/game-controls-3d.css");
	assert.match(css, /min-height:\s*3rem/);
	assert.match(css, /minmax\(7rem, 1fr\)/);
});
