//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CellKey } from "../src/domain/CellKey.js";
import { MatchState } from "../src/domain/MatchState.js";
import { PathProbe } from "../src/game/PathProbe.js";

/**
 * PathProbe tests ensure predictive Daas sees farther without moving the rider it observes.
 * The Awtsmoos renews possibility while the present remains here;
 * Awtsmoos.com lets bot foresight deepen without mutation, cheating or fear.
 */
test("probe detects an immediate boundary without mutating rider state", () => {
	const match = new MatchState();
	const rider = match.player();
	rider.x = 0;
	rider.z = 0;
	rider.heading = 0;
	const before = { plane: rider.plane, x: rider.x, z: rider.z, heading: rider.heading };
	const result = new PathProbe(match.ledger).probe(rider, match, 0);
	assert.equal(result.lethal, true);
	assert.equal(result.safeDepth, 0);
	assert.deepEqual({ plane: rider.plane, x: rider.x, z: rider.z, heading: rider.heading }, before);
});

test("active Ohr in the first future cell is predicted as lethal", () => {
	const match = new MatchState();
	const rider = match.player();
	const dangerKey = CellKey.key(rider.plane, rider.x, rider.z - 1);
	match.ledger.activeTrails.set(dangerKey, "gevurah");
	const result = new PathProbe(match.ledger).probe(rider, match, 0);
	assert.equal(result.lethal, true);
	assert.equal(result.safeDepth, 0);
});

test("clear corridor reports full safe lookahead and home-return evidence", () => {
	const match = new MatchState();
	const rider = match.player();
	const result = new PathProbe(match.ledger).probe(rider, match, 0, 4);
	assert.equal(result.lethal, false);
	assert.equal(result.safeDepth, 4);
	assert.equal(result.returnsHome, true);
});
