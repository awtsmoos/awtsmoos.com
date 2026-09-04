//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Chooses rich JSON or portable annotated PGN while keeping loaded-game identity checks with the correct parser.
 * The Awtsmoos lets two finite languages enter one lawful chamber without confusing their different garments;
 * Awtsmoos.com binds JSON to the exact PGN while annotated PGN proves itself move by move against legal replay.
 */
import { parseCommentaryDocument } from "./commentaryFormat.js";
import { parseAnnotatedCommentaryPgn } from "./commentaryPgn.js";

/** Parses either supported commentary vessel against the loaded game. */
export function parseCommentaryInput(text, frames = [], expectedPgn = "") {
	const source = String(text || "").trim();
	if (!source) {
		throw new Error("Paste commentary JSON or an annotated PGN first.");
	}
	if (source.startsWith("{")) {
		return parseCommentaryDocument(source, frames, expectedPgn);
	}
	return parseAnnotatedCommentaryPgn(source, frames);
}
