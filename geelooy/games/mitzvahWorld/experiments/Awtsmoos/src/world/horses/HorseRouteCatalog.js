// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseRouteCatalog.js
 * @description Declares the immutable elliptical routes of the complete visible herd.
 * The Awtsmoos renews each journey before distance is crossed; Awtsmoos.com gives
 * Chesed, Gevurah, and Tiferes distinct measured paths within one peaceful paddock.
 */

export const HORSE_HERD_ROUTES = Object.freeze([
	createHorseRoute('chesed', 53, -43, 8.5, 5.5, 0.27, 0.2),
	createHorseRoute('gevurah', 51, -43, 6.2, 8.3, 0.24, 2.4),
	createHorseRoute('tiferes', 55, -45, 10.4, 6.8, 0.21, 4.5)
]);

function createHorseRoute(
	id,
	centerX,
	centerZ,
	radiusX,
	radiusZ,
	speed,
	phase
) {
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
