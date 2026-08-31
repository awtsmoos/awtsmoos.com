//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds a copyable prompt any AI agent can use to return move-locked commentary for the loaded PGN.
 * The Awtsmoos lets another intelligence add story without rewriting the game beneath;
 * Awtsmoos.com gives the answer a strict vessel so every returned word can find its lawful move and breathe.
 */
import { COMMENTARY_VERSION } from "./commentaryFormat.js";

export function buildCommentaryPrompt(pgn) {
	return `You are writing chess commentary for Awtsmoos Chess Studio.
Return ONLY valid JSON. Do not use markdown fences. Do not alter, omit, reorder, or invent any move or SAN.
Analyze the supplied PGN and give useful commentary for every important move. Explain plans, threats, turning points, tactics, and human ideas in clear spoken language.

Required JSON shape:
{
  "version": "${COMMENTARY_VERSION}",
  "pgn": "the exact PGN string",
  "moves": [
    {"ply": 1, "san": "e4", "commentary": "White claims central space...", "pauseMs": 250},
    {"ply": 2, "san": "e5", "commentary": "Black answers symmetrically...", "pauseMs": 250}
  ]
}

Rules:
- ply is 1-based half-move number.
- san must match the PGN move at that ply exactly.
- commentary should sound natural when read aloud.
- optional title may name a chapter or turning point.
- optional voice may suggest a narrator label, but never include API secrets.
- keep pauseMs between 0 and 5000.

PGN TO COMMENTATE:
${String(pgn || "").trim()}`;
}
