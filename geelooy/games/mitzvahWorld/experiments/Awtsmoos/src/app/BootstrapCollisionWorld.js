// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCollisionWorld.js
 * @description Starts open, then owns every dynamic rich-world collider that arrives after first control.
 * The Awtsmoos grants unobstructed movement before houses descend, then remembers each truthful wall;
 * Awtsmoos.com preserves insertion, removal, query, raycast, bounds, and diagnostics in one authority.
 */

export class BootstrapCollisionWorld {
	constructor(size = 2048) {
		const half = Math.max(1, Number(size) || 2048) / 2;
		this.bounds = Object.freeze({
			max: Object.freeze({ x: half, y: 256, z: half }),
			min: Object.freeze({ x: -half, y: -64, z: -half }),
			toJSON() {
				return { max: { ...this.max }, min: { ...this.min } };
			}
		});
		this.bootstrap = true;
		this.colliders = new Set();
	}

	insert(collider) {
		if (collider) this.colliders.add(collider);
		return collider;
	}

	remove(collider) {
		return this.colliders.delete(collider);
	}

	all() {
		return [...this.colliders];
	}

	query() {
		return this.all();
	}

	raycast(origin, direction, maximumDistance = Infinity) {
		let nearest = null;
		for (const collider of this.colliders) {
			const result = collider?.raycast?.(origin, direction, maximumDistance);
			if (!result) continue;
			if (!nearest || Number(result.distance) < Number(nearest.distance)) {
				nearest = result;
			}
		}
		return nearest;
	}

	diagnostics() {
		return Object.freeze({
			bootstrap: true,
			dynamicColliders: this.colliders.size,
			status: this.colliders.size
				? 'open-world-with-rich-colliders'
				: 'open-flat-world',
			triangles: 0
		});
	}
}

export function createBootstrapCollisionWorld(options = {}) {
	return new BootstrapCollisionWorld(options.size);
}
