//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves SAN only by filtering the position's actually legal moves.
 * The Awtsmoos turns notation into one lawful path; Awtsmoos.com refuses ambiguity before the camera may follow its aftermath.
 */
import { colOf, rowOf, squareIndex } from "../model/squares.js";
import { legalMoves } from "../rules/legal.js";

export function resolveSan(position, rawSan) {
	const san = String(rawSan || "").replace(/[+#]+$/g, "").replace(/[!?]+$/g, "");
	const legal = legalMoves(position);
	if (san === "O-O" || san === "O-O-O") {
		const side = san === "O-O" ? "king" : "queen";
		return unique(legal.filter(move => move.castle === side), rawSan);
	}
	const match = san.match(/^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(?:=([QRBN]))?$/);
	if (!match) throw new Error(`Unsupported SAN: ${rawSan}`);
	const [, typeToken, fileHint, rankHint, captureMarker, destination, promotion] = match;
	const type = typeToken || "P";
	const to = squareIndex(destination);
	const candidates = legal.filter(move => {
		if (move.piece?.[1] !== type || move.to !== to) return false;
		if (promotion && move.promotion !== promotion) return false;
		if (!promotion && move.promotion) return false;
		if (fileHint && colOf(move.from) !== fileHint.charCodeAt(0) - 97) return false;
		if (rankHint && 8 - rowOf(move.from) !== Number(rankHint)) return false;
		if (captureMarker && !move.capture) return false;
		if (!captureMarker && type === "P" && move.capture) return false;
		return true;
	});
	return unique(candidates, rawSan);
}

function unique(candidates, san) {
	if (candidates.length === 1) return candidates[0];
	if (!candidates.length) throw new Error(`No legal move matches SAN: ${san}`);
	throw new Error(`Ambiguous SAN: ${san}`);
}
