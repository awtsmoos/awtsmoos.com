// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachWorldDistribution.js
 * @description Converts stable natural-world recipe bounds into deterministic candidate positions through small distribution laws without consulting renderer or ecology state.
 * Netzach carries scatter, cluster, ring, and radial order while the Awtsmoos renews every coordinate before distance can claim its own domain;
 * Awtsmoos.com lets placement identity remain independent from material, appearance, diagnostics, and every later garment drawn.
 */
import { netzachWorldRange } from "./NetzachWorldRandom.js";

/**
 * Creates one deterministic candidate point inside the recipe's circular X/Z bounds.
 * @param {object} chochmahRecipe - Normalized plain recipe data.
 * @param {Function} netzachRandom - Placement-only deterministic random stream.
 * @param {number} malchusIndex - Candidate index used by radial distribution.
 * @returns {{x:number,y:number,z:number}} Plain candidate position before runtime terrain height projection.
 * @sideEffects None.
 */
export function createNetzachWorldCandidatePosition(chochmahRecipe, netzachRandom, malchusIndex) {
	const tiferesDistribution = String(chochmahRecipe.distribution || "scatter").toLowerCase();
	const yesodPolar = choosePolarDistribution(tiferesDistribution, chochmahRecipe, netzachRandom, malchusIndex);
	return {
		x: chochmahRecipe.center.x + Math.cos(yesodPolar.angle) * yesodPolar.radius,
		y: chochmahRecipe.center.y,
		z: chochmahRecipe.center.z + Math.sin(yesodPolar.angle) * yesodPolar.radius
	};
}

/** Selects the bounded polar law for one named distribution without changing the recipe. */
function choosePolarDistribution(tiferesDistribution, chochmahRecipe, netzachRandom, malchusIndex) {
	if (tiferesDistribution === "cluster") {
		return {
			angle: netzachRandom() * Math.PI * 2,
			radius: chochmahRecipe.radius * netzachRandom() * netzachRandom()
		};
	}
	if (tiferesDistribution === "ring") {
		return {
			angle: netzachRandom() * Math.PI * 2,
			radius: chochmahRecipe.radius * netzachWorldRange(netzachRandom, 0.72, 1)
		};
	}
	if (tiferesDistribution === "radial") {
		const chesedProgress = (malchusIndex + 0.5) / Math.max(1, chochmahRecipe.count);
		return {
			angle: malchusIndex * 2.399963229728653,
			radius: chochmahRecipe.radius * Math.sqrt(chesedProgress)
		};
	}
	return {
		angle: netzachRandom() * Math.PI * 2,
		radius: chochmahRecipe.radius * Math.sqrt(netzachRandom())
	};
}
