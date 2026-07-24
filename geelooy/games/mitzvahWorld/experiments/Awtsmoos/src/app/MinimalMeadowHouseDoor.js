// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseDoor.js
 * @description Animates one textured hinged door and replaces its exact octree colliders.
 * The Awtsmoos opens passage without stale resistance; Awtsmoos.com lets one progress value
 * govern visible panel, hinge, state event, target hint, and collision removal/insertion.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from '../world/Box3D.js';
import { housePoint } from './MinimalMeadowHouseMath.js?v=20260724-meadow-17';

export class MinimalMeadowHouseDoor {
	constructor(profile, material, specification, octree, bus) {
		this.profile = profile;
		this.material = material;
		this.spec = specification;
		this.octree = octree;
		this.bus = bus;
		this.progress = 0;
		this.target = 0;
		this.state = 'closed';
		this.group = new Group();
		this.group.name = specification.id;
		this.colliders = [];
		this.rebuild();
	}

	toggle() {
		this.target = this.target > 0.5 ? 0 : 1;
		this.state = this.target ? 'opening' : 'closing';
		this.bus.emit('door:state', this.payload());
	}

	update(deltaSeconds) {
		if (this.progress === this.target) return;
		const direction = Math.sign(this.target - this.progress);
		const previousStep = Math.round(this.progress * 18);
		this.progress = clamp(this.progress + direction * deltaSeconds * 1.7);
		if (Math.abs(this.progress - this.target) < 0.02) this.progress = this.target;
		if (Math.round(this.progress * 18) !== previousStep || this.progress === this.target) this.rebuild();
		if (this.progress === this.target) {
			this.state = this.target ? 'open' : 'closed';
			this.bus.emit('door:state', this.payload());
		}
	}

	rebuild() {
		for (const collider of this.colliders) this.octree.remove(collider);
		for (const child of [...this.group.children]) this.group.remove(child);
		const definition = this.definition();
		this.group.add(createPrimitiveMesh(definition));
		this.colliders = primitiveColliders(definition);
		for (const collider of this.colliders) this.octree.insert(collider);
	}

	definition() {
		const angle = this.spec.yaw - this.progress * Math.PI * 0.52;
		const hinge = housePoint(
			this.profile,
			this.spec.localX - this.profile.doorWidth / 2,
			this.spec.localZ
		);
		const center = {
			x: hinge.x + Math.cos(angle) * this.profile.doorWidth / 2,
			z: hinge.z + Math.sin(angle) * this.profile.doorWidth / 2
		};
		return {
			...this.material,
			id: `${this.spec.id}-panel`,
			position: {
				x: center.x,
				y: this.spec.y + this.profile.doorHeight / 2,
				z: center.z
			},
			rotation: { y: -angle },
			shape: 'box',
			size: {
				x: this.profile.doorWidth,
				y: this.profile.doorHeight,
				z: 0.18
			},
			solid: true
		};
	}

	hint() {
		return { ...this.definition().position };
	}

	payload() {
		return {
			houseId: this.profile.id,
			id: this.spec.id,
			progress: this.progress,
			state: this.state
		};
	}

	destroy() {
		for (const collider of this.colliders) this.octree.remove(collider);
		this.group.parent?.remove(this.group);
	}
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
