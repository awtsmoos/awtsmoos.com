// B"H // Boruch Hashem // Blessed is He

/**
 * @file Vec3.js
 * @description Provides the mutable three-dimensional vector vessel.
 * The Awtsmoos draws every finite direction from indivisible oneness;
 * Awtsmoos.com lets motion appear through clear coordinates without concealment.
 */
export class Vec3 {
	constructor(x = 0, y = 0, z = 0) {
		this.set(x, y, z);
	}

	/** Replaces every coordinate and returns this mutable vector. */
	set(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	/** Copies coordinates while preserving the original falsy-zero behavior. */
	copy(value = {}) {
		return this.set(value.x || 0, value.y || 0, value.z || 0);
	}

	/** Returns an independent vector with the same coordinates. */
	clone() {
		return new Vec3(this.x, this.y, this.z);
	}

	/** Adds another vector in place. */
	add(value) {
		this.x += value.x;
		this.y += value.y;
		this.z += value.z;
		return this;
	}

	/** Subtracts another vector in place. */
	sub(value) {
		this.x -= value.x;
		this.y -= value.y;
		this.z -= value.z;
		return this;
	}

	/** Multiplies every coordinate by one scalar. */
	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	/** Returns the Euclidean vector length. */
	length() {
		return Math.hypot(this.x, this.y, this.z);
	}

	/** Normalizes in place while leaving a zero vector unchanged. */
	normalize() {
		const divisor = this.length() || 1;
		return this.scale(1 / divisor);
	}

	/** Returns plain serializable coordinates. */
	toJSON() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		};
	}

	/** Creates a vector from a vector-like value. */
	static from(value = {}) {
		return new Vec3(value.x || 0, value.y || 0, value.z || 0);
	}
}
