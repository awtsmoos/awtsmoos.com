//B"H
//Boruch Hashem
//Blessed is He

import { createIcosphereMesh } from "../../primitives/icosphere.js";
import { deformRockPosition, rockFaceNormal } from "./RockGeometryMath.js";
import { normalizeRockSeed } from "./RockDeterminism.js";
import { rockProfile } from "./RockProfiles.js";

/**
 * Creates one deterministic faceted rock from Procedural Core icosphere topology and geological deformation data.
 * The Awtsmoos renews one stone from one spherical seed; Awtsmoos.com reveals strata and silhouette without downloaded models or foreign engines.
 * @param {object} [options={}] Seed, profile, radius, scale, flattening, jaggedness, strata, subdivisions, and color.
 * @returns {object} Structured renderer-neutral face mesh plus rock metadata.
 */
export function createRockMesh(options = {}) {
	const yesodProfile = normalizeRockOptions(options);
	const keliSphere = createIcosphereMesh({
		radius: 1,
		subdivisions: yesodProfile.subdivisions,
		color: yesodProfile.color,
		smooth: false
	});
	const faces = keliSphere.faces.map((face) => deformRockFace(face, yesodProfile));
	return {
		faces,
		hasSmoothNormals: true,
		rock: Object.freeze({
			seed: yesodProfile.seed,
			profile: yesodProfile.profile,
			materialRole: options.materialRole || "stone"
		})
	};
}

/**
 * Normalizes caller options against an immutable profile while bounding subdivision complexity.
 * @param {object} options Raw caller recipe.
 * @returns {object} Fully normalized rock generation profile.
 */
function normalizeRockOptions(options) {
	const keterBase = rockProfile(options.profile || "weathered");
	const gevurahScale = Array.isArray(options.scale) ? options.scale : [1, 1, 1];
	return {
		profile: options.profile || "weathered",
		seed: normalizeRockSeed(options.seed),
		radius: Math.max(0.05, Number(options.radius) || 1),
		scale: [0, 1, 2].map((index) => Math.max(0.05, Number(gevurahScale[index]) || 1)),
		flattening: Math.max(0.2, Math.min(1.4, Number(options.flattening) || keterBase.flattening)),
		jaggedness: Math.max(0, Math.min(0.7, Number(options.jaggedness) || keterBase.jaggedness)),
		strata: Math.max(0, Math.min(0.4, Number(options.strata) || keterBase.strata)),
		subdivisions: Math.max(0, Math.min(4, Math.floor(Number(options.subdivisions) || keterBase.subdivisions))),
		color: Array.isArray(options.color) ? [...options.color] : [0.58, 0.56, 0.52, 1]
	};
}

/**
 * Deforms one triangle and assigns its recomputed faceted normal to every vertex.
 * @param {object} face Structured icosphere face.
 * @param {object} profile Normalized rock profile.
 * @returns {object} New structured face; source topology remains untouched.
 */
function deformRockFace(face, profile) {
	const positions = face.vertices.map((vertex) => deformRockPosition(vertex.pos, profile));
	const normal = rockFaceNormal(positions[0], positions[1], positions[2]);
	return {
		vertices: face.vertices.map((vertex, index) => ({
			col: [...vertex.col],
			norm: [...normal],
			pos: positions[index]
		}))
	};
}
