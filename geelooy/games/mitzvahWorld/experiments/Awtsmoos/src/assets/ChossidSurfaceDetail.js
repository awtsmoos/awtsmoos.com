// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidSurfaceDetail.js
 * @description Bakes deterministic per-vertex surface variation into one isolated
 * Chossid instance: subtle skin mottling, cloth grain, and crevice darkening from a
 * cheap normal-divergence approximation. Runs once at load in the app layer on
 * CLONED geometries (instance geometry is shared with the GLB template, so the
 * bake must never mutate it); the tiny renderer's shaders already consume a
 * `color` vertex attribute as a multiplier, so no shared-core shader or buffer
 * changes are needed. Fully procedural, deterministic, zero network.
 */

import { chossidMaterialRole } from './ChossidOutfitPalette.js';

const CREVICE_CELL_SIZE = 0.045;
const MIN_SHADE = 0.7;
const MAX_SHADE = 1.06;

const SHADE_PARAMS = Object.freeze({
	skin: Object.freeze({ crevice: 0.15, grain: 0, mottle: 0.085, warm: 0.035 }),
	cloth: Object.freeze({ crevice: 0.24, grain: 0.055, mottle: 0, warm: 0 }),
	hair: Object.freeze({ crevice: 0.17, grain: 0.03, mottle: 0, warm: 0 }),
	hard: Object.freeze({ crevice: 0.1, grain: 0.015, mottle: 0, warm: 0 })
});

/**
 * Bakes surface detail into every mesh of one loaded Chossid scene.
 * @param {object} scene Loaded GLTF scene (traversable).
 * @param {object} [options] Optional tuning overrides.
 * @returns {object} Frozen bake receipt.
 */
export function bakeChossidSurfaceDetail(scene, options = {}) {
	const receipt = { meshesBaked: 0, meshesSkipped: 0, roles: {}, verticesBaked: 0 };
	scene?.traverse?.(node => {
		if (!node.isMesh && !node.isSkinnedMesh) return;
		const baked = bakeMeshSurfaceDetail(node, options);
		if (baked > 0) {
			receipt.meshesBaked += 1;
			receipt.verticesBaked += baked;
			const role = shadeClass(chossidMaterialRole(meshMaterialName(node)));
			receipt.roles[role] = (receipt.roles[role] || 0) + 1;
		} else {
			receipt.meshesSkipped += 1;
		}
	});
	return Object.freeze({ ...receipt, roles: Object.freeze({ ...receipt.roles }) });
}

function bakeMeshSurfaceDetail(mesh, options) {
	const geometry = mesh.geometry;
	const position = geometry?.attributes?.position;
	const normal = geometry?.attributes?.normal;
	if (!position || !normal || position.count < 1) return 0;
	if (geometry.attributes.color) return 0;
	const positions = position.array;
	const normals = normal.array;
	if (!positions || !normals || positions.length < position.count * 3) return 0;
	const params = { ...SHADE_PARAMS[shadeClass(chossidMaterialRole(meshMaterialName(mesh)))], ...(options.params || {}) };
	const cells = accumulateNormalCells(positions, normals, position.count);
	const colors = new Float32Array(position.count * 4);
	for (let i = 0; i < position.count; i++) {
		const px = positions[i * 3];
		const py = positions[i * 3 + 1];
		const pz = positions[i * 3 + 2];
		const nx = normals[i * 3];
		const ny = normals[i * 3 + 1];
		const nz = normals[i * 3 + 2];
		let shade = creviceShade(cells, px, py, pz, nx, ny, nz, params.crevice);
		shade *= 1 - 0.06 * (0.5 - 0.5 * ny);
		let warm = 0;
		if (params.mottle > 0) {
			const mottle = hash3i(
				Math.floor(px / 0.09),
				Math.floor(py / 0.09),
				Math.floor(pz / 0.09)
			);
			shade *= 1 + (mottle - 0.5) * params.mottle * 2;
			warm = (mottle - 0.5) * params.warm * 2;
		}
		if (params.grain > 0) {
			const grain = hash3i(
				Math.floor(px / 0.004),
				Math.floor(py / 0.004),
				Math.floor(pz / 0.004)
			);
			shade *= 1 + (grain - 0.5) * params.grain * 2;
		}
		const clamped = Math.min(MAX_SHADE, Math.max(MIN_SHADE, shade));
		colors[i * 4] = clamped * (1 + warm);
		colors[i * 4 + 1] = clamped;
		colors[i * 4 + 2] = clamped * (1 - warm * 0.7);
		colors[i * 4 + 3] = 1;
	}
	mesh.geometry = cloneGeometryWithColor(geometry, colors, position.count);
	return position.count;
}

function accumulateNormalCells(positions, normals, count) {
	const cells = new Map();
	for (let i = 0; i < count; i++) {
		const key = cellKey(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
		let cell = cells.get(key);
		if (!cell) {
			cell = { count: 0, x: 0, y: 0, z: 0 };
			cells.set(key, cell);
		}
		cell.x += normals[i * 3];
		cell.y += normals[i * 3 + 1];
		cell.z += normals[i * 3 + 2];
		cell.count += 1;
	}
	return cells;
}

function creviceShade(cells, px, py, pz, nx, ny, nz, strength) {
	const cell = cells.get(cellKey(px, py, pz));
	if (!cell || cell.count < 2) return 1;
	const length = Math.hypot(cell.x, cell.y, cell.z) || 1;
	const divergence = 1 - (nx * (cell.x / length) + ny * (cell.y / length) + nz * (cell.z / length));
	const crevice = Math.min(1, Math.max(0, divergence * 3));
	return 1 - strength * crevice * crevice;
}

function cellKey(x, y, z) {
	const qx = Math.floor(x / CREVICE_CELL_SIZE);
	const qy = Math.floor(y / CREVICE_CELL_SIZE);
	const qz = Math.floor(z / CREVICE_CELL_SIZE);
	return (Math.imul(qx, 73856093) ^ Math.imul(qy, 19349663) ^ Math.imul(qz, 83492791)) | 0;
}

function hash3i(x, y, z) {
	let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
}

function cloneGeometryWithColor(geometry, colors, count) {
	const clone = Object.assign(Object.create(Object.getPrototypeOf(geometry)), geometry);
	clone.attributes = {
		...geometry.attributes,
		color: { array: colors, count, itemSize: 4, normalized: false }
	};
	return clone;
}

function meshMaterialName(mesh) {
	const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
	return material?.name || '';
}

function shadeClass(role) {
	if (role === 'skin' || role === 'lips' || role === 'gums') return 'skin';
	if (role === 'coat' || role === 'shirt' || role === 'pants') return 'cloth';
	if (role === 'hair') return 'hair';
	return 'hard';
}
