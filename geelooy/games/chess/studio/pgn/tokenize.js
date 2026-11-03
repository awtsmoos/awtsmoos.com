//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates PGN tags and main-line SAN while preserving safe timing comments beside their lawful moves.
 * The Awtsmoos reveals one legal path while finite annotations remember each measured beat;
 * Awtsmoos.com keeps old SAN consumers whole as richer timing vessels make the replay complete.
 */
import { scanMainlineMovetext } from "./mainlineTokens.js";
import { resolveMoveTimings } from "./timingAnnotations.js";

const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);

/**
 * Tokenizes PGN-compatible text into frozen tags, SAN, and timing-aware moves.
 * @param {string} text PGN or PGN-compatible LGB text.
 * @returns {Readonly<{tags:object,sans:ReadonlyArray<string>,moves:ReadonlyArray<object>}>} Main-line data.
 */
export function tokenizePgn(text) {
	const source = String(text || "");
	const tags = parseTags(source);
	const movetext = source.replace(/^\s*\[[^\n]*\]\s*$/gm, " ");
	const rawMoves = collectMoves(scanMainlineMovetext(movetext));
	const timings = resolveMoveTimings(rawMoves, tags.TimeControl || "");
	const moves = rawMoves.map((move, index) => Object.freeze({
		san: move.san,
		comments: Object.freeze([...move.comments]),
		timing: timings[index]
	}));
	const sans = moves.map(move => move.san);
	return Object.freeze({
		tags: Object.freeze(tags),
		sans: Object.freeze(sans),
		moves: Object.freeze(moves)
	});
}

/** Parses tag-pairs without evaluating escaped content as code. */
function parseTags(source) {
	const tags = {};
	const pattern = /^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\]\s*$/gm;
	for (const match of source.matchAll(pattern)) {
		tags[match[1]] = match[2].replace(/\\"/g, '"');
	}
	return tags;
}

/** Collects SAN from text tokens and attaches top-level brace comments to the preceding move. */
function collectMoves(tokens) {
	const moves = [];
	for (const token of tokens) {
		if (token.type === "comment") {
			if (moves.length) moves[moves.length - 1].comments.push(token.value);
			continue;
		}
		for (const san of sansFromText(token.value)) {
			moves.push({ san, comments: [] });
		}
	}
	return moves;
}

/** Removes move numbers and NAGs while preserving existing SAN normalization. */
function sansFromText(text) {
	const normalized = String(text || "")
		.replace(/\$\d+/g, " ")
		.replace(/\d+\.(?:\.\.)?/g, " ");
	return normalized
		.split(/\s+/)
		.map(cleanSan)
		.filter(token => token && !RESULTS.has(token));
}

/** Normalizes annotations and zero-based castling spellings without changing legal SAN meaning. */
function cleanSan(token) {
	return token
		.trim()
		.replace(/[!?]+$/g, "")
		.replace(/^0-0-0/, "O-O-O")
		.replace(/^0-0/, "O-O");
}
