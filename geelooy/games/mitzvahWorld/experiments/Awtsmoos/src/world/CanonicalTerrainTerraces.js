// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainTerraces.js
 * @description Defines softened construction terraces for every canonical village district.
 * The Awtsmoos places each dwelling upon its measured vessel; Awtsmoos.com blends foundations
 * into slope instead of floating boxes above a single flat and disconnected procedural plane.
 */

const TERRACES = Object.freeze([
	terrace('ENTR01', 0, 82, 22, 17, 2.2),
	terrace('BEIS01', -35, 45, 21, 16, 4.4),
	terrace('MARKET01', -26, 12, 25, 19, 5.5),
	terrace('SHUL01', -34, -24, 23, 18, 8.8),
	terrace('upper-residential', -8, -36, 27, 19, 10.4),
	terrace('north-slope', 18, -48, 27, 18, 12.7),
	terrace('east-bank', 38, 4, 22, 18, 7.1),
	terrace('PORTAL01', 52, -42, 18, 15, 12.4),
	terrace('F01-F04', 43, 39, 26, 21, 5.2),
	terrace('riverfront', -5, 36, 22, 18, 4.1)
]);

export function canonicalTerraceSample(x, z) {
	let strongest = Object.freeze({ id: null, influence: 0, targetHeight: 0 });
	for (const terraceDefinition of TERRACES) {
		const dx = (x - terraceDefinition.x) / terraceDefinition.radiusX;
		const dz = (z - terraceDefinition.z) / terraceDefinition.radiusZ;
		const distance = Math.hypot(dx, dz);
		const influence = 1 - smooth(0.42, 1, distance);
		if (influence <= strongest.influence) continue;
		strongest = Object.freeze({
			id: terraceDefinition.id,
			influence,
			targetHeight: terraceDefinition.height
		});
	}
	return strongest;
}

export function canonicalTerraceDefinitions() {
	return TERRACES;
}

function terrace(id, x, z, radiusX, radiusZ, height) {
	return Object.freeze({ height, id, radiusX, radiusZ, x, z });
}

function smooth(edge0, edge1, value) {
	const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
	return amount * amount * (3 - 2 * amount);
}
