//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Extracts move geometry and board-zone facts without claiming tactics that require engine proof.
 * The Awtsmoos gives every path a direction while every square remains a vessel renewed;
 * Awtsmoos.com lets camera and cinema share that geometry without confusing proximity with tactical truth construed.
 */
import { colOf, rowOf, squareName } from "../model/squares.js";

/**
 * Builds immutable geometric facts for one move.
 * @param {{from:number,to:number,piece?:string}} move Fully described legal move.
 * @param {{board:Array<string|null>}} afterPosition Position after the move.
 * @returns {Readonly<object>} Move-vector and destination-zone facts.
 */
export function describeMoveGeometry(move, afterPosition) {
	const fromRow = rowOf(move.from);
	const fromCol = colOf(move.from);
	const toRow = rowOf(move.to);
	const toCol = colOf(move.to);
	const rowDelta = toRow - fromRow;
	const colDelta = toCol - fromCol;
	const defenderKing = afterPosition?.board?.indexOf(`${afterPosition.turn}K`) ?? -1;
	return Object.freeze({
		from: squareName(move.from),
		to: squareName(move.to),
		rowDelta,
		colDelta,
		distance: Math.max(Math.abs(rowDelta), Math.abs(colDelta)),
		line: movementLine(rowDelta, colDelta, move.piece?.[1]),
		zone: destinationZone(toRow, toCol),
		nearDefendingKing: defenderKing >= 0 && kingDistance(move.to, defenderKing) <= 2
	});
}

/**
 * Describes the geometric line of travel without assigning tactical meaning.
 * @param {number} rowDelta Rank-axis displacement.
 * @param {number} colDelta File-axis displacement.
 * @param {string|undefined} pieceType Moving piece type.
 * @returns {string} Geometric movement family.
 */
function movementLine(rowDelta, colDelta, pieceType) {
	if (pieceType === "N") return "knight-leap";
	if (rowDelta === 0) return "rank";
	if (colDelta === 0) return "file";
	if (Math.abs(rowDelta) === Math.abs(colDelta)) return "diagonal";
	return "offset";
}

/**
 * Classifies destination location for framing and pacing.
 * @param {number} row Board row.
 * @param {number} col Board column.
 * @returns {"center"|"extended-center"|"edge"|"wing"} Destination zone.
 */
function destinationZone(row, col) {
	if ([3, 4].includes(row) && [3, 4].includes(col)) return "center";
	if (row >= 2 && row <= 5 && col >= 2 && col <= 5) return "extended-center";
	if (row === 0 || row === 7 || col === 0 || col === 7) return "edge";
	return "wing";
}

/**
 * Measures Chebyshev distance between board squares.
 * @param {number} left First square index.
 * @param {number} right Second square index.
 * @returns {number} King-move distance.
 */
function kingDistance(left, right) {
	return Math.max(Math.abs(rowOf(left) - rowOf(right)), Math.abs(colOf(left) - colOf(right)));
}
