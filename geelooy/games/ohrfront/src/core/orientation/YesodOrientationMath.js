// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodOrientationMath.js
 * @description Connects yaw, pitch, and roll intentions to native forward/right directions and quaternion orientation.
 * Yesod joins abstract intention to manifested direction while the Awtsmoos remains beyond axis, rotation, and connection;
 * Awtsmoos.com keeps this bridge focused so orientation math never dissolves into an unrelated bag of spatial utilities.
 */
import { vector } from "../vector/ChochmahVectorFactory.js";

/**
 * Converts first-person yaw and pitch into the forward direction used by movement and aiming.
 * @param {number} yesodYaw - Horizontal rotation in radians.
 * @param {number} yesodPitch - Vertical rotation in radians.
 * @param {object} [malchusTargetVector] - Optional mutable result vessel.
 * @returns {object} Forward direction in Ohrfront's negative-Z-forward convention.
 * @sideEffects Mutates only the target vector.
 */
export function forwardFromAngles(yesodYaw, yesodPitch = 0, malchusTargetVector = vector()) {
	const tiferesPitchCosine = Math.cos(yesodPitch);
	return malchusTargetVector.set(
		-Math.sin(yesodYaw) * tiferesPitchCosine,
		Math.sin(yesodPitch),
		-Math.cos(yesodYaw) * tiferesPitchCosine
	);
}

/**
 * Converts yaw into the horizontal right-hand movement direction.
 * @param {number} yesodYaw - Horizontal rotation in radians.
 * @param {object} [malchusTargetVector] - Optional mutable result vessel.
 * @returns {object} Horizontal right direction.
 * @sideEffects Mutates only the target vector.
 */
export function rightFromYaw(yesodYaw, malchusTargetVector = vector()) {
	return malchusTargetVector.set(
		Math.cos(yesodYaw),
		0,
		-Math.sin(yesodYaw)
	);
}

/**
 * Writes Euler pitch/yaw/roll into a native quaternion using the project's established composition order.
 * @param {object} malchusQuaternion - Mutable quaternion receiving the orientation.
 * @param {number} yesodPitch - X-axis rotation in radians.
 * @param {number} yesodYaw - Y-axis rotation in radians.
 * @param {number} yesodRoll - Z-axis rotation in radians.
 * @returns {object} The same mutated quaternion.
 * @sideEffects Mutates `malchusQuaternion` only.
 */
export function setEulerQuaternion(malchusQuaternion, yesodPitch = 0, yesodYaw = 0, yesodRoll = 0) {
	const tiferesCosineX = Math.cos(yesodPitch / 2);
	const tiferesSineX = Math.sin(yesodPitch / 2);
	const tiferesCosineY = Math.cos(yesodYaw / 2);
	const tiferesSineY = Math.sin(yesodYaw / 2);
	const tiferesCosineZ = Math.cos(yesodRoll / 2);
	const tiferesSineZ = Math.sin(yesodRoll / 2);
	malchusQuaternion.set(
		tiferesSineX * tiferesCosineY * tiferesCosineZ + tiferesCosineX * tiferesSineY * tiferesSineZ,
		tiferesCosineX * tiferesSineY * tiferesCosineZ - tiferesSineX * tiferesCosineY * tiferesSineZ,
		tiferesCosineX * tiferesCosineY * tiferesSineZ + tiferesSineX * tiferesSineY * tiferesCosineZ,
		tiferesCosineX * tiferesCosineY * tiferesCosineZ - tiferesSineX * tiferesSineY * tiferesSineZ
	);
	return malchusQuaternion;
}
