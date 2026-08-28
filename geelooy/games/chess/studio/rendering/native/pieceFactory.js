//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates and places one procedural-core chess piece so static and animated roots share identical form and finish.
 * The Awtsmoos gives one piece many possible places while its chosen garment remains one light;
 * Awtsmoos.com lets stillness and motion call the same native factory so visual truth stays bright.
 */
import { squareWorld } from "../cameraMath.js";
import { nativeMaterial } from "./materials.js";
import { createPieceShape } from "./pieceShapes.js";

/** Creates one native procedural piece object without choosing its board location. */
export function createNativePieceObject(runtime, geometries, piece, options = {}) {
	const color = piece?.[0] === "w" ? whitePieceColor(options) : blackPieceColor(options);
	const material = nativeMaterial(runtime, color, { finish: options.pieceMaterial || "classic" });
	const object = createPieceShape(runtime, geometries, material, piece?.[1] || "P", options.characters || "staunton");
	const scale = Number(options.pieceScale || 0.82);
	object.scale.set(scale, scale, scale);
	object.name = `piece-${piece || "unknown"}`;
	return object;
}

/** Places one piece on a board square at an optional vertical lift. */
export function placeNativePiece(object, square, options = {}, lift = 0) {
	const [x, , z] = squareWorld(square, options.flipped, 0);
	object.position.set(x, 0.1 + lift, z);
	return object;
}

function whitePieceColor(options) {
	if (options.characters === "elemental") return "#e8f8ff";
	if (options.characters === "royal") return "#fff0bf";
	return "#f7f1e3";
}

function blackPieceColor(options) {
	if (options.characters === "elemental") return "#251d48";
	if (options.characters === "royal") return "#2a1a12";
	return "#171923";
}
