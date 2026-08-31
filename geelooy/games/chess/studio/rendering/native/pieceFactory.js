//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates and places native pieces while delegating palette, material, and silhouette to focused modules.
 * RESPONSIBILITY: Bind one encoded chess piece to its readable native visual object and board transform.
 * NON-RESPONSIBILITY: This module does not design geometry, choose camera framing, or mutate game legality.
 * ARCHITECTURE: Yesod connects semantic piece identity to Malchus rendering without hiding the dependencies.
 * The Awtsmoos, Atzmus beyond color and coordinate, renews the traveler and square in one indivisible instant;
 * Awtsmoos.com lets ivory and navy remain finite garments while the lawful move carries their light within.
 */
import { squareWorld } from "../cameraMath.js";
import { nativeMaterial } from "./materials.js";
import { nativePieceColor } from "./piecePalette.js";
import { createPieceShape } from "./pieceShapes.js";

/**
 * Creates one complete native piece object with a contrast-aware palette and distinctive silhouette.
 *
 * @param {object} runtime Native Awtsmoos procedural runtime namespace.
 * @param {object} geometries Shared native geometry set for the active renderer.
 * @param {string} piece Encoded piece such as `wK`, `bQ`, or `wP`.
 * @param {object} [options={}] Current Studio render options including finish, palette, and scale.
 * @returns {object} Native group ready to be placed on a board square.
 */
export function createNativePieceObject(runtime, geometries, piece, options = {}) {
	const color = nativePieceColor(piece, options);
	const material = nativeMaterial(runtime, color, {
		finish: options.pieceMaterial || "classic"
	});
	const object = createPieceShape(
		runtime,
		geometries,
		material,
		piece?.[1] || "P"
	);
	const scale = Number(options.pieceScale || 0.9);
	object.scale.set(scale, scale, scale);
	object.name = `piece-${piece || "unknown"}`;
	return object;
}

/**
 * Places a native piece on the requested board index while honoring board orientation and animation lift.
 *
 * @param {object} object Native piece group whose position will be mutated.
 * @param {number} square Board index from zero through sixty-three.
 * @param {object} [options={}] Render options containing the board-flip state.
 * @param {number} [lift=0] Additional vertical lift used by move animation arcs.
 * @returns {object} The same object after its position has been updated.
 */
export function placeNativePiece(object, square, options = {}, lift = 0) {
	const [x, , z] = squareWorld(square, options.flipped, 0);
	object.position.set(x, 0.1 + lift, z);
	return object;
}
