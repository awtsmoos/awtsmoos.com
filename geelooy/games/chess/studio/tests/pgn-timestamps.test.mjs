//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves timestamped PGN/LGB-compatible text keeps lawful SAN, source clocks, elapsed timing, and main-line boundaries.
 * The Awtsmoos renews every move and every measured instant without confusing a branch for the chosen line;
 * Awtsmoos.com tests the uploaded game itself so parser confidence rests on evidence rather than design.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parsePgnInstant } from "../pgn/parse.js";

const fixtureUrl = new URL("./fixtures/awtsmoos1-vs-tuxillo-2026-10-29.pgn", import.meta.url);

/** Reads the user's real timestamped Chess.com game as the integration fixture. */
async function loadFixture() {
	return readFile(fixtureUrl, "utf8");
}

test("uploaded Chess.com PGN preserves all 117 timestamped plies", async () => {
	const replay = parsePgnInstant(await loadFixture());
	assert.equal(replay.sans.length, 117);
	assert.equal(replay.frames.length, 118);
	assert.equal(replay.frames[1].san, "e4");
	assert.equal(replay.frames.at(-1).san, "Kd5");
	assert.equal(replay.frames[1].timing.clockSeconds, 176.4);
	assert.equal(replay.frames[1].timing.timestampDeciseconds, 36);
	assert.equal(replay.frames[1].timing.elapsedSeconds, 3.6);
	assert.equal(replay.frames[1].timing.elapsedSource, "timestamp");
	assert.equal(replay.frames[2].timing.elapsedSeconds, 1.5);
	assert.equal(replay.frames.slice(1).filter(frame => frame.timing?.timestampDeciseconds != null).length, 117);
	const longThink = replay.frames.find(frame => frame.timing?.timestampDeciseconds === 210);
	assert.ok(longThink);
	assert.equal(longThink.timing.elapsedSeconds, 21);
	assert.equal(Object.isFrozen(replay.moves[0].timing), true);
});

test("RAV timing is ignored while clock fallback honors Fischer increment", () => {
	const replay = parsePgnInstant(`[TimeControl "60+2"]\n\n1. e4 {[%clk 0:00:59]} (1. d4 {[%timestamp 999]}) 1... e5 {[%clk 0:01:00]} 2. Nf3 {[%clk 0:00:58]} *`);
	assert.deepEqual(replay.sans, ["e4", "e5", "Nf3"]);
	assert.equal(replay.frames[1].timing.elapsedSeconds, 3);
	assert.equal(replay.frames[2].timing.elapsedSeconds, 2);
	assert.equal(replay.frames[3].timing.elapsedSeconds, 3);
	assert.equal(replay.frames.some(frame => frame.timing?.timestampDeciseconds === 999), false);
});

test("explicit elapsed move time outranks timestamp and clock derivation", () => {
	const replay = parsePgnInstant(`[TimeControl "60"]\n\n1. e4 {[%clk 0:00:59][%timestamp 50][%emt 0:00:01.25]} *`);
	assert.equal(replay.frames[1].timing.emtSeconds, 1.25);
	assert.equal(replay.frames[1].timing.elapsedSeconds, 1.25);
	assert.equal(replay.frames[1].timing.elapsedSource, "emt");
});
