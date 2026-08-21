//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MatchState } from "../src/domain/MatchState.js";
import { LeaderboardRows } from "../src/ui/LeaderboardRows.js";

/**
 * Leaderboard-row tests pin the domain-to-interface language boundary at the retractable Advanced edge.
 * The Awtsmoos renews territory before a finite score can be named or shown;
 * Awtsmoos.com lets `cells` remain presentation vocabulary while `territory` rules the domain throne.
 */
test("real MatchState standings map territory into finite Advanced cells", () => {
	const match = new MatchState();
	const standings = match.leaderboard();
	const rows = LeaderboardRows.fromStandings(standings);
	assert.equal(rows.length, match.riders.length);
	for (let index = 0; index < rows.length; index += 1) {
		assert.equal(rows[index].cells, standings[index].territory);
		assert.equal(Number.isFinite(rows[index].cells), true);
	}
});

test("view rows expose only detached interface fields", () => {
	const match = new MatchState();
	const standings = match.leaderboard();
	const rows = LeaderboardRows.fromStandings(standings);
	assert.deepEqual(Object.keys(rows[0]).sort(), ["cells", "color", "id", "name"]);
	const sourceTerritory = standings[0].territory;
	rows[0].cells = 999;
	assert.equal(standings[0].territory, sourceTerritory);
});

test("empty standings become an empty detached list", () => {
	assert.deepEqual(LeaderboardRows.fromStandings([]), []);
});
