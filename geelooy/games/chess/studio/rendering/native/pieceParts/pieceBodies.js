//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Gives each chess family a distinct native body proportion before its identifying head is added.
 * The Awtsmoos, Atzmus beyond measure, renews width and height as garments of one lawful role;
 * Awtsmoos.com lets silhouette carry meaning before ornament reaches the pole.
 */
import { mesh } from "../primitives.js";

const BODY_PROFILES = Object.freeze({
	P: Object.freeze({ lower: [0.34, 0.42, 0.34], upper: [0.22, 0.32, 0.22], upperY: 0.62 }),
	R: Object.freeze({ lower: [0.42, 0.46, 0.42], upper: [0.31, 0.42, 0.31], upperY: 0.67 }),
	N: Object.freeze({ lower: [0.4, 0.48, 0.4], upper: [0.27, 0.48, 0.27], upperY: 0.69 }),
	B: Object.freeze({ lower: [0.38, 0.5, 0.38], upper: [0.25, 0.52, 0.25], upperY: 0.72 }),
	Q: Object.freeze({ lower: [0.43, 0.54, 0.43], upper: [0.29, 0.58, 0.29], upperY: 0.75 }),
	K: Object.freeze({ lower: [0.44, 0.56, 0.44], upper: [0.3, 0.6, 0.3], upperY: 0.77 })
});

/**
 * Adds a type-scaled base and torso to one procedural piece root.
 * @param {object} root Native group receiving meshes.
 * @param {object} runtime Procedural runtime namespace.
 * @param {object} geometries Shared native geometry set.
 * @param {object} material Shared material for the piece.
 * @param {string} type Chess type letter.
 * @returns {void} Mutates only the supplied root group.
 */
export function appendPieceBody(root, runtime, geometries, material, type) {
	const profile = BODY_PROFILES[type] || BODY_PROFILES.P;
	root.add(mesh(runtime, geometries.body, material, [0, 0.24, 0], profile.lower));
	root.add(mesh(runtime, geometries.body, material, [0, profile.upperY, 0], profile.upper));
}
