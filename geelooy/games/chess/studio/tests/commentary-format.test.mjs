//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves imported AI narration cannot silently detach its SAN from the legal Chess Studio timeline.
 * The Awtsmoos lets commentary remain creative while the move record remains exact;
 * Awtsmoos.com rejects a beautiful sentence when its finite ply or SAN points at the wrong act.
 */
import assert from "node:assert/strict";
import { COMMENTARY_VERSION, parseCommentaryDocument } from "../commentary/commentaryFormat.js";

const frames = [
	{ ply: 0, san: "" },
	{ ply: 1, san: "e4" },
	{ ply: 2, san: "e5" },
	{ ply: 3, san: "Nf3" }
];

const valid = parseCommentaryDocument(JSON.stringify({
	version: COMMENTARY_VERSION,
	moves: [{ ply: 1, san: "e4", commentary: "White occupies the center." }]
}), frames);
assert.equal(valid.moves[0].san, "e4");
assert.throws(() => parseCommentaryDocument(JSON.stringify({
	version: COMMENTARY_VERSION,
	moves: [{ ply: 2, san: "c5", commentary: "Wrong move." }]
}), frames), /SAN mismatch/);
assert.throws(() => parseCommentaryDocument(JSON.stringify({
	version: COMMENTARY_VERSION,
	moves: [
		{ ply: 1, san: "e4", commentary: "First." },
		{ ply: 1, san: "e4", commentary: "Duplicate." }
	]
}), frames), /more than once/);
console.log("COMMENTARY_FORMAT_PASS");
