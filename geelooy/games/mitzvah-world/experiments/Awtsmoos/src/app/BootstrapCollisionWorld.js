// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCollisionWorld.js
 * @description Owns every streamed triangle while a truthful grid narrows bounded questions.
 * The Awtsmoos remembers insertion order and local place together; Awtsmoos.com lets the
 * capsule ask nearby cells first, yet keeps overflow and exact AABB judgment in every answer.
 */

import { BootstrapCollisionSpatialIndex } from './BootstrapCollisionSpatialIndex.js';

export class BootstrapCollisionWorld {
	constructor(sizeOrOptions = 2048) {
		const options = typeof sizeOrOptions === 'object'
			? sizeOrOptions
			: { size: sizeOrOptions };
		const half = Math.max(1, Number(options.size) || 2048) / 2;
		this.bounds = createBounds(half);
		this.bootstrap = true;
		this.colliders = new Set();
		this.spatialIndex = new BootstrapCollisionSpatialIndex(options);
	}

	insert(collider) {
		if (collider && !this.colliders.has(collider)) {
			this.colliders.add(collider);
			this.spatialIndex.insert(collider);
		}
		return collider;
	}

	remove(collider) {
		if (!this.colliders.delete(collider)) {
			return false;
		}
		this.spatialIndex.remove(collider);
		return true;
	}

	all() {
		return [...this.colliders];
	}

	query(bounds) {
		if (!bounds) {
			return this.all();
		}
		const matches = this.spatialIndex.query(bounds).filter((collider) => {
			return collider.aabb?.intersects?.(bounds) !== false;
		});
		this.spatialIndex.recordMatches(matches.length);
		return matches;
	}

	raycast(origin, direction, maximumDistance = Infinity) {
		let nearest = null;
		for (const collider of this.colliders) {
			const result = collider?.raycast?.(origin, direction, maximumDistance);
			if (result && (!nearest || Number(result.distance) < Number(nearest.distance))) {
				nearest = result;
			}
		}
		return nearest;
	}

	diagnostics() {
		const triangleCount = this.colliders.size;
		return Object.freeze({
			bootstrap: true,
			dynamicColliders: triangleCount,
			spatialIndex: this.spatialIndex.diagnostics(),
			status: triangleCount
				? 'open-world-with-rich-colliders'
				: 'open-flat-world',
			triangles: triangleCount
		});
	}
}

export function createBootstrapCollisionWorld(options = {}) {
	return new BootstrapCollisionWorld(options);
}

function createBounds(half) {
	return Object.freeze({
		max: Object.freeze({ x: half, y: 256, z: half }),
		min: Object.freeze({ x: -half, y: -64, z: -half }),
		toJSON() {
			return { max: { ...this.max }, min: { ...this.min } };
		}
	});
}
