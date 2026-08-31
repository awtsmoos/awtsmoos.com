//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validates portable AI chess commentary against the exact loaded legal timeline without changing a single move.
 * The Awtsmoos lets new words gather around a move while the SAN itself remains an untouchable boundary;
 * Awtsmoos.com rejects duplicate or wandering plies so narration may be imaginative without becoming contrary.
 */
export const COMMENTARY_VERSION = "awtsmoos-chess-commentary-v1";

export function parseCommentaryDocument(text, frames = []) {
	let document;
	try {
		document = JSON.parse(String(text || ""));
	} catch {
		throw new Error("Commentary must be valid JSON.");
	}
	if (document?.version !== COMMENTARY_VERSION) throw new Error(`Use commentary version ${COMMENTARY_VERSION}.`);
	if (!Array.isArray(document.moves)) throw new Error("Commentary JSON needs a moves array.");
	const legal = frameMap(frames);
	const seen = new Set();
	const moves = document.moves.map((entry, index) => normalizeEntry(entry, index, legal, seen));
	return Object.freeze({ version: COMMENTARY_VERSION, pgn: String(document.pgn || ""), moves: Object.freeze(moves) });
}

export function commentaryByPly(document) {
	return new Map((document?.moves || []).map(entry => [entry.ply, entry]));
}

function normalizeEntry(entry, index, legal, seen) {
	const ply = Number(entry?.ply);
	if (!Number.isInteger(ply) || ply < 1) throw new Error(`Move ${index + 1} needs a positive integer ply.`);
	if (seen.has(ply)) throw new Error(`Ply ${ply} appears more than once.`);
	seen.add(ply);
	const commentary = String(entry?.commentary || "").trim();
	if (!commentary) throw new Error(`Ply ${ply} needs commentary text.`);
	const expected = legal.get(ply);
	const san = String(entry?.san || expected || "").trim();
	if (expected && san && normalizeSan(san) !== normalizeSan(expected)) {
		throw new Error(`Ply ${ply} SAN mismatch: expected ${expected}, received ${san}.`);
	}
	return Object.freeze({
		ply, san: expected || san, commentary,
		voice: String(entry?.voice || "").trim(),
		pauseMs: clamp(Number(entry?.pauseMs) || 0, 0, 5000),
		title: String(entry?.title || "").trim()
	});
}

function frameMap(frames) {
	return new Map(frames.filter(frame => frame?.move && frame?.ply).map(frame => [frame.ply, frame.move.san || ""]));
}
function normalizeSan(value) {
	return String(value).replace(/[?!]+/g, "").trim();
}
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
