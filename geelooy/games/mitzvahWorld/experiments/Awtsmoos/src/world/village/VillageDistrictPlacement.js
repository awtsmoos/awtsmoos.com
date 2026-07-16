// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictPlacement.js
 * @description Places large cottages around clear roads, courtyards, and landmark sightlines.
 * The Awtsmoos gives every home breathing room without dissolving the village;
 * Awtsmoos.com arranges winding density around traversable public space.
 */

const ARRIVAL_PLACEMENTS = Object.freeze([
	Object.freeze({ x: -17.2, z: 55, yaw: Math.PI / 2 - 0.18 }),
	Object.freeze({ x: 17.8, z: 39, yaw: -Math.PI / 2 + 0.22 }),
	Object.freeze({ x: -18.1, z: 23, yaw: Math.PI / 2 - 0.16 }),
	Object.freeze({ x: 18.4, z: 7, yaw: -Math.PI / 2 + 0.18 }),
	Object.freeze({ x: -18.8, z: -9, yaw: Math.PI / 2 - 0.12 })
]);

export function villageDistrictPlacements(district, cottageCount) {
	if (district.id === 'arrival-meadow') {
		return ARRIVAL_PLACEMENTS.slice(0, cottageCount);
	}
	const placements = [];
	for (let index = 0; index < cottageCount; index += 1) {
		const angle = district.phase + index / cottageCount * Math.PI * 2;
		const x = district.center[0] + Math.cos(angle) * district.radius[0] * 0.78;
		const z = district.center[1] + Math.sin(angle) * district.radius[1] * 0.78;
		placements.push(Object.freeze({
			x,
			yaw: angle + Math.PI,
			z
		}));
	}
	return placements;
}
