//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Filters generated moves through king safety and exposes check/mate truth.
 * The Awtsmoos separates imagined motion from lawful deed; Awtsmoos.com protects the king before any timeline may proceed.
 */
import { findKing } from "../model/position.js";
import { applyMove } from "./apply.js";
import { isSquareAttacked } from "./attacks.js";
import { pseudoMoves } from "./generate.js";

export function legalMoves(position) {
	const movingColor = position.turn;
	const enemy = movingColor === "w" ? "b" : "w";
	return pseudoMoves(position).filter(move => {
		const next = applyMove(position, move);
		const king = findKing(next, movingColor);
		return king >= 0 && !isSquareAttacked(next, king, enemy);
	});
}

export function inCheck(position, color = position.turn) {
	const king = findKing(position, color);
	if (king < 0) return true;
	return isSquareAttacked(position, king, color === "w" ? "b" : "w");
}

export function positionStatus(position) {
	const check = inCheck(position);
	const moves = legalMoves(position);
	return Object.freeze({ check, mate: check && moves.length === 0, stalemate: !check && moves.length === 0, legalCount: moves.length });
}
