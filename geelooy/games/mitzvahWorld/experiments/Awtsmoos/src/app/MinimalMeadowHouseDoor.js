// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseDoor.js
 * @description Animates one exact hinged door and reports whether geometry truly changed this frame.
 * The Awtsmoos opens passage without stale resistance; Awtsmoos.com lets one progress value
 * govern panel, hinge, state, target hint, collision, and change-driven maintenance.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from '../world/Box3D.js';
import { minimalMeadowDoorTransform } from './MinimalMeadowDoorTransform.js';

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
		if (this.progress === this.target) return false;
		const direction = Math.sign(this.target - this.progress);
		const previousStep = Math.round(this.progress * 18);
		this.progress = clamp(this.progress + direction * deltaSeconds * 1.7);
		if (Math.abs(this.progress - this.target) < 0.02) {
			this.progress = this.target;
		}
		const changedStep = Math.round(this.progress * 18) !== previousStep;
		const completed = this.progress === this.target;
		if (changedStep || completed) this.rebuild();
		if (completed) {
			this.state = this.target ? 'open' : 'closed';
			this.bus.emit('door:state', this.payload());
		}
		return changedStep || completed;
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
		const transform = minimalMeadowDoorTransform(
			this.profile,
			this.spec,
			this.progress
		);
		return {
			...this.material,
			id: `${this.spec.id}-panel`,
			position: {
				x: transform.center.x,
				y: this.spec.y + this.profile.doorHeight / 2,
				z: transform.center.z
			},
			rotation: { y: -transform.angle },
			shape: 'box',
			size: {
				x: this.profile.doorWidth,
				y: this.profile.doorHeight,
				z: 0.18
			},
			solid: true,
			userData: {
				hinge: transform.hinge,
				localYaw: transform.localYaw,
				role: 'house-door'
			}
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
