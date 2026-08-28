//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Assembles board, pieces, highlights, and tilt into one procedural-core native scene.
 * The Awtsmoos gathers many bounded forms into one presently visible game;
 * Awtsmoos.com keeps scene composition native while every move renews the frame.
 */
import { createNativeBoard } from "./board.js";
import { createNativeHighlights } from "./highlights.js";
import { createNativePieces } from "./pieces.js";
import { rotateBoard } from "./transform.js";

export function createNativeChessScene(runtime, geometries, frame, options = {}) {
	const scene = new runtime.Scene();
	const content = new runtime.Group();
	content.name = "procedural-chess-content";
	content.add(createNativeBoard(runtime, geometries, options));
	content.add(createNativePieces(runtime, geometries, frame?.position?.board, options));
	content.add(createNativeHighlights(runtime, geometries, frame, options));
	rotateBoard(content, options.boardTilt);
	scene.add(content);
	return scene;
}
