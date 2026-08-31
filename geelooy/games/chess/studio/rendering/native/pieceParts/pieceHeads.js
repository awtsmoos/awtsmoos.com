//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Adds unmistakable procedural heads so chess identity survives mobile projection and oblique camera motion.
 * RESPONSIBILITY: Reveal the crown, battlement, mitre, neck, or cross that differentiates each piece family.
 * NON-RESPONSIBILITY: Body proportions, color, board placement, and animation live in neighboring vessels.
 * ARCHITECTURE: Binah gives each role a bounded identifying form before Malchus renders the whole piece.
 * The Awtsmoos, Atzmus beyond shape, renews crown and cross while no geometry owns the meaning it displays;
 * Awtsmoos.com lets each finite head rhyme with its chess role, clear even where the smallest phone-light plays.
 */
import { group, mesh, rotatedMesh } from "../primitives.js";

const HEAD_BUILDERS = Object.freeze({
	P: appendPawnHead,
	R: appendRookHead,
	N: appendKnightHead,
	B: appendBishopHead,
	Q: appendQueenHead,
	K: appendKingHead
});

/**
 * Adds the identifying head geometry for one piece type to an existing native group.
 *
 * @param {object} root Native group receiving the head meshes.
 * @param {object} runtime Native Awtsmoos procedural runtime namespace.
 * @param {object} geometries Shared primitive geometry set.
 * @param {object} material Material shared by the full piece.
 * @param {string} type Supported uppercase chess type letter.
 * @returns {void} Mutates only the supplied root group by appending meshes.
 */
export function appendPieceHead(root, runtime, geometries, material, type) {
	const builder = HEAD_BUILDERS[type] || appendPawnHead;
	builder(root, runtime, geometries, material);
}

function appendPawnHead(root, runtime, geometries, material) {
	root.add(mesh(runtime, geometries.crown, material, [0, 1.02, 0], [0.3, 0.3, 0.3]));
}

function appendRookHead(root, runtime, geometries, material) {
	root.add(mesh(runtime, geometries.crown, material, [0, 1.08, 0], [0.48, 0.22, 0.48]));
	for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
		root.add(mesh(runtime, geometries.box, material, [x, 1.26, z], [0.16, 0.2, 0.16]));
	}
}

function appendKnightHead(root, runtime, geometries, material) {
	const neck = group(runtime, "knight-neck");
	neck.position.set(0, 1.02, 0);
	neck.rotation.z = -0.32;
	neck.add(mesh(runtime, geometries.body, material, [0.08, 0.22, 0], [0.26, 0.48, 0.3]));
	neck.add(mesh(runtime, geometries.crown, material, [0.22, 0.55, 0], [0.34, 0.22, 0.3]));
	root.add(neck);
}

function appendBishopHead(root, runtime, geometries, material) {
	root.add(mesh(runtime, geometries.crown, material, [0, 1.18, 0], [0.38, 0.48, 0.38]));
	root.add(rotatedMesh(
		runtime,
		geometries.box,
		material,
		[0, 1.28, 0],
		[0.08, 0.3, 0.08],
		[0, 0, 1],
		0.62
	));
}

function appendQueenHead(root, runtime, geometries, material) {
	root.add(mesh(runtime, geometries.crown, material, [0, 1.17, 0], [0.5, 0.2, 0.5]));
	for (let index = 0; index < 6; index += 1) {
		const angle = index * Math.PI / 3;
		root.add(mesh(runtime, geometries.crown, material, [Math.cos(angle) * 0.28, 1.4, Math.sin(angle) * 0.28], [0.12, 0.22, 0.12]));
	}
}

function appendKingHead(root, runtime, geometries, material) {
	root.add(mesh(runtime, geometries.crown, material, [0, 1.16, 0], [0.38, 0.26, 0.38]));
	root.add(mesh(runtime, geometries.box, material, [0, 1.5, 0], [0.12, 0.5, 0.12]));
	root.add(mesh(runtime, geometries.box, material, [0, 1.54, 0], [0.4, 0.1, 0.12]));
}
