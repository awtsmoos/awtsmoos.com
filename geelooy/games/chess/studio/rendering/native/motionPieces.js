//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds a transitional procedural piece root from immutable legal motion without mutating either endpoint position.
 * The Awtsmoos lets one piece travel while the lawful before and after boards remain untouched in their place;
 * Awtsmoos.com renders glide, leap, capture, castle, and promotion through one native procedural grace.
 */
import { squareWorld } from "../cameraMath.js";
import { createNativePieceObject } from "./pieceFactory.js";
import { createNativePieces } from "./pieces.js";

/** Builds static or in-between native pieces for one motion state. */
export function createNativeMotionPieces(runtime, geometries, frame, options = {}, motion = null) {
	if (!motion || motion.progress >= 0.999) {
		return createNativePieces(runtime, geometries, frame?.position?.board, options);
	}
	const hidden = hiddenSquares(motion);
	const root = createNativePieces(runtime, geometries, motion.beforeBoard, { ...options, hiddenSquares: hidden });
	root.name = "procedural-motion-pieces";
	root.add(movingPiece(runtime, geometries, motion.visiblePiece, motion.from, motion.to, motion.travel, motion.arc, options));
	if (motion.castleRook) {
		root.add(movingPiece(
			runtime,
			geometries,
			motion.castleRook.piece,
			motion.castleRook.from,
			motion.castleRook.to,
			motion.rookProgress,
			0,
			options
		));
	}
	return root;
}

function hiddenSquares(motion) {
	const hidden = [motion.from];
	if (motion.castleRook) hidden.push(motion.castleRook.from);
	if (motion.captureSquare !== null && !motion.captureVisible) hidden.push(motion.captureSquare);
	return hidden;
}

function movingPiece(runtime, geometries, piece, from, to, progress, arc, options) {
	const object = createNativePieceObject(runtime, geometries, piece, options);
	const start = squareWorld(from, options.flipped, 0);
	const end = squareWorld(to, options.flipped, 0);
	object.position.set(
		mix(start[0], end[0], progress),
		0.1 + arc,
		mix(start[2], end[2], progress)
	);
	object.name = `moving-${piece}-${from}-${to}`;
	return object;
}

function mix(from, to, progress) {
	return from + (to - from) * progress;
}
