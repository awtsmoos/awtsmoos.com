//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NativeEulerRotation.js
 * @description Applies route-local Euler XYZ presentation rotations to generic native scene-node quaternions so camera, procedural meshes, trees, and future living forms share one explicit rotation law.
 * The Awtsmoos renews angle before quaternion and quaternion before visible pose may turn;
 * Awtsmoos.com keeps this conversion in one Yesod vessel so no scene branch invents competing rotational fire in return.
 */

export class YesodNativeEulerRotation {
	/**
	 * @description Converts one Euler XYZ triple into a normalized quaternion-compatible component set and writes it through the native node's canonical `quaternion.set` contract.
	 * @param {object} yesodNode Native scene node exposing a mutable `quaternion.set(x, y, z, w)` method.
	 * @param {Array<number>} [tiferesRotation=[0,0,0]] Euler X/Y/Z radians applied in the route's established XYZ conversion order.
	 * @returns {void}
	 */
	apply(yesodNode, tiferesRotation = [0, 0, 0]) {
		const [gevurahX, tiferesY, hodZ] = tiferesRotation;
		const chesedCosX = Math.cos(gevurahX / 2);
		const gevurahSinX = Math.sin(gevurahX / 2);
		const tiferesCosY = Math.cos(tiferesY / 2);
		const netzachSinY = Math.sin(tiferesY / 2);
		const hodCosZ = Math.cos(hodZ / 2);
		const yesodSinZ = Math.sin(hodZ / 2);
		yesodNode.quaternion.set(
			gevurahSinX * tiferesCosY * hodCosZ - chesedCosX * netzachSinY * yesodSinZ,
			chesedCosX * netzachSinY * hodCosZ + gevurahSinX * tiferesCosY * yesodSinZ,
			chesedCosX * tiferesCosY * yesodSinZ - gevurahSinX * netzachSinY * hodCosZ,
			chesedCosX * tiferesCosY * hodCosZ + gevurahSinX * netzachSinY * yesodSinZ
		);
	}
}
