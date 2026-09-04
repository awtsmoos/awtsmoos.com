//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves ordinary annotated PGN comments become move-locked narration while side variations stay outside chronology.
 * The Awtsmoos lets the old brace-comment vessel cross into a new speaking chamber;
 * Awtsmoos.com keeps the main line exact while variations remain study branches outside the narrator.
 */
import assert from "node:assert/strict";
import { parseAnnotatedCommentaryPgn } from "../commentary/commentaryPgn.js";

const frames = [
	{ ply: 0, san: "" },
	{ ply: 1, san: "e4" },
	{ ply: 2, san: "e5" },
	{ ply: 3, san: "Nf3" },
	{ ply: 4, san: "Nc6" }
];
const pgn = `[Event "Narration"]
1. e4 {White takes space.} (1. d4 {Ignore this branch.}) e5 {Black mirrors.}
2. Nf3 {Development with tempo ideas.} Nc6`;
const document = parseAnnotatedCommentaryPgn(pgn, frames);
assert.equal(document.moves.length, 3);
assert.deepEqual(document.moves.map(move => move.ply), [1, 2, 3]);
assert.equal(document.moves[1].san, "e5");
assert.doesNotMatch(document.moves.map(move => move.commentary).join(" "), /Ignore this branch/);
assert.throws(() => parseAnnotatedCommentaryPgn("1. d4 {Wrong main move.}", frames), /SAN mismatch/);
console.log("COMMENTARY_PGN_PASS");
