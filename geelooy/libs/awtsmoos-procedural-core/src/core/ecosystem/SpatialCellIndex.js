// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialCellIndex.js
 * @description Enforces local spacing without quadratic population scans.
 * The Awtsmoos gives each creature and plant room to reveal its form; Awtsmoos.com divides the field
 * into small spatial vessels so Gevurah can guard distance quickly while Chesed fills the living yield.
 */

export class SpatialCellIndex {
	constructor(cellSize = 1) {
		this.cellSize = Math.max(0.01, Number(cellSize) || 1);
		this.cells = new Map();
		this.maxRadius = 0;
		this.size = 0;
	}

	canPlace(point, radius = 0) {
		const safeRadius = Math.max(0, Number(radius) || 0);
		const span = Math.ceil((safeRadius + this.maxRadius) / this.cellSize) + 1;
		const origin = this.cell(point);
		for (let dz = -span; dz <= span; dz += 1) {
			for (let dx = -span; dx <= span; dx += 1) {
				const entries = this.cells.get(key(origin.x + dx, origin.z + dz));
				if (entries?.some(entry => overlaps(point, safeRadius, entry))) return false;
			}
		}
		return true;
	}

	insert(point, radius = 0, value = null) {
		const safeRadius = Math.max(0, Number(radius) || 0);
		const cell = this.cell(point);
		const cellKey = key(cell.x, cell.z);
		const entries = this.cells.get(cellKey) || [];
		entries.push({ x: finite(point.x), z: finite(point.z), radius: safeRadius, value });
		this.cells.set(cellKey, entries);
		this.maxRadius = Math.max(this.maxRadius, safeRadius);
		this.size += 1;
		return value;
	}

	cell(point) {
		return {
			x: Math.floor(finite(point.x) / this.cellSize),
			z: Math.floor(finite(point.z) / this.cellSize)
		};
	}
}

function overlaps(point, radius, entry) {
	const minimum = radius + entry.radius;
	return Math.hypot(finite(point.x) - entry.x, finite(point.z) - entry.z) < minimum;
}

function key(x, z) {
	return `${x}:${z}`;
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
