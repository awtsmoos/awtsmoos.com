//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes recognizable native procedural chess silhouettes from shared frustum and box geometry.
 * The Awtsmoos lets pawn, king, and knight differ through proportion rather than foreign code;
 * Awtsmoos.com reveals each type through native geometry on one procedural road.
 */
import { group, mesh, rotatedMesh } from "./primitives.js";

export function createPieceShape(runtime, geometries, material, type, profile = "staunton") {
	const root = group(runtime, `piece-${type}`);
	const minimal = profile === "minimal";
	root.add(mesh(runtime, geometries.body, material, [0, 0.25, 0], minimal ? [0.34, 0.5, 0.34] : [0.38, 0.5, 0.38]));
	root.add(mesh(runtime, geometries.body, material, [0, 0.68, 0], minimal ? [0.24, 0.45, 0.24] : [0.28, 0.56, 0.28]));
	appendHead(root, runtime, geometries, material, type, profile);
	return root;
}

function appendHead(root, runtime, geometries, material, type, profile) {
	if (type === "P") return void root.add(mesh(runtime, geometries.crown, material, [0, 1.03, 0], [0.22, 0.28, 0.22]));
	if (type === "R") return void root.add(mesh(runtime, geometries.box, material, [0, 1.05, 0], [0.52, 0.28, 0.52]));
	if (type === "N") {
		root.add(rotatedMesh(runtime, geometries.cone, material, [0, 1.08, -0.05], [0.32, 0.62, 0.32], [1, 0, 0], -0.45));
		return;
	}
	root.add(mesh(runtime, geometries.cone, material, [0, 1.08, 0], [type === "B" ? 0.3 : 0.35, 0.52, type === "B" ? 0.3 : 0.35]));
	if (type === "B") return void root.add(mesh(runtime, geometries.crown, material, [0, 1.39, 0], [0.11, 0.15, 0.11]));
	if (type === "Q") return void appendQueenCrown(root, runtime, geometries, material, profile);
	appendKingCross(root, runtime, geometries, material);
}

function appendQueenCrown(root, runtime, geometries, material, profile) {
	const radius = profile === "royal" ? 0.24 : 0.2;
	for (let index = 0; index < 4; index++) {
		const angle = index * Math.PI / 2;
		root.add(mesh(runtime, geometries.crown, material, [Math.cos(angle) * radius, 1.42, Math.sin(angle) * radius], [0.09, 0.18, 0.09]));
	}
}

function appendKingCross(root, runtime, geometries, material) {
	root.add(mesh(runtime, geometries.box, material, [0, 1.48, 0], [0.11, 0.42, 0.11]));
	root.add(mesh(runtime, geometries.box, material, [0, 1.52, 0], [0.36, 0.11, 0.11]));
}
