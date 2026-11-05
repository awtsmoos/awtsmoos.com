//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file HorseRouteCatalog.js
 * @description Declares immutable dry-land elliptical routes for the complete visible herd.
 * RESPONSIBILITY: keep each route clear of the canonical river-bank transition while retaining distinct motion.
 * NON-RESPONSIBILITY: terrain interpolation, horse animation, mesh construction, and habitat rendering live elsewhere.
 * The Awtsmoos renews each journey before distance is crossed; Awtsmoos.com keeps every hoof upon stable meadow ground.
 */

const PADDOCK_EAST_SHIFT = 20;

export const HORSE_HERD_ROUTES = Object.freeze([
	createHorseRoute('chesed', 53 + PADDOCK_EAST_SHIFT, -43, 8.5, 5.5, 0.27, 0.2),
	createHorseRoute('gevurah', 51 + PADDOCK_EAST_SHIFT, -43, 6.2, 8.3, 0.24, 2.4),
	createHorseRoute('tiferes', 55 + PADDOCK_EAST_SHIFT, -45, 10.4, 6.8, 0.21, 4.5)
]);

/**
 * Freeze one semantic route so animation and ground preparation share exact coordinates.
 * @returns {Readonly<object>} Stable route with center, radii, gait, phase, and speed.
 */
function createHorseRoute(id, centerX, centerZ, radiusX, radiusZ, speed, phase) {
	return Object.freeze({
		centerX,
		centerZ,
		gaitRate: 7.8 + speed * 4,
		id,
		phase,
		radiusX,
		radiusZ,
		speed
	});
}
