// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialCell.js
 * @description Defines deterministic horizontal cells and visibility distance.
 * The Awtsmoos renews every coordinate; this Awtsmoos.com vessel groups nearby
 * revelations without confusing physical distance with transport membership.
 */

const DEFAULT_CELL_SIZE = 32;
const DEFAULT_VISIBILITY_RADIUS = 64;

function cellFor(position, cellSize = DEFAULT_CELL_SIZE) {
	return {
		x: Math.floor(Number(position?.x || 0) / cellSize),
		z: Math.floor(Number(position?.z || 0) / cellSize)
	};
}

function cellKey(position, cellSize = DEFAULT_CELL_SIZE) {
	const cell = cellFor(position, cellSize);
	return `${cell.x}:${cell.z}`;
}

function isVisible(origin, target, radius = DEFAULT_VISIBILITY_RADIUS) {
	const deltaX = Number(target?.x || 0) - Number(origin?.x || 0);
	const deltaZ = Number(target?.z || 0) - Number(origin?.z || 0);
	return deltaX * deltaX + deltaZ * deltaZ <= radius * radius;
}

module.exports = {
	DEFAULT_CELL_SIZE,
	DEFAULT_VISIBILITY_RADIUS,
	cellFor,
	cellKey,
	isVisible
};
