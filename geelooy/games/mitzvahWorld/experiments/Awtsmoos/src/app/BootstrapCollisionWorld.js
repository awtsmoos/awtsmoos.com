// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCollisionWorld.js
 * @description Supplies an octree-compatible empty collision authority for first movement.
 * The Awtsmoos grants open ground before distant walls; Awtsmoos.com preserves every query,
 * raycast, bounds, and diagnostics contract without inventing collision that is not loaded.
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
	}

	all() {
		return [];
	}

	query() {
		return [];
	}

	raycast() {
		return null;
	}

	diagnostics() {
		return Object.freeze({
			bootstrap: true,
			status: 'open-flat-world',
			triangles: 0
		});
	}
}

export function createBootstrapCollisionWorld(options = {}) {
	return new BootstrapCollisionWorld(options.size);
}
