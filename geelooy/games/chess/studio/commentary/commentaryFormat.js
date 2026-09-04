//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Validates rich commentary against both the loaded PGN and its exact legal replay timeline.
 * The Awtsmoos renews word and move together while PGN and SAN remain truthful finite boundaries;
 * Awtsmoos.com lets imagination speak only after the record proves both which game and which ply receive the voice.
 */
export const COMMENTARY_VERSION = "awtsmoos-chess-commentary-v1";

/** Parses rich commentary and optionally binds it to the exact loaded PGN. */
export function parseCommentaryDocument(text, frames = [], expectedPgn = "") {
	let document;
	try {
		document = JSON.parse(String(text || ""));
	} catch {
		throw new Error("Commentary must be valid JSON or an annotated PGN.");
	}
	if (document?.version !== COMMENTARY_VERSION) {
		throw new Error(`Use commentary version ${COMMENTARY_VERSION}.`);
	}
	if (!Array.isArray(document.moves)) {
		throw new Error("Commentary JSON needs a moves array.");
	}
	validatePgnBinding(document.pgn, expectedPgn);
	const legal = legalSanByPly(frames);
	const seen = new Set();
	const moves = document.moves.map((entry, index) => normalizeEntry(entry, index, legal, seen));
	return Object.freeze({
		version: COMMENTARY_VERSION,
		pgn: String(document.pgn || ""),
		moves: Object.freeze(moves)
	});
}

export function commentaryByPly(document) {
	return new Map((document?.moves || []).map(entry => [entry.ply, entry]));
}

export function normalizeSan(value) {
	return String(value || "").replace(/[?!]+/g, "").trim();
}

function validatePgnBinding(received, expected) {
	if (!String(expected || "").trim()) {
		return;
	}
	if (!String(received || "").trim()) {
		throw new Error("Commentary JSON must include the exact currently loaded PGN.");
	}
	if (normalizePgn(received) !== normalizePgn(expected)) {
		throw new Error("Commentary JSON belongs to a different PGN than the game currently loaded in Studio.");
	}
}

function normalizePgn(value) {
	return String(value || "").replace(/\r\n?/g, "\n").trim();
}

function normalizeEntry(entry, index, legal, seen) {
	const ply = Number(entry?.ply);
	if (!Number.isInteger(ply) || ply < 1) {
		throw new Error(`Move ${index + 1} needs a positive integer ply.`);
	}
	if (seen.has(ply)) {
		throw new Error(`Ply ${ply} appears more than once.`);
	}
	seen.add(ply);
	const commentary = String(entry?.commentary || "").trim();
	if (!commentary) {
		throw new Error(`Ply ${ply} needs commentary text.`);
	}
	const expected = legal.get(ply) || "";
	const received = String(entry?.san || expected).trim();
	if (expected && normalizeSan(received) !== normalizeSan(expected)) {
		throw new Error(`Ply ${ply} SAN mismatch: expected ${expected}, received ${received || "(blank)"}.`);
	}
	return Object.freeze({
		ply,
		san: expected || received,
		commentary,
		voice: String(entry?.voice || "").trim(),
		pauseMs: clamp(Number(entry?.pauseMs) || 0, 0, 5000),
		title: String(entry?.title || "").trim()
	});
}

function legalSanByPly(frames) {
	return new Map(
		frames.filter(frame => frame?.ply && frame?.san).map(frame => [frame.ply, frame.san])
	);
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
