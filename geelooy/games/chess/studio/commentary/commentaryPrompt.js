//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds strict prompts for either rich JSON or portable annotated PGN without changing chess chronology.
 * The Awtsmoos lets finite language become tactical, historical, comic, cinematic, simple, or profound;
 * Awtsmoos.com gives that freedom a fixed PGN vessel so every external intelligence returns to the same lawful ground.
 */
import { COMMENTARY_VERSION } from "./commentaryFormat.js";

/** Builds a self-contained prompt for any external AI agent. */
export function buildCommentaryPrompt(pgn, customInstructions = "", outputFormat = "json") {
	const exactPgn = String(pgn || "").trim();
	const instructions = String(customInstructions || "").trim();
	const format = outputFormat === "pgn" ? "pgn" : "json";
	const custom = instructions
		? `\nUSER COMMENTARY DIRECTIONS:\n${instructions}\n`
		: "";
	return `${commonRules()}${custom}\n${formatRules(format)}\n\nPGN TO COMMENTATE EXACTLY:\n${exactPgn}`;
}

function commonRules() {
	return `You are the move-by-move commentator for Awtsmoos Chess Studio.
Never change, omit, reorder, normalize, or invent a move or SAN. Preserve the supplied main-line game exactly.
Map commentary deterministically to plies beginning at ply 1. Explain plans, threats, tactics, strategy, positional changes, mistakes, turning points, and human ideas only when useful.
You may be tactical, strategic, historical, dramatic, beginner-friendly, master-level, humorous, cinematic, educational, concise, or accessibility-focused when requested.
Optional chapter titles and a coherent game-story arc are welcome. Never include API keys or credentials.`;
}

function formatRules(format) {
	if (format === "pgn") {
		return `OUTPUT FORMAT: ANNOTATED PGN
Return ONLY the annotated PGN. No markdown fence, introduction, or trailing explanation.
Preserve every original PGN tag, move, SAN token, result, and main-line order. Add ordinary {brace comments} immediately after the moves they explain.
Do not create variations or replacement moves. Comments may contain chapter/story language but never alter the underlying game.`;
	}
	return `OUTPUT FORMAT: AWTSMOOS JSON
Return ONLY valid JSON. No markdown fence, introduction, or trailing explanation.
Use this schema:
{
  "version": "${COMMENTARY_VERSION}",
  "pgn": "the exact supplied PGN string",
  "moves": [
    {"ply": 1, "san": "e4", "title": "The center awakens", "commentary": "White claims central space.", "pauseMs": 180, "voice": ""}
  ]
}
Include one object for every main-line half-move. san must match the supplied PGN exactly. commentary must be natural spoken text.
title and voice are optional. pauseMs is optional and must be 0 through 5000. The pgn field must contain the exact supplied PGN.`;
}
