// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorTerrainBrushes.js
 * @description Player terrain-sculpting brushes: raise, lower, flatten, smooth.
 * Yaakov 2026-10-11: players shape the land of their own universe. The math is
 * pure and renderer-neutral: brushes read and write a heightfield grid, and the
 * sculpt receipts serialize into the creator document so worlds save, remix, and
 * reopen with their shaped land intact. Live geometry application belongs to the
 * runtime adapter; this module owns the truth of what the land should be.
 */

const BRUSH_IDS = Object.freeze(['raise', 'lower', 'flatten', 'smooth']);

/** Returns the stable terrain brush ids. */
export function terrainBrushIds() {
	return BRUSH_IDS;
}

/**
 * Applies one brush stroke to a heightfield grid.
 * @param {object} args { heights: Float32Array|number[], size, cell, cx, cz, radius, strength, mode }
 *   heights: row-major grid of size*size elevations; size: grid dimension;
 *   cell: world units per grid cell; cx/cz: brush center in world units;
 *   radius: brush radius in world units; strength: 0..1 sculpt power;
 *   mode: 'raise' | 'lower' | 'flatten' | 'smooth'
 * @returns {Float32Array} A new grid with the stroke applied (input untouched).
 */
export function applyTerrainBrush(args = {}) {
	const { heights, size, cell = 1, cx = 0, cz = 0, radius = 4, strength = 0.5, mode = 'raise' } = args;
	if (!BRUSH_IDS.includes(mode)) throw new Error(`TERRAIN_BRUSH_UNKNOWN:${mode}`);
	const dimension = Math.max(2, Math.floor(size) || 2);
	const source = toFloatGrid(heights, dimension);
	const out = Float32Array.from(source);
	const power = clamp01(Number(strength) || 0);
	const brushRadius = Math.max(cell, Number(radius) || 4);
	const half = (dimension - 1) / 2;

	if (mode === 'flatten') {
		const target = sampleBilinear(source, dimension, cx, cz, cell, half);
		stampFalloff(out, dimension, cell, half, cx, cz, brushRadius, power,
			(current) => target - current);
		return out;
	}
	if (mode === 'smooth') {
		const blurred = boxBlur(source, dimension);
		stampFalloff(out, dimension, cell, half, cx, cz, brushRadius, power,
			(current, x, z) => blurred[z * dimension + x] - current);
		return out;
	}
	const delta = mode === 'raise' ? power * brushRadius * 0.25 : -power * brushRadius * 0.25;
	stampFalloff(out, dimension, cell, half, cx, cz, brushRadius, power,
		(current) => delta);
	return out;
}

/**
 * Creates one serializable sculpt receipt for the creator document.
 * @returns {object} Frozen { id, brush, cx, cz, radius, strength, at } record.
 */
export function createSculptReceipt({ id, brush, cx = 0, cz = 0, radius = 4, strength = 0.5 } = {}) {
	if (!BRUSH_IDS.includes(brush)) throw new Error(`TERRAIN_BRUSH_UNKNOWN:${brush}`);
	if (!id || typeof id !== 'string') throw new Error('TERRAIN_SCULPT_ID_REQUIRED');
	return Object.freeze({
		at: Date.now(),
		brush,
		cx: Number(cx) || 0,
		cz: Number(cz) || 0,
		id,
		radius: Math.max(0.5, Number(radius) || 4),
		strength: clamp01(Number(strength) || 0)
	});
}

function stampFalloff(out, dimension, cell, half, cx, cz, radius, power, deltaFn) {
	const minX = Math.max(0, Math.floor((cx - radius) / cell + half));
	const maxX = Math.min(dimension - 1, Math.ceil((cx + radius) / cell + half));
	const minZ = Math.max(0, Math.floor((cz - radius) / cell + half));
	const maxZ = Math.min(dimension - 1, Math.ceil((cz + radius) / cell + half));
	for (let z = minZ; z <= maxZ; z++) {
		for (let x = minX; x <= maxX; x++) {
			const wx = (x - half) * cell;
			const wz = (z - half) * cell;
			const distance = Math.hypot(wx - cx, wz - cz);
			if (distance > radius) continue;
			// Smooth cosine falloff: full power at center, zero at edge.
			const falloff = 0.5 * (1 + Math.cos(Math.PI * distance / radius));
			const index = z * dimension + x;
			const delta = deltaFn(out[index], x, z);
			out[index] = out[index] + delta * falloff * power;
		}
	}
}

function boxBlur(source, dimension) {
	const out = new Float32Array(source.length);
	for (let z = 0; z < dimension; z++) {
		for (let x = 0; x < dimension; x++) {
			let sum = 0;
			let count = 0;
			for (let dz = -1; dz <= 1; dz++) {
				for (let dx = -1; dx <= 1; dx++) {
					const nx = x + dx;
					const nz = z + dz;
					if (nx < 0 || nz < 0 || nx >= dimension || nz >= dimension) continue;
					sum += source[nz * dimension + nx];
					count++;
				}
			}
			out[z * dimension + x] = sum / Math.max(1, count);
		}
	}
	return out;
}

function sampleBilinear(source, dimension, wx, wz, cell, half) {
	const gx = wx / cell + half;
	const gz = wz / cell + half;
	const x0 = Math.max(0, Math.min(dimension - 2, Math.floor(gx)));
	const z0 = Math.max(0, Math.min(dimension - 2, Math.floor(gz)));
	const fx = Math.max(0, Math.min(1, gx - x0));
	const fz = Math.max(0, Math.min(1, gz - z0));
	const a = source[z0 * dimension + x0];
	const b = source[z0 * dimension + x0 + 1];
	const c = source[(z0 + 1) * dimension + x0];
	const d = source[(z0 + 1) * dimension + x0 + 1];
	return a * (1 - fx) * (1 - fz) + b * fx * (1 - fz) + c * (1 - fx) * fz + d * fx * fz;
}

function toFloatGrid(heights, dimension) {
	const out = new Float32Array(dimension * dimension);
	if (!heights) return out;
	for (let i = 0; i < Math.min(out.length, heights.length); i++) {
		out[i] = Number(heights[i]) || 0;
	}
	return out;
}

function clamp01(value) {
	return Math.max(0, Math.min(1, value));
}
