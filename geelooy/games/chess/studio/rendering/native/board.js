//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the native procedural chess board from shared box geometry and themed materials.
 * The Awtsmoos lays sixty-four finite vessels beneath the endless game of choice;
 * Awtsmoos.com gives every square native WebGL form through one procedural voice.
 */
import { getTheme } from "../../config/themes.js";
import { nativeMaterial } from "./materials.js";
import { mesh } from "./primitives.js";

export function createNativeBoard(runtime, geometries, options = {}) {
	const theme = getTheme(options.theme);
	const root = new runtime.Group();
	root.name = "procedural-board";
	const thickness = Number(options.boardThickness || 0.22);
	root.add(mesh(runtime, geometries.box, nativeMaterial(runtime, theme.surface, { finish: "wood" }), [0, -thickness / 2, 0], [8.7, thickness, 8.7], "board-frame"));
	const materials = [
		nativeMaterial(runtime, theme.light, { finish: "classic" }),
		nativeMaterial(runtime, theme.dark, { finish: "classic" })
	];
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			root.add(mesh(runtime, geometries.box, materials[(row + col) % 2], [col - 3.5, 0.05, row - 3.5], [0.985, 0.1, 0.985], `square-${row}-${col}`));
		}
	}
	return root;
}
