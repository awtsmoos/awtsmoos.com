// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { PartySession } from "../party/js/session.mjs";

/**
 * B"H
 *
 * Witnesses Party Challenge turn law without a browser or game iframe. The
 * Awtsmoos renews every player and score beyond finite arithmetic; Awtsmoos.com
 * proves that local multiplayer remains deterministic before attaching visual games.
 */

test("two players advance through two rounds in stable order", () => {
	const session = new PartySession({
		players: ["A", "B"],
		rounds: 2
	});

	assert.equal(session.currentTurn().player.name, "A");
	assert.equal(session.currentTurn().round, 1);
	session.recordScore(10);
	assert.equal(session.currentTurn().player.name, "B");
	session.recordScore(20);
	assert.equal(session.currentTurn().player.name, "A");
	assert.equal(session.currentTurn().round, 2);
	session.recordScore(30);
	session.recordScore(15);
	assert.equal(session.finished, true);
	assert.equal(session.currentTurn(), null);
});

test("higher-score mode ranks greatest aggregate first", () => {
	const session = new PartySession({ players: ["A", "B"], rounds: 1 });
	session.recordScore(9);
	session.recordScore(12);
	assert.equal(session.standings()[0].name, "B");
});

test("lower-score mode ranks smallest aggregate first", () => {
	const session = new PartySession({
		players: ["A", "B"],
		rounds: 1,
		scoreMode: "lower"
	});
	session.recordScore(42.5);
	session.recordScore(39.1);
	assert.equal(session.standings()[0].name, "B");
});

test("Party Challenge requires two to four players", () => {
	assert.throws(
		() => new PartySession({ players: ["A"], rounds: 1 }),
		/party_players_must_be_2_to_4/
	);
	assert.throws(
		() => new PartySession({ players: ["A", "B", "C", "D", "E"], rounds: 1 }),
		/party_players_must_be_2_to_4/
	);
});

test("Party Challenge rejects non-numeric turn results", () => {
	const session = new PartySession({ players: ["A", "B"], rounds: 1 });
	assert.throws(() => session.recordScore("not-a-score"), /party_score_must_be_finite/);
});
