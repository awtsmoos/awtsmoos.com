// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file environment.js
 * @description Applies gravity, canonical Reality wind, legacy uniform wind, and gusts to cloth without hiding time or force ownership.
 * The Awtsmoos renews gravity and air before a garment can fall or fly; Awtsmoos.com lets one environmental covenant move every cloth,
 * so banners, robes, leaves, grass, and future vines may answer the same wind instead of each inventing another sky.
 */

import { ForceUtils } from './forces.js';

/**
 * Applies one explicit environment sample to every cloth object in a legacy system call.
 * @param {object} systemMalchus Cloth system containing objects and environmental state.
 * @returns {void}
 */
export function applyEnvironmentForces(systemMalchus) {
	for (const clothMalchus of systemMalchus.objects) {
		applyClothEnvironmentForces(clothMalchus, systemMalchus);
	}
}

/**
 * Applies environment forces to one cloth, enabling independent quality substeps per object.
 * @param {object} clothMalchus Canonical cloth object.
 * @param {object} systemMalchus Cloth system containing gravity, wind, gust, time, and air density.
 * @returns {void}
 */
export function applyClothEnvironmentForces(clothMalchus, systemMalchus) {
	ForceUtils.applyGravity(clothMalchus.particles, systemMalchus.gravity);
	applyWindSource(clothMalchus, systemMalchus);
	if (systemMalchus.gustDuration > 0) {
		ForceUtils.applyGust(clothMalchus.particles, systemMalchus.gustVector);
	}
}

/** Chooses canonical field wind first, then falls back to the historic uniform vector. */
function applyWindSource(clothMalchus, systemMalchus) {
	if (systemMalchus.windField) {
		ForceUtils.applyWindField(
			clothMalchus.particles,
			systemMalchus.windField,
			systemMalchus.time,
			clothMalchus.material,
			systemMalchus.airDensity
		);
		return;
	}
	if (!hasVectorMagnitude(systemMalchus.wind)) {
		return;
	}
	ForceUtils.applyWind(
		clothMalchus.particles,
		systemMalchus.wind,
		systemMalchus.airDensity,
		systemMalchus.time,
		clothMalchus.material
	);
}

/** @returns {boolean} Whether a candidate XYZ vector contains any meaningful component. */
function hasVectorMagnitude(vectorOhr) {
	return Array.isArray(vectorOhr) && vectorOhr.some(componentOhr => {
		return Math.abs(Number(componentOhr) || 0) > 1e-9;
	});
}
