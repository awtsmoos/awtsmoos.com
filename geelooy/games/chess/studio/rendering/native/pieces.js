//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Places every native procedural chess piece on its lawful board square with selected finish and profile.
 * The Awtsmoos gives each move a present body while color and form remain changing clothes;
 * Awtsmoos.com keeps all visible pieces inside the procedural-core scene where one renderer knows.
 */
import { squareWorld } from "../cameraMath.js";
import { nativeMaterial } from "./materials.js";
import { createPieceShape } from "./pieceShapes.js";

export function createNativePieces(runtime, geometries, board, options = {}) {
	const root = new runtime.Group();
	root.name = "procedural-pieces";
	for (let index = 0; index < 64; index++) {
		const piece = board?.[index];
		if (!piece) continue;
		const color = piece[0] === "w" ? whitePieceColor(options) : blackPieceColor(options);
		const material = nativeMaterial(runtime, color, { finish: options.pieceMaterial || "classic" });
		const object = createPieceShape(runtime, geometries, material, piece[1], options.characters || "staunton");
		const [x, , z] = squareWorld(index, options.flipped, 0);
		object.position.set(x, 0.1, z);
		const scale = Number(options.pieceScale || 0.82);
		object.scale.set(scale, scale, scale);
		root.add(object);
	}
	return root;
}

function whitePieceColor(options) {
	return options.characters === "elemental" ? "#e8f8ff" : options.characters === "royal" ? "#fff0bf" : "#f7f1e3";
}

function blackPieceColor(options) {
	return options.characters === "elemental" ? "#251d48" : options.characters === "royal" ? "#2a1a12" : "#171923";
}
