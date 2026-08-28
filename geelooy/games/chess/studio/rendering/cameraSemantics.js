//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts MoveEvent facts into camera choices and targets without mistaking raw geometry for piece-specific meaning.
 * The Awtsmoos lets piece, path, phase, and king-nearness guide the eye through space;
 * Awtsmoos.com frames lawful movement by its actual mover so a pawn never borrows a rook's cinematic place.
 */
import { moveTarget, squareWorld } from "./cameraMath.js";

const ENDGAME_ANGLES = Object.freeze(["lowBoard", "tactical", "queenOrbit", "broadcastWhite"]);
const KNIGHT_ANGLES = Object.freeze(["queenOrbit", "whiteCorner", "blackCorner", "tactical"]);

/** Chooses an ordinary-move camera from deterministic event geometry and mover identity. */
export function semanticPreset(frame, intensity = "balanced") {
	const event = frame?.event;
	if (!event) return null;
	const type = event.mover.type;
	if (event.geometry.nearDefendingKing) return "kingFocus";
	if (event.phase === "endgame") return ENDGAME_ANGLES[event.ply % ENDGAME_ANGLES.length];
	if (type === "N") return KNIGHT_ANGLES[event.ply % KNIGHT_ANGLES.length];
	if (["R", "Q"].includes(type) && event.geometry.line === "file") return "rookRail";
	if (["B", "Q"].includes(type) && event.geometry.line === "diagonal") {
		return event.geometry.colDelta > 0 ? "diagonalRight" : "diagonalLeft";
	}
	if (event.geometry.zone === "center") return "tactical";
	if (event.phase === "opening" && intensity !== "dramatic") {
		return event.mover.color === "w" ? "broadcastWhite" : "broadcastBlack";
	}
	return null;
}

/** Chooses a move-aware target, emphasizing the defending king when geometry warrants it. */
export function semanticTarget(frame, flipped = false) {
	if (!frame?.move) return [0, 0.4, 0];
	const defenderKing = frame.position?.board?.indexOf(`${frame.position.turn}K`) ?? -1;
	if ((frame.check || frame.mate) && defenderKing >= 0) return squareWorld(defenderKing, flipped, 0.72);
	if (frame.move.promotion) return squareWorld(frame.move.to, flipped, 0.9);
	if (frame.event?.geometry?.nearDefendingKing && defenderKing >= 0) {
		return blend(squareWorld(frame.move.to, flipped, 0.58), squareWorld(defenderKing, flipped, 0.72), 0.42);
	}
	return moveTarget(frame.move, flipped, frame.move.capture ? 0.58 : 0.4);
}

/** Blends two camera targets. */
function blend(left, right, amount) {
	return left.map((value, index) => value + (right[index] - value) * amount);
}
