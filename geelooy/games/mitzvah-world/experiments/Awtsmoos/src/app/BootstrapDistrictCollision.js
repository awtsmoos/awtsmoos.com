// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictCollision.js
 * @description Turns only structural district boxes into transactional, releasable triangle receipts.
 * The Awtsmoos distinguishes wall from ornament while both share one visible place;
 * Awtsmoos.com lets doors, trim, and chimney enrich the eye without becoming collision in the traveler's space.
 */

import { TriangleCollider } from '../collision/TriangleCollider.js';

const BOX_FACES = Object.freeze([
	[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7],
	[0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2],
	[0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5]
]);

export function createBootstrapDistrictColliders(definition) {
	return (definition.parts || [])
		.filter(part => part.collides !== false)
		.flatMap(part => createPartColliders(definition.id, part));
}

export function registerBootstrapDistrictCollision(runtime, definition) {
	const authority = runtime.mainOctree || runtime.collisionQuery;
	if (!authority?.insert || !authority?.remove) {
		throw new Error('B"H bootstrap district collision authority is unavailable.');
	}
	const colliders = createBootstrapDistrictColliders(definition);
	const inserted = [];
	try {
		for (const collider of colliders) {
			authority.insert(collider);
			inserted.push(collider);
		}
	} catch (error) {
		for (const collider of inserted.reverse()) {
			authority.remove(collider);
		}
		throw error;
	}
	return createReceipt(authority, definition, colliders);
}

function createReceipt(authority, definition, colliders) {
	let released = false;
	return Object.freeze({
		colliders: Object.freeze([...colliders]),
		districtId: definition.id,
		parts: definition.parts?.filter(part => part.collides !== false).length || 0,
		release() {
			if (released) return 0;
			released = true;
			let removed = 0;
			for (const collider of colliders) {
				removed += authority.remove(collider) ? 1 : 0;
			}
			return removed;
		},
		get released() {
			return released;
		},
		triangles: colliders.length
	});
}

function createPartColliders(districtId, part) {
	const center = vectorFrom(part.position, 'position');
	const size = vectorFrom(part.scale, 'scale');
	const half = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
	const vertices = boxVertices(center, half);
	return BOX_FACES.map((face, index) => new TriangleCollider(
		vertices[face[0]],
		vertices[face[1]],
		vertices[face[2]],
		{
			floor: false,
			kind: `bootstrap-district:${districtId}:${part.name}:face-${index}`,
			solid: true
		}
	));
}

function boxVertices(center, half) {
	return [
		point(center, half, -1, -1, -1), point(center, half, 1, -1, -1),
		point(center, half, 1, 1, -1), point(center, half, -1, 1, -1),
		point(center, half, -1, -1, 1), point(center, half, 1, -1, 1),
		point(center, half, 1, 1, 1), point(center, half, -1, 1, 1)
	];
}

function point(center, half, x, y, z) {
	return {
		x: center.x + x * half.x,
		y: center.y + y * half.y,
		z: center.z + z * half.z
	};
}

function vectorFrom(values, label) {
	if (!Array.isArray(values) || values.length < 3) {
		throw new TypeError(`B"H district part ${label} must contain three numbers.`);
	}
	const [x, y, z] = values.map(Number);
	if (![x, y, z].every(Number.isFinite)) {
		throw new TypeError(`B"H district part ${label} must be finite.`);
	}
	return { x, y, z };
}
