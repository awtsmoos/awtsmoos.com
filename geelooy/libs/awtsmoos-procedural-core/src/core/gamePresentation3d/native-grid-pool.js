//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-grid-pool.js
 * @description Creates and updates a reusable semantic cell pool for native 3D grid games.
 * Shared geometry and bounded mesh counts keep optional volumetric projection predictable.
 */
import {
	Group,
	Mesh,
	MeshStandardMaterial
} from '../../runtime/native/tiny-runtime.js';
import { createNativeGridCellGeometry } from './native-grid-geometry.js';

/** Create one fixed-size cell pool and its scene group. */
export function createNativeGridPool(options) {
	const rows = Math.max(1, Math.trunc(options.rows));
	const columns = Math.max(1, Math.trunc(options.columns));
	const geometry = createNativeGridCellGeometry(options.shape);
	const materials = createMaterials(options.palette || {});
	const fallback = new MeshStandardMaterial({ color: [0.7, 0.8, 1, 1] });
	const group = new Group();
	const cells = [];
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < columns; column += 1) {
			const mesh = new Mesh(geometry, fallback);
			mesh.position.set(
				column - (columns - 1) / 2,
				(rows - 1) / 2 - row,
				0
			);
			mesh.visible = false;
			group.add(mesh);
			cells.push(mesh);
		}
	}
	return { rows, columns, group, cells, materials, fallback };
}

/** Apply one canonical matrix without allocating or changing game-owned state. */
export function applyNativeGridMatrix(pool, matrix = []) {
	for (let row = 0; row < pool.rows; row += 1) {
		for (let column = 0; column < pool.columns; column += 1) {
			const mesh = pool.cells[row * pool.columns + column];
			const value = matrix[row]?.[column] ?? 0;
			mesh.visible = Boolean(value);
			if (!value) {
				continue;
			}
			mesh.material = pool.materials.get(String(value)) || pool.fallback;
			mesh.position.z = depthForValue(value);
		}
	}
}

/** Create immutable-looking material vessels from numeric/string palette keys. */
function createMaterials(palette) {
	const materials = new Map();
	for (const [key, value] of Object.entries(palette)) {
		materials.set(String(key), new MeshStandardMaterial({
			name: `GridCell:${key}`,
			color: colorArray(value)
		}));
	}
	return materials;
}

/** Convert CSS-like hex or numeric-array color into native normalized RGBA. */
function colorArray(value) {
	if (Array.isArray(value)) {
		return [...value];
	}
	const hex = String(value || '#aaddff').replace('#', '');
	const integer = Number.parseInt(hex.length === 3
		? hex.split('').map(part => part + part).join('')
		: hex, 16);
	return [
		((integer >> 16) & 255) / 255,
		((integer >> 8) & 255) / 255,
		(integer & 255) / 255,
		1
	];
}

/** Give occupied cells subtle deterministic depth without affecting board semantics. */
function depthForValue(value) {
	const numeric = Number.parseInt(String(value), 10);
	return Number.isFinite(numeric) ? (numeric % 4) * 0.035 : 0.04;
}
