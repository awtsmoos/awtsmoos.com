// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialCellIndex.js
 * @description Enforces local spacing and exposes bounded neighbor evidence without quadratic population scans.
 * The Awtsmoos gives each creature and plant room to reveal its form; Awtsmoos.com divides the field into small spatial vessels,
 * so Gevurah guards distance quickly while Daas may also inspect nearby species for facilitation, competition, and future ecological relationships.
 */

/** Uniform-grid spatial index for bounded radius overlap and neighbor queries. */
export class SpatialCellIndex {
	constructor(cellSize = 1) {
		this.cellSize = Math.max(0.01, Number(cellSize) || 1);
		this.cells = new Map();
		this.maxRadius = 0;
		this.size = 0;
	}

	/** Returns whether a point-radius pair avoids every indexed entry. */
	canPlace(point, radius = 0) {
		const safeRadius = Math.max(0, Number(radius) || 0);
		return !this.neighbors(point, safeRadius + this.maxRadius)
			.some((entry) => overlaps(point, safeRadius, entry));
	}

	/** Inserts one point-radius-value record and returns the caller value unchanged. */
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

	/**
	 * Returns nearby indexed entries with distance evidence, bounded by one search radius.
	 * @param {object} point Query point containing x and z.
	 * @param {number} searchRadius Maximum center-to-center query distance.
	 * @returns {ReadonlyArray<object>} Frozen neighbor evidence in deterministic cell/insertion order.
	 */
	neighbors(point, searchRadius = 0) {
		const safeRadius = Math.max(0, Number(searchRadius) || 0);
		const span = Math.ceil(safeRadius / this.cellSize) + 1;
		const origin = this.cell(point);
		const matches = [];
		for (let dz = -span; dz <= span; dz += 1) {
			for (let dx = -span; dx <= span; dx += 1) {
				const entries = this.cells.get(key(origin.x + dx, origin.z + dz)) || [];
				for (const entry of entries) appendNeighbor(matches, point, safeRadius, entry);
			}
		}
		return Object.freeze(matches);
	}

	/** Converts one point into integer grid coordinates. */
	cell(point) {
		return {
			x: Math.floor(finite(point.x) / this.cellSize),
			z: Math.floor(finite(point.z) / this.cellSize)
		};
	}
}

/** Adds one nearby record with immutable distance evidence when within query range. */
function appendNeighbor(matches, point, searchRadius, entry) {
	const distance = Math.hypot(finite(point.x) - entry.x, finite(point.z) - entry.z);
	if (distance > searchRadius) return;
	matches.push(Object.freeze({ ...entry, distance, searchRadius }));
}

/** Returns whether candidate and indexed radii overlap. */
function overlaps(point, radius, entry) {
	const minimum = radius + entry.radius;
	return Math.hypot(finite(point.x) - entry.x, finite(point.z) - entry.z) < minimum;
}

/** Creates one stable grid-cell key. */
function key(x, z) {
	return `${x}:${z}`;
}

/** Converts finite numeric input or returns zero. */
function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
