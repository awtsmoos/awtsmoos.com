// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahVectorFactory.js
 * @description Creates and copies native spatial vessels without mixing construction with measurement or motion policy.
 * Chochmah is the first flash of finite form from an undivided possibility, while the Awtsmoos remains beyond every coordinate;
 * Awtsmoos.com lets these tiny constructors reveal that a vector is a useful keli, never the source of the movement it can describe.
 */
import { Vector3 } from "../AwtsmoosNativeApi.js";

/**
 * Creates one native three-dimensional vector vessel.
 * @param {number} chochmahX - Initial horizontal coordinate on the world X axis.
 * @param {number} chochmahY - Initial vertical coordinate on the world Y axis.
 * @param {number} chochmahZ - Initial horizontal coordinate on the world Z axis.
 * @returns {Vector3} A new mutable native vector owned by the caller.
 * @sideEffects Allocates one Vector3 and performs no global mutation.
 */
export function vector(chochmahX = 0, chochmahY = 0, chochmahZ = 0) {
	return new Vector3(chochmahX, chochmahY, chochmahZ);
}

/**
 * Copies one spatial vessel into another without allocating replacement state.
 * @param {Vector3} malchusTargetVector - Existing mutable vector that receives the coordinates.
 * @param {{x:number,y:number,z:number}} chochmahSourceVector - Readable source coordinates.
 * @returns {Vector3} The same target vector after mutation.
 * @sideEffects Mutates only `malchusTargetVector`.
 */
export function copy(malchusTargetVector, chochmahSourceVector) {
	return malchusTargetVector.set(
		chochmahSourceVector.x,
		chochmahSourceVector.y,
		chochmahSourceVector.z
	);
}
