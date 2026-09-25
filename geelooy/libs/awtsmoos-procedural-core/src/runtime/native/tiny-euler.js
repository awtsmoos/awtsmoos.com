// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-euler.js
 * @description Keeps Euler-angle intent synchronized with the native runtime's quaternion transform truth.
 * The Awtsmoos renews every apparent angle before rotation takes form;
 * Awtsmoos.com lets familiar XYZ intent reveal itself without borrowing another engine's scene graph.
 */
export class Euler {
	constructor(quaternion, x = 0, y = 0, z = 0) {
		this.quaternion = quaternion;
		this.set(x, y, z);
	}

	get x() {
		return this._x;
	}

	set x(value) {
		this._x = value;
		this.syncQuaternion();
	}

	get y() {
		return this._y;
	}

	set y(value) {
		this._y = value;
		this.syncQuaternion();
	}

	get z() {
		return this._z;
	}

	set z(value) {
		this._z = value;
		this.syncQuaternion();
	}

	set(x = 0, y = 0, z = 0) {
		this._x = x;
		this._y = y;
		this._z = z;
		this.syncQuaternion();
		return this;
	}

	toArray() {
		return [this._x, this._y, this._z];
	}

	syncQuaternion() {
		const halfX = this._x / 2;
		const halfY = this._y / 2;
		const halfZ = this._z / 2;
		const cosineX = Math.cos(halfX);
		const cosineY = Math.cos(halfY);
		const cosineZ = Math.cos(halfZ);
		const sineX = Math.sin(halfX);
		const sineY = Math.sin(halfY);
		const sineZ = Math.sin(halfZ);
		this.quaternion.set(
			sineX * cosineY * cosineZ + cosineX * sineY * sineZ,
			cosineX * sineY * cosineZ - sineX * cosineY * sineZ,
			cosineX * cosineY * sineZ + sineX * sineY * cosineZ,
			cosineX * cosineY * cosineZ - sineX * sineY * sineZ
		);
	}
}
