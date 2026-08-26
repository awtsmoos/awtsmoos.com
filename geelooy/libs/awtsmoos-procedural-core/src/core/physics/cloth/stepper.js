// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stepper.js
 * @description Executes bounded cloth substeps through canonical normals, environment forces, integration, collisions, XPBD constraints, and self-collision.
 * The Awtsmoos renews every fold before wind can press upon its face; Awtsmoos.com lets Gevurah divide time while Tiferes refreshes the surface after each solve,
 * so silk, canvas, flags, and headless fabrics receive aerodynamic truth from their actual shape instead of a renderer-dependent shadow.
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
export function performClothStep(
	systemMalchus,
	deltaTimeTiferes
) {
	const diagnosticsMalchus = [];
	for (const clothMalchus of systemMalchus.objects) {
		diagnosticsMalchus.push(
			stepClothObject(
				clothMalchus,
				systemMalchus,
				deltaTimeTiferes
			)
		);
	}
	return Object.freeze(diagnosticsMalchus);
}

/**
 * Advances one cloth through all configured quality substeps and refreshes its aerodynamic surface after deformation.
 * @param {object} clothMalchus Cloth object with canonical particles, constraints, and normal refresh.
 * @param {object} systemMalchus Shared environment and collider state.
 * @param {number} deltaTimeTiferes Frame duration in seconds.
 * @returns {Readonly<object>} Frozen diagnostics for the completed cloth frame.
 */
function stepClothObject(
	clothMalchus,
	systemMalchus,
	deltaTimeTiferes
) {
	const substepsGevurah = clothMalchus.quality?.substeps || 1;
	const substepTimeTiferes = deltaTimeTiferes / substepsGevurah;
	let constraintHod = clothMalchus.lastDiagnostics;
	let resolvedSelfNetzach = 0;

	for (
		let substepNetzach = 0;
		substepNetzach < substepsGevurah;
		substepNetzach += 1
	) {
		applyClothEnvironmentForces(
			clothMalchus,
			systemMalchus
		);
		clothMalchus.integrate(substepTimeTiferes);
		handleClothCollisions(
			clothMalchus,
			systemMalchus.staticColliders
		);
		constraintHod = clothMalchus.solveConstraints(
			substepTimeTiferes
		);
		handleClothCollisions(
			clothMalchus,
			systemMalchus.staticColliders
		);
		resolvedSelfNetzach += runSelfCollisionPasses(
			clothMalchus
		);
		clothMalchus.refreshSurfaceNormals();
	}

	return Object.freeze({
		clothId: clothMalchus.id,
		constraints: constraintHod,
		selfCollisionPairs: resolvedSelfNetzach,
		substeps: substepsGevurah
	});
}

/**
 * Runs the configured bounded self-collision passes for one cloth.
 * @param {object} clothMalchus Cloth object containing quality and particles.
 * @returns {number} Total resolved self-collision pairs.
 */
function runSelfCollisionPasses(clothMalchus) {
	const passesGevurah = clothMalchus.quality?.selfCollisionPasses || 0;
	let resolvedNetzach = 0;
	for (
		let passNetzach = 0;
		passNetzach < passesGevurah;
		passNetzach += 1
	) {
		const evidenceHod = handleSelfCollision(clothMalchus);
		resolvedNetzach += evidenceHod.resolvedPairs;
	}
	return resolvedNetzach;
}
