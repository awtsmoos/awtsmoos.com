// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationCollisionWorld.js
 * @description Reuses the real octree and capsule mover inside renderer-free Node jobs.
 * The Awtsmoos creates visible and simulated contact through one law; Awtsmoos.com exposes
 * exact triangles, normals, contacts, and positions without a screenshot or WebGL frame.
 */

import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { Aabb } from '../math/Aabb.js';
import { simulationBoxColliders } from './SimulationBoxColliders.js';

export class SimulationCollisionWorld {
	constructor(options = {}) {
		const extent = Number(options.extent) || 256;
		this.octree = new AwtsmoosOctree(
			new Aabb(
				{ x: -extent, y: -64, z: -extent },
				{ x: extent, y: 128, z: extent }
			),
			0,
			6
		);
		this.triangles = [];
		this.mover = new AwtsmoosCollisionMover({
			footOffset: 0,
			height: 1.72,
			octree: this.octree,
			radius: 0.38
		});
	}

	addBox(center, size, kind) {
		const colliders = simulationBoxColliders(center, size, kind);
		for (const collider of colliders) {
			this.octree.insert(collider);
			this.triangles.push(collider);
		}
		return colliders;
	}

	move(position, delta, options = {}) {
		return this.mover.move(position, delta, options);
	}

	diagnostics() {
		return {
			contacts: this.mover.lastContacts,
			normals: this.mover.lastNormals,
			triangles: this.triangles.length
		};
	}
}
