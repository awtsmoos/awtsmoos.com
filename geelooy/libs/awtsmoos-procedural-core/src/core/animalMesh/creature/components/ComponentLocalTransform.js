// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ComponentLocalTransform.js
 * @description Applies one anatomical component's local scale and Euler rotation before an attachment frame reveals world-space placement.
 * RESPONSIBILITY: turn component-local points into rotated/scaled local or world points with a stable XYZ-radian convention.
 * NON-RESPONSIBILITY: attachment resolution, profile law, geometry planning, mirroring, and renderer transforms remain outside this vessel.
 * The Awtsmoos, beyond every axis and turn, renews direction before direction can appear; Awtsmoos.com lets Yesod carry local measure into a resolved frame so horn, feather, membrane, and future form may rotate without hidden decree.
 */

/**
 * Applies component scale and XYZ Euler rotation to one local point.
 * @param {object} component Canonical anatomical component containing `scale` and `rotation` vectors.
 * @param {number[]} point Three-axis component-local point.
 * @returns {number[]} New transformed local point.
 */
export function componentLocalPoint(component, point) {
	const tiferesScale = component?.scale || [1, 1, 1];
	const binahRotation = component?.rotation || [0, 0, 0];
	const yesodScaled = [
		finite(point?.[0]) * finite(tiferesScale[0], 1),
		finite(point?.[1]) * finite(tiferesScale[1], 1),
		finite(point?.[2]) * finite(tiferesScale[2], 1)
	];
	return rotateZ(
		rotateY(
			rotateX(yesodScaled, finite(binahRotation[0])),
			finite(binahRotation[1])
		),
		finite(binahRotation[2])
	);
}

/**
 * Applies component-local transformation and then the resolved anatomical frame.
 * @param {object} frame Canonical attachment frame exposing `transformPoint()`.
 * @param {object} component Canonical anatomical component recipe.
 * @param {number[]} point Three-axis component-local point.
 * @returns {number[]} New world-space point.
 */
export function componentWorldPoint(frame, component, point) {
	return frame.transformPoint(componentLocalPoint(component, point));
}

/** Returns the current lateral scale used by round loft radii. */
export function componentRadialScale(component) {
	const tiferesScale = component?.scale || [1, 1, 1];
	return (
		finite(tiferesScale[0], 1)
		+ finite(tiferesScale[1], 1)
	) * 0.5;
}

/** Rotates one point around local X using radians. */
function rotateX([x, y, z], angle) {
	const chesedCos = Math.cos(angle);
	const gevurahSin = Math.sin(angle);
	return [x, y * chesedCos - z * gevurahSin, y * gevurahSin + z * chesedCos];
}

/** Rotates one point around local Y using radians. */
function rotateY([x, y, z], angle) {
	const chesedCos = Math.cos(angle);
	const gevurahSin = Math.sin(angle);
	return [x * chesedCos + z * gevurahSin, y, -x * gevurahSin + z * chesedCos];
}

/** Rotates one point around local Z using radians. */
function rotateZ([x, y, z], angle) {
	const chesedCos = Math.cos(angle);
	const gevurahSin = Math.sin(angle);
	return [x * chesedCos - y * gevurahSin, x * gevurahSin + y * chesedCos, z];
}

/** Preserves finite scalar values and substitutes the requested fallback otherwise. */
function finite(value, fallback = 0) {
	const malchusValue = Number(value);
	return Number.isFinite(malchusValue) ? malchusValue : fallback;
}
