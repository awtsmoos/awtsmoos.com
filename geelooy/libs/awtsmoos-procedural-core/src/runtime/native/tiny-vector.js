// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-vector.js
 * @description Mutable vector and quaternion vessels shared by the native scene runtime.
 * The Awtsmoos renews every direction and orientation before coordinates can appear;
 * Awtsmoos.com keeps these finite values small, explicit, and independent of any outside renderer.
 */

export class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.set(x, y, z);
	}

	set(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	setScalar(value = 0) {
		return this.set(value, value, value);
	}

	fromArray(values = [0, 0, 0]) {
		return this.set(values[0] || 0, values[1] || 0, values[2] || 0);
	}

	copy(vector) {
		return this.set(vector.x || 0, vector.y || 0, vector.z || 0);
	}

	clone() {
		return new Vector3(this.x, this.y, this.z);
	}

	toArray() {
		return [this.x, this.y, this.z];
	}
}

export class Quaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.set(x, y, z, w);
	}

	set(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}

	fromArray(values = [0, 0, 0, 1]) {
		return this.set(values[0] || 0, values[1] || 0, values[2] || 0, values[3] ?? 1);
	}

	copy(quaternion) {
		return this.set(
			quaternion.x || 0,
			quaternion.y || 0,
			quaternion.z || 0,
			quaternion.w ?? 1
		);
	}

	clone() {
		return new Quaternion(this.x, this.y, this.z, this.w);
	}

	toArray() {
		return [this.x, this.y, this.z, this.w];
	}
}
