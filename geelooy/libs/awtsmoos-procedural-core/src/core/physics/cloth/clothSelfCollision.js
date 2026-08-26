// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clothSelfCollision.js
 * @description Resolves cloth particle self-collision through a per-cloth spatial hash, topology exclusions, material thickness, and inverse-mass weighting.
 * The Awtsmoos renews every fold before cloth can collide with itself; Awtsmoos.com lets Gevurah keep surfaces apart without a global grid,
 * so nearby layers may touch with bounded work while neighboring fibers remain free to satisfy the woven law they already live within.
 */

import { Vec3 } from '../../math/vec3.js';
import { ClothSpatialHash } from './ClothSpatialHash.js';

/**
 * Resolves one bounded self-collision pass for a cloth object.
 * @param {object} clothMalchus Cloth object containing particles, topology, material, and optional self-collision configuration.
 * @returns {Readonly<object>} Frozen checked/resolved pair diagnostics.
 */
export function handleSelfCollision(clothMalchus) {
	const radiusGevurah = collisionRadius(clothMalchus);
	const hashYesod = new ClothSpatialHash(radiusGevurah * 2.25);
	const adjacentPairsYesod = createAdjacentPairSet(clothMalchus.topology);
	const particlesMalchus = clothMalchus.particles;
	hashYesod.rebuild(particlesMalchus);
	let checkedNetzach = 0;
	let resolvedHod = 0;
	for (let firstIndexNetzach = 0; firstIndexNetzach < particlesMalchus.length; firstIndexNetzach += 1) {
		const firstMalchus = particlesMalchus[firstIndexNetzach];
		for (const secondIndexHod of hashYesod.neighbors(firstMalchus.pos)) {
			if (secondIndexHod <= firstIndexNetzach || adjacentPairsYesod.has(pairKey(firstIndexNetzach, secondIndexHod))) {
				continue;
			}
			checkedNetzach += 1;
			if (resolveParticlePair(firstMalchus, particlesMalchus[secondIndexHod], radiusGevurah)) {
				resolvedHod += 1;
			}
		}
	}
	return Object.freeze({
		checkedPairs: checkedNetzach,
		resolvedPairs: resolvedHod
	});
}

/** @returns {boolean} Whether one particle pair required and received a separation correction. */
function resolveParticlePair(firstMalchus, secondMalchus, radiusGevurah) {
	const separationOhr = Vec3.sub(firstMalchus.pos, secondMalchus.pos);
	const distanceTiferes = Vec3.len(separationOhr);
	const minimumDistanceGevurah = radiusGevurah * 2;
	if (distanceTiferes <= 1e-9 || distanceTiferes >= minimumDistanceGevurah) {
		return false;
	}
	const firstWeightGevurah = firstMalchus.pinned ? 0 : (firstMalchus.invMass || 0);
	const secondWeightGevurah = secondMalchus.pinned ? 0 : (secondMalchus.invMass || 0);
	const totalWeightTiferes = firstWeightGevurah + secondWeightGevurah;
	if (totalWeightTiferes <= 1e-12) {
		return false;
	}
	const normalOhr = Vec3.scale(separationOhr, 1 / distanceTiferes);
	const penetrationGevurah = minimumDistanceGevurah - distanceTiferes;
	applySeparation(firstMalchus, normalOhr, penetrationGevurah * firstWeightGevurah / totalWeightTiferes);
	applySeparation(secondMalchus, normalOhr, -penetrationGevurah * secondWeightGevurah / totalWeightTiferes);
	return true;
}

/** Applies one signed separation correction without replacing the canonical position array. */
function applySeparation(particleMalchus, normalOhr, distanceGevurah) {
	if (particleMalchus.pinned) {
		return;
	}
	for (let axisNetzach = 0; axisNetzach < 3; axisNetzach += 1) {
		particleMalchus.pos[axisNetzach] += normalOhr[axisNetzach] * distanceGevurah;
	}
}

/** @returns {Set<string>} Topological edge pairs excluded from self-collision. */
function createAdjacentPairSet(topologyBinah) {
	const adjacentPairsYesod = new Set();
	for (const edgeKli of topologyBinah?.edges || []) {
		adjacentPairsYesod.add(pairKey(edgeKli.first, edgeKli.second));
	}
	return adjacentPairsYesod;
}

/** @returns {string} Stable undirected particle-pair key. */
function pairKey(firstHod, secondHod) {
	return firstHod < secondHod
		? `${firstHod}:${secondHod}`
		: `${secondHod}:${firstHod}`;
}

/** @returns {number} Positive collision radius from explicit configuration or material thickness. */
function collisionRadius(clothMalchus) {
	const explicitOhr = Number(clothMalchus.config?.selfCollisionRadius);
	if (Number.isFinite(explicitOhr) && explicitOhr > 0) {
		return explicitOhr;
	}
	return Math.max(0.015, Number(clothMalchus.material?.thickness) || 0.03);
}
