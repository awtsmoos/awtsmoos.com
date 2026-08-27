// B"H
// Boruch Hashem
// Blessed is He
/** Trilinear weights divide one particle among neighboring cells without losing mass. */

import { gridIndex3d } from "../volumes/grid3d.js";

function clamp(value, maximum) {
	return Math.max(0, Math.min(maximum, value));
}

export function particleGridWeights3d(grid, position) {
	const local = position.map((value, axis) => (value - grid.origin[axis]) / grid.cellSize);
	const base = local.map(Math.floor);
	const fraction = local.map((value, axis) => value - base[axis]);
	const merged = new Map();
	for (let dz = 0; dz < 2; dz += 1) {
		for (let dy = 0; dy < 2; dy += 1) {
			for (let dx = 0; dx < 2; dx += 1) {
				const x = clamp(base[0] + dx, grid.width - 1);
				const y = clamp(base[1] + dy, grid.height - 1);
				const z = clamp(base[2] + dz, grid.depth - 1);
				const weight = (dx ? fraction[0] : 1 - fraction[0])
					* (dy ? fraction[1] : 1 - fraction[1])
					* (dz ? fraction[2] : 1 - fraction[2]);
				const index = gridIndex3d(grid, x, y, z);
				const entry = merged.get(index) ?? { index, x, y, z, weight: 0 };
				entry.weight += weight;
				merged.set(index, entry);
			}
		}
	}
	const values = [...merged.values()].sort((left, right) => left.index - right.index);
	const total = values.reduce((sum, entry) => sum + entry.weight, 0);
	return Object.freeze(values.map(entry => Object.freeze({
		...entry,
		weight: total > 0 ? entry.weight / total : 0
	})));
}
