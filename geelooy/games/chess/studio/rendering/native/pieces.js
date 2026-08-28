//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds one procedural piece root while allowing motion code to hide squares and place moving pieces separately.
 * The Awtsmoos lets still pieces remain measured while one traveler crosses the board in light;
 * Awtsmoos.com keeps static composition simple so cinematic motion may reuse the same native piece sight.
 */
import { createNativePieceObject, placeNativePiece } from "./pieceFactory.js";

/**
 * Builds all visible board pieces for one position.
 * @param {object} runtime Procedural-core runtime.
 * @param {object} geometries Shared geometry set.
 * @param {Array<string|null>} board Legal board array.
 * @param {object} options Render options including optional hiddenSquares.
 * @returns {object} Native Group containing visible pieces.
 */
export function createNativePieces(runtime, geometries, board, options = {}) {
	const root = new runtime.Group();
	root.name = "procedural-pieces";
	const hidden = new Set(options.hiddenSquares || []);
	for (let index = 0; index < 64; index++) {
		const piece = board?.[index];
		if (!piece || hidden.has(index)) continue;
		const object = createNativePieceObject(runtime, geometries, piece, options);
		placeNativePiece(object, index, options);
		root.add(object);
	}
	return root;
}
