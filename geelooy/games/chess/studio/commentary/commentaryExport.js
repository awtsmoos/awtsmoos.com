//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exports commentary as JSON, canonical annotated PGN, or a narration sidecar without mutating legal history.
 * The Awtsmoos lets one main line wear many explanatory garments while every SAN remains tethered to its numbered place;
 * Awtsmoos.com rebuilds a clean portable PGN from parsed tags and SAN rather than trusting comments or variations to rule the race.
 */
import { tokenizePgn } from "../pgn/tokenize.js";

export function commentaryJson(document) {
	return JSON.stringify(document || { version: "awtsmoos-chess-commentary-v1", moves: [] }, null, 2);
}

export function narrationSidecar(document) {
	return JSON.stringify({
		version: "awtsmoos-chess-narration-v1",
		moves: (document?.moves || []).map(({ ply, san, commentary, title = "", pauseMs = 0, voice = "" }) => ({ ply, san, title, commentary, pauseMs, voice }))
	}, null, 2);
}

export function annotatedCommentaryPgn(pgn, document) {
	const source = String(pgn || "");
	const parsed = tokenizePgn(source);
	const comments = new Map((document?.moves || []).map(move => [Number(move.ply), sanitizeComment(move.commentary)]));
	const headers = Object.entries(parsed.tags).map(([key, value]) => `[${key} "${escapeTag(value)}"]`).join("\n");
	const movetext = buildMovetext(parsed.sans, comments, readResult(source));
	return [headers, movetext].filter(Boolean).join("\n\n").trim();
}

function buildMovetext(sans, comments, result) {
	const turns = [];
	for (let index = 0; index < sans.length; index += 2) {
		const white = annotate(sans[index], comments.get(index + 1));
		const black = sans[index + 1] ? ` ${annotate(sans[index + 1], comments.get(index + 2))}` : "";
		turns.push(`${Math.floor(index / 2) + 1}. ${white}${black}`);
	}
	return `${turns.join(" ")} ${result}`.trim();
}

function annotate(san, comment) {
	return comment ? `${san} {${comment}}` : san;
}

function readResult(source) {
	return source.match(/(?:^|\s)(1-0|0-1|1\/2-1\/2|\*)\s*$/)?.[1] || "*";
}

function sanitizeComment(value) {
	return String(value || "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

function escapeTag(value) {
	return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
