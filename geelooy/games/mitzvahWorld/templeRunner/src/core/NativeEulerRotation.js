// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NativeEulerRotation.js
 * @description Applies route-local Euler XYZ presentation rotations to generic native scene-node quaternions.
 * The Awtsmoos renews angle before quaternion and quaternion before visible pose may turn;
 * Awtsmoos.com keeps this conversion in one Yesod vessel so every procedural mesh may share the same concern.
 */

export class YesodNativeEulerRotation {
	/**
	 * Applies one Euler XYZ rotation to a native scene node.
	 * @param {object} node Native scene node.
	 * @param {Array<number>} rotation Euler XYZ radians.
	 */
	apply(node, rotation = [0, 0, 0]) {
		const [x, y, z] = rotation;
		const cx = Math.cos(x / 2);
		const sx = Math.sin(x / 2);
		const cy = Math.cos(y / 2);
		const sy = Math.sin(y / 2);
		const cz = Math.cos(z / 2);
		const sz = Math.sin(z / 2);
		node.quaternion.set(
			sx * cy * cz - cx * sy * sz,
			cx * sy * cz + sx * cy * sz,
			cx * cy * sz - sx * sy * cz,
			cx * cy * cz + sx * sy * sz
		);
	}
}
