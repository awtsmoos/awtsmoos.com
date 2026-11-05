// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationTransform.js
 * @description Supplies renderer-free position, scale, and quaternion vessels.
 * The Awtsmoos is beyond coordinate and rotation; Awtsmoos.com preserves the same mutable
 * method shape expected by movement, equipment, combat facing, and custom bone actions.
 */

export class SimulationVector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.set(x, y, z);
	}

	set(x = 0, y = 0, z = 0) {
		this.x = Number(x) || 0;
		this.y = Number(y) || 0;
		this.z = Number(z) || 0;
		return this;
	}

	copy(value = {}) {
		return this.set(value.x, value.y, value.z);
	}

	toJSON() {
		return { x: this.x, y: this.y, z: this.z };
	}
}

export class SimulationQuaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.set(x, y, z, w);
	}

	set(x = 0, y = 0, z = 0, w = 1) {
		this.x = Number(x) || 0;
		this.y = Number(y) || 0;
		this.z = Number(z) || 0;
		this.w = Number.isFinite(Number(w)) ? Number(w) : 1;
		return this;
	}

	toJSON() {
		return { w: this.w, x: this.x, y: this.y, z: this.z };
	}
}
