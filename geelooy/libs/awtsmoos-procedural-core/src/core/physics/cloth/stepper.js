// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stepper.js
 * @description Executes one bounded cloth frame through per-object quality substeps, environment forces, collisions, XPBD constraints, and self-collision.
 * The Awtsmoos renews every substep before motion can accumulate a past; Awtsmoos.com lets Gevurah divide time into measured vessels,
 * so silk, canvas, and flags may solve at different depth while one public step remains simple, deterministic, and fast.
 */

import { handleClothCollisions } from './clothCollision.js';
import { handleSelfCollision } from './clothSelfCollision.js';
import { applyClothEnvironmentForces } from './environment.js';

/**
 * Performs one system cloth step while honoring each cloth object's quality profile.
 * @param {object} systemMalchus Cloth system containing objects, colliders, and environment state.
 * @param {number} deltaTimeTiferes Positive frame duration in seconds.
 * @returns {Readonly<Array<object>>} Frozen per-cloth solver and collision diagnostics.
 */
export function performClothStep(systemMalchus, deltaTimeTiferes) {
	const diagnosticsMalchus = [];
	for (const clothMalchus of systemMalchus.objects) {
		diagnosticsMalchus.push(stepClothObject(clothMalchus, systemMalchus, deltaTimeTiferes));
	}
	return Object.freeze(diagnosticsMalchus);
}

/** @returns {Readonly<object>} Diagnostics for one cloth after all configured quality substeps. */
function stepClothObject(clothMalchus, systemMalchus, deltaTimeTiferes) {
	const substepsGevurah = clothMalchus.quality?.substeps || 1;
	const substepTimeTiferes = deltaTimeTiferes / substepsGevurah;
	let constraintHod = clothMalchus.lastDiagnostics;
	let resolvedSelfNetzach = 0;
	for (let substepNetzach = 0; substepNetzach < substepsGevurah; substepNetzach += 1) {
		applyClothEnvironmentForces(clothMalchus, systemMalchus);
		clothMalchus.integrate(substepTimeTiferes);
		handleClothCollisions(clothMalchus, systemMalchus.staticColliders);
		constraintHod = clothMalchus.solveConstraints(substepTimeTiferes);
		handleClothCollisions(clothMalchus, systemMalchus.staticColliders);
		resolvedSelfNetzach += runSelfCollisionPasses(clothMalchus);
	}
	return Object.freeze({
		clothId: clothMalchus.id,
		constraints: constraintHod,
		selfCollisionPairs: resolvedSelfNetzach,
		substeps: substepsGevurah
	});
}

/** @returns {number} Total self-collision pair corrections over configured passes. */
function runSelfCollisionPasses(clothMalchus) {
	const passesGevurah = clothMalchus.quality?.selfCollisionPasses || 0;
	let resolvedNetzach = 0;
	for (let passNetzach = 0; passNetzach < passesGevurah; passNetzach += 1) {
		const evidenceHod = handleSelfCollision(clothMalchus);
		resolvedNetzach += evidenceHod.resolvedPairs;
	}
	return resolvedNetzach;
}
