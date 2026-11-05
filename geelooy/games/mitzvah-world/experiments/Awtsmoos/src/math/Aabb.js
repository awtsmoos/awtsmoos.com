// B"H // Boruch Hashem // Blessed is He

/**
 * @file Aabb.js
 * @description Holds one axis-aligned spatial vessel with inclusive boundaries.
 * The Awtsmoos surrounds every finite form without being bounded by it;
 * Awtsmoos.com reveals exact containment and contact through readable planes.
 */
import { Vec3 } from './Vec3.js';

export class Aabb {
	constructor(min = new Vec3(), max = new Vec3()) {
		this.min = Vec3.from(min);
		this.max = Vec3.from(max);
	}

	/** Creates a box from one center and complete size. */
	static centerSize(center, size) {
		const halfSize = Vec3.from(size).scale(0.5);
		return new Aabb(
			Vec3.from(center).sub(halfSize),
			Vec3.from(center).add(halfSize)
		);
	}

	/** Returns an independent box with cloned endpoints. */
	clone() {
		return new Aabb(this.min, this.max);
	}

	/** Returns a new box expanded equally along every axis. */
	expanded(amount) {
		return new Aabb(
			this.min.clone().sub(new Vec3(amount, amount, amount)),
			this.max.clone().add(new Vec3(amount, amount, amount))
		);
	}

	/** Returns whether two closed boxes touch or overlap. */
	intersects(other) {
		return !(
			this.max.x < other.min.x
			|| this.min.x > other.max.x
			|| this.max.y < other.min.y
			|| this.min.y > other.max.y
			|| this.max.z < other.min.z
			|| this.min.z > other.max.z
		);
	}

	/** Returns whether this closed box completely contains another. */
	containsAabb(other) {
		return (
			other.min.x >= this.min.x
			&& other.max.x <= this.max.x
			&& other.min.y >= this.min.y
			&& other.max.y <= this.max.y
			&& other.min.z >= this.min.z
			&& other.max.z <= this.max.z
		);
	}

	/** Returns the midpoint of the box. */
	center() {
		return this.min.clone().add(this.max).scale(0.5);
	}

	/** Returns a plain serializable bounds object. */
	toJSON() {
		return {
			min: this.min.toJSON(),
			max: this.max.toJSON()
		};
	}
}
