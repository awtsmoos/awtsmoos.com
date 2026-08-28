//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates the immutable semantic MoveEvent shared by playback, camera, cinema, and later review enrichment.
 * The Awtsmoos reveals one lawful move as many useful facets without splitting its truth apart;
 * Awtsmoos.com lets every consumer receive the same ohr through a stable semantic heart.
 */
import { describeMoveGeometry } from "./geometry.js";
import { describeMaterialChange } from "./material.js";
import { classifyGamePhase } from "./phase.js";

/**
 * Creates deterministic semantics from one legal before/move/after transition.
 * @param {{position:object}|object} beforeFrame Frame or position before the move.
 * @param {{position:object,move:object,ply:number,check:boolean,mate:boolean,san:string}} afterFrame Completed replay frame.
 * @returns {Readonly<object>|null} Semantic event, or null for the starting frame.
 */
export function createMoveEvent(beforeFrame, afterFrame) {
	const move = afterFrame?.move;
	if (!move) return null;
	const beforePosition = beforeFrame?.position || beforeFrame;
	const afterPosition = afterFrame.position;
	const geometry = describeMoveGeometry(move, afterPosition);
	const material = describeMaterialChange(beforePosition, afterPosition, move);
	return Object.freeze({
		ply: afterFrame.ply,
		san: afterFrame.san,
		kind: moveKind(move),
		phase: classifyGamePhase(afterPosition, afterFrame.ply),
		mover: Object.freeze({ color: move.piece?.[0] || beforePosition.turn, type: move.piece?.[1] || null }),
		forcing: Object.freeze({ check: Boolean(afterFrame.check), mate: Boolean(afterFrame.mate) }),
		geometry,
		material,
		importance: deterministicImportance(move, afterFrame, geometry, material)
	});
}

/** Names the move's legally explicit kind. */
function moveKind(move) {
	if (move.castle) return "castle";
	if (move.promotion) return "promotion";
	if (move.enPassant) return "en-passant";
	if (move.capture) return "capture";
	return "quiet";
}

/**
 * Produces deterministic cinematic importance without engine evaluation claims.
 * Checkmate is definitionally terminal and therefore receives the maximum semantic weight.
 */
function deterministicImportance(move, frame, geometry, material) {
	if (frame.mate) return 100;
	let score = 12;
	if (move.capture) score += 12 + material.capturedValue * 3;
	if (move.castle) score += 16;
	if (move.promotion) score += 28;
	if (frame.check) score += 22;
	if (geometry.nearDefendingKing) score += 8;
	if (geometry.zone === "center") score += 4;
	return Math.min(99, Math.round(score));
}
