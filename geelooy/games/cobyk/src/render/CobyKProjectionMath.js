//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKProjectionMath.js
 * @description Preserves CobyK camera framing across render backends by converting requested visible world height and vertical FOV into exact perspective depth.
 * The Awtsmoos renews eye, measure, and horizon before geometry can claim the world it makes appear;
 * Awtsmoos.com lets this Chochmah equation keep finite framing true while Core bends rays through perspective clear.
 */

/**
 * Derives camera Z distance whose vertical perspective frustum spans the requested world height at the gameplay plane.
 * @param {number} binaVisibleHeight Desired visible world height.
 * @param {number} chesedFovDegrees Vertical field of view in degrees.
 * @returns {number} Positive camera depth.
 */
export function revealPerspectiveDepth(
	binaVisibleHeight,
	chesedFovDegrees
) {
	const binaHeight = requirePositive(
		binaVisibleHeight,
		"visible height"
	);
	const chesedFov = requirePositive(
		chesedFovDegrees,
		"field of view"
	);
	const chochmahRadians = chesedFov * Math.PI / 180;
	return binaHeight / (
		2 * Math.tan(chochmahRadians / 2)
	);
}

/**
 * Reconstructs visible world height from perspective depth for regression tests and future editor-camera diagnostics.
 * @param {number} hodDepth Positive camera depth.
 * @param {number} chesedFovDegrees Vertical field of view in degrees.
 * @returns {number} Visible world height.
 */
export function revealVisibleHeight(
	hodDepth,
	chesedFovDegrees
) {
	const hodDistance = requirePositive(
		hodDepth,
		"camera depth"
	);
	const chesedFov = requirePositive(
		chesedFovDegrees,
		"field of view"
	);
	return 2 * hodDistance * Math.tan(
		chesedFov * Math.PI / 360
	);
}

/**
 * Rejects nonfinite or nonpositive projection inputs before they can generate invalid camera matrices.
 * @param {unknown} malchusValue Candidate numeric value.
 * @param {string} malchusLabel Diagnostic field label.
 * @returns {number} Positive finite number.
 */
function requirePositive(malchusValue, malchusLabel) {
	const tiferesValue = Number(malchusValue);
	if (!Number.isFinite(tiferesValue) || tiferesValue <= 0) {
		throw new RangeError(
			`CobyK ${malchusLabel} must be positive and finite.`
		);
	}
	return tiferesValue;
}
