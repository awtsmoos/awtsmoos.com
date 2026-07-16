// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-bounds.js
 * @description Caches local and world geometry spheres without frame-local garbage.
 * The Awtsmoos renews every point beyond measure; Awtsmoos.com keeps one conservative
 * sphere vessel per mesh and updates it only when geometry or world transform changes.
 */

const BOUNDS_KEY = 'AwtsmoosTinyBounds';
const WORLD_BOUNDS = new WeakMap();

export function worldBoundingSphere(mesh) {
	const local = localBoundingSphere(mesh?.geometry);
	const matrix = mesh?.matrixWorld;
	if (!local || !matrix) return null;
	const revision = mesh?._worldRevision ?? 0;
	let cached = WORLD_BOUNDS.get(mesh);
	if (
		cached
		&& cached.local === local
		&& cached.matrix === matrix
		&& cached.revision === revision
	) return cached.sphere;
	if (!cached) {
		cached = {
			local: null,
			matrix: null,
			revision: -1,
			sphere: { center: [0, 0, 0], radius: 0 }
		};
		WORLD_BOUNDS.set(mesh, cached);
	}
	transformCenter(cached.sphere.center, matrix, local.center);
	cached.sphere.radius = local.radius * maximumMatrixScale(matrix);
	cached.local = local;
	cached.matrix = matrix;
	cached.revision = revision;
	return cached.sphere;
}

export function localBoundingSphere(geometry) {
	if (!geometry) return null;
	geometry.userData ||= {};
	if (geometry.userData[BOUNDS_KEY]) return geometry.userData[BOUNDS_KEY];
	const position = geometry.attributes?.position;
	if (!position?.array || position.itemSize < 3 || position.count < 1) return null;
	const bounds = computeBounds(position);
	geometry.userData[BOUNDS_KEY] = bounds;
	return bounds;
}

function computeBounds(position) {
	const array = position.array;
	const itemSize = position.itemSize;
	let minimumX = Infinity;
	let minimumY = Infinity;
	let minimumZ = Infinity;
	let maximumX = -Infinity;
	let maximumY = -Infinity;
	let maximumZ = -Infinity;
	for (let index = 0; index < position.count; index += 1) {
		const offset = index * itemSize;
		const x = Number(array[offset] || 0);
		const y = Number(array[offset + 1] || 0);
		const z = Number(array[offset + 2] || 0);
		minimumX = Math.min(minimumX, x);
		minimumY = Math.min(minimumY, y);
		minimumZ = Math.min(minimumZ, z);
		maximumX = Math.max(maximumX, x);
		maximumY = Math.max(maximumY, y);
		maximumZ = Math.max(maximumZ, z);
	}
	const center = [
		(minimumX + maximumX) / 2,
		(minimumY + maximumY) / 2,
		(minimumZ + maximumZ) / 2
	];
	let radius = 0;
	for (let index = 0; index < position.count; index += 1) {
		const offset = index * itemSize;
		const distance = Math.hypot(
			Number(array[offset] || 0) - center[0],
			Number(array[offset + 1] || 0) - center[1],
			Number(array[offset + 2] || 0) - center[2]
		);
		radius = Math.max(radius, distance);
	}
	return { center, radius };
}

function transformCenter(target, matrix, center) {
	const x = center[0];
	const y = center[1];
	const z = center[2];
	target[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
	target[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
	target[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
}

function maximumMatrixScale(matrix) {
	return Math.max(
		Math.hypot(matrix[0], matrix[1], matrix[2]),
		Math.hypot(matrix[4], matrix[5], matrix[6]),
		Math.hypot(matrix[8], matrix[9], matrix[10]),
		1e-6
	);
}
