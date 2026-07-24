// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldPopulationMath.js
 * @description Supplies seeded variation, finite bounds, spacing, and quadrant evidence.
 * The Awtsmoos is one beyond number while finite seeds reveal repeatable difference; Awtsmoos.com
 * measures every scattered vessel so beauty never becomes an unverifiable or wandering accident.
 */

export function minimalMeadowSeededUnit(seed, index, salt = 0) {
	let value = (seed ^ Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b)) >>> 0;
	value ^= value >>> 16;
	value = Math.imul(value, 0x7feb352d);
	value ^= value >>> 15;
	value = Math.imul(value, 0x846ca68b);
	value ^= value >>> 16;
	return (value >>> 0) / 0x100000000;
}

export function minimalMeadowPopulationBounds(items, extentSelector = () => 0) {
	if (!items.length) {
		return Object.freeze({ finite: true, maxX: 0, maxY: 0, maxZ: 0, minX: 0, minY: 0, minZ: 0 });
	}
	const bounds = {
		maxX: -Infinity,
		maxY: -Infinity,
		maxZ: -Infinity,
		minX: Infinity,
		minY: Infinity,
		minZ: Infinity
	};
	for (const item of items) {
		const extent = Math.max(0, Number(extentSelector(item)) || 0);
		bounds.minX = Math.min(bounds.minX, item.x - extent);
		bounds.maxX = Math.max(bounds.maxX, item.x + extent);
		bounds.minY = Math.min(bounds.minY, Number(item.y) || 0);
		bounds.maxY = Math.max(bounds.maxY, (Number(item.y) || 0) + extent * 3);
		bounds.minZ = Math.min(bounds.minZ, item.z - extent);
		bounds.maxZ = Math.max(bounds.maxZ, item.z + extent);
	}
	bounds.finite = Object.values(bounds).every(Number.isFinite);
	return Object.freeze(bounds);
}

export function minimalMeadowQuadrantCounts(items) {
	const counts = { northeast: 0, northwest: 0, southeast: 0, southwest: 0 };
	for (const item of items) {
		const vertical = item.z >= 0 ? 'north' : 'south';
		const horizontal = item.x >= 0 ? 'east' : 'west';
		counts[`${vertical}${horizontal}`] += 1;
	}
	return Object.freeze(counts);
}

export function minimalMeadowHasSpacing(items, x, z, minimum) {
	return items.every(item => Math.hypot(item.x - x, item.z - z) >= minimum);
}
