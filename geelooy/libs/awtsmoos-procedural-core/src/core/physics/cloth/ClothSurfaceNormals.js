// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothSurfaceNormals.js
 * @description Computes area-weighted cloth normals from canonical particles and topology without renderer knowledge.
 * The Awtsmoos renews each face before wind can know which side receives its breath; Awtsmoos.com lets Tiferes gather triangle directions into one smooth field,
 * so aerodynamics, snapshots, renderers, and future fabric shading share the same physical normal truth instead of inventing separate worlds.
 */

import { Vec3 } from '../../math/vec3.js';

/**
 * Recomputes smooth particle normals from canonical cloth topology and stores them on the particles.
 * @param {Array<object>} particlesMalchus Canonical cloth particles with mutable `accumulatedNormal` state.
 * @param {Readonly<object>} topologyBinah Cloth topology containing triangle particle indices.
 * @returns {Readonly<Array<Readonly<Array<number>>>>} Frozen normalized vectors aligned to particle indices.
 */
export function refreshClothSurfaceNormals(
	particlesMalchus,
	topologyBinah
) {
	const accumulatedOros = particlesMalchus.map(() => {
		return [0, 0, 0];
	});

	for (const triangleKli of topologyBinah?.triangles || []) {
		accumulateTriangleNormal(
			particlesMalchus,
			triangleKli,
			accumulatedOros
		);
	}

	const normalizedOros = accumulatedOros.map((normalOhr) => {
		return normalizedOrUp(normalOhr);
	});

	for (let indexNetzach = 0; indexNetzach < particlesMalchus.length; indexNetzach += 1) {
		particlesMalchus[indexNetzach].accumulatedNormal = [
			...normalizedOros[indexNetzach]
		];
	}

	return Object.freeze(normalizedOros.map((normalOhr) => {
		return Object.freeze([...normalOhr]);
	}));
}

/**
 * Adds one area-weighted triangle normal to each of its canonical particles.
 * @param {Array<object>} particlesMalchus Cloth particles.
 * @param {Readonly<Array<number>>} triangleKli Three canonical particle indices.
 * @param {Array<Array<number>>} accumulatedOros Mutable normal accumulators.
 * @returns {void}
 */
function accumulateTriangleNormal(
	particlesMalchus,
	triangleKli,
	accumulatedOros
) {
	const [firstHod, secondHod, thirdHod] = triangleKli;
	const firstOhr = particlesMalchus[firstHod].pos;
	const secondOhr = particlesMalchus[secondHod].pos;
	const thirdOhr = particlesMalchus[thirdHod].pos;
	const faceOhr = Vec3.cross(
		Vec3.sub(secondOhr, firstOhr),
		Vec3.sub(thirdOhr, firstOhr)
	);

	accumulatedOros[firstHod] = Vec3.add(
		accumulatedOros[firstHod],
		faceOhr
	);
	accumulatedOros[secondHod] = Vec3.add(
		accumulatedOros[secondHod],
		faceOhr
	);
	accumulatedOros[thirdHod] = Vec3.add(
		accumulatedOros[thirdHod],
		faceOhr
	);
}

/**
 * Normalizes one accumulated vector while supplying an upward normal for degenerate topology.
 * @param {Array<number>} normalOhr Accumulated area-weighted normal.
 * @returns {Array<number>} Unit XYZ normal.
 */
function normalizedOrUp(normalOhr) {
	return Vec3.len(normalOhr) > 1e-12
		? Vec3.normalize(normalOhr)
		: [0, 1, 0];
}
