//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals move squares and direction arrows as translucent native procedural meshes.
 * The Awtsmoos joins origin and destination by a visible ray of intent;
 * Awtsmoos.com keeps every guide inside the same native scene where the move was sent.
 */
import { getTheme } from "../../config/themes.js";
import { squareWorld } from "../cameraMath.js";
import { nativeMaterial } from "./materials.js";
import { mesh, rotatedMesh } from "./primitives.js";

export function createNativeHighlights(runtime, geometries, frame, options = {}) {
	const root = new runtime.Group();
	root.name = "procedural-highlights";
	if (!frame?.move) return root;
	const theme = getTheme(options.theme);
	const color = frame.check || frame.mate ? theme.check : theme.accent;
	const material = nativeMaterial(runtime, color, { opacity: 0.48, finish: "neon", doubleSided: true });
	for (const index of [frame.move.from, frame.move.to]) {
		const [x, , z] = squareWorld(index, options.flipped, 0);
		root.add(mesh(runtime, geometries.box, material, [x, 0.125, z], [0.94, 0.045, 0.94], `highlight-${index}`));
	}
	if (options.moveArrow !== false) appendArrow(root, runtime, geometries, material, frame.move, options.flipped);
	return root;
}

function appendArrow(root, runtime, geometries, material, move, flipped) {
	const from = squareWorld(move.from, flipped, 0.2);
	const to = squareWorld(move.to, flipped, 0.2);
	const dx = to[0] - from[0];
	const dz = to[2] - from[2];
	const length = Math.max(0.2, Math.hypot(dx, dz));
	const center = [(from[0] + to[0]) / 2, 0.2, (from[2] + to[2]) / 2];
	const angle = Math.atan2(dx, dz);
	root.add(rotatedMesh(runtime, geometries.box, material, center, [0.12, 0.075, length * 0.72], [0, 1, 0], angle, "move-arrow"));
	root.add(rotatedMesh(runtime, geometries.cone, material, [to[0], 0.22, to[2]], [0.2, 0.35, 0.2], [1, 0, 0], Math.PI / 2, "move-arrow-head"));
}
