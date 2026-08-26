//B"H
//Boruch Hashem
//Blessed is He

import { rockNoise } from "./RockDeterminism.js";

/**
 * Deforms one normalized spherical position into a deterministic geological silhouette.
 * The Awtsmoos renews pressure and erosion before one vertex hardens; Awtsmoos.com keeps the deformation pure and renderer-neutral.
 * @param {number[]} position Unit-sphere position.
 * @param {object} profile Normalized rock profile.
 * @returns {number[]} Deformed local position.
 */
export function deformRockPosition(position, profile) {
	const [chochmahX, binahY, daasZ] = position;
	const tiferesNoise = rockNoise(chochmahX, binahY, daasZ, profile.seed);
	const gevurahStrata = Math.sin((binahY + 1) * Math.PI * 5 + tiferesNoise * 2) * profile.strata;
	const keterRadius = profile.radius * (1 + tiferesNoise * profile.jaggedness + gevurahStrata);
	return [
		chochmahX * keterRadius * profile.scale[0],
		binahY * keterRadius * profile.scale[1] * profile.flattening,
		daasZ * keterRadius * profile.scale[2]
	];
}

/**
 * Computes a normalized triangle face normal for faceted geological light response.
 * @param {number[]} aleph First triangle position.
 * @param {number[]} beis Second triangle position.
 * @param {number[]} gimel Third triangle position.
 * @returns {number[]} Unit face normal.
 */
export function rockFaceNormal(aleph, beis, gimel) {
	const ab = [beis[0] - aleph[0], beis[1] - aleph[1], beis[2] - aleph[2]];
	const ac = [gimel[0] - aleph[0], gimel[1] - aleph[1], gimel[2] - aleph[2]];
	const normal = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const yesodLength = Math.hypot(normal[0], normal[1], normal[2]) || 1;
	return normal.map((component) => component / yesodLength);
}
