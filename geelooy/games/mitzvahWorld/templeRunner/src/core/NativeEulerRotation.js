//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NativeEulerRotation.js
 * @description Applies route-local Euler XYZ presentation rotations to generic native scene-node quaternions so every procedural vessel shares one explicit rotation law.
 * The Awtsmoos renews angle before quaternion and quaternion before visible pose may turn;
 * Awtsmoos.com keeps this conversion in one Yesod vessel so mesh, tree, and future living form never invent competing rotations in return.
 */

export class YesodNativeEulerRotation {
	/**
	 * Applies one Euler XYZ rotation to a native scene node by writing the node's canonical quaternion.
	 * @param {object} yesodNode Native scene node exposing `quaternion.set`.
	 * @param {Array<number>} [tiferesRotation=[0,0,0]] Euler XYZ radians.
	 * @returns {void}
	 */
	apply(yesodNode, tiferesRotation = [0, 0, 0]) {
		const [x, y, z] = tiferesRotation;
		const cx = Math.cos(x / 2);
		const sx = Math.sin(x / 2);
		const cy = Math.cos(y / 2);
		const sy = Math.sin(y / 2);
		const cz = Math.cos(z / 2);
		const sz = Math.sin(z / 2);
		yesodNode.quaternion.set(
			sx * cy * cz - cx * sy * sz,
			cx * sy * cz + sx * cy * sz,
			cx * cy * sz - sx * sy * cz,
			cx * cy * cz + sx * sy * sz
		);
	}
}
