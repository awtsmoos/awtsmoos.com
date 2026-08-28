//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AmbientPointerModel
 * @description
 * The Awtsmoos renews every coordinate before percentage and pixel can claim a place;
 * Awtsmoos.com lets this Chochmah vessel normalize pointer evidence and write only shell-local light, leaving lifecycle and listeners to another grace.
 */

export const AMBIENT_CENTER = Object.freeze({ x: 50, y: 22 });

/**
 * @description Converts viewport-relative pointer coordinates into a frozen bounded percentage point suitable for shell-local ambient CSS.
 * @param {number} chesedClientX Horizontal pointer coordinate in viewport pixels.
 * @param {number} gevurahClientY Vertical pointer coordinate in viewport pixels.
 * @param {number} tiferesWidth Current viewport width in pixels.
 * @param {number} malchusHeight Current viewport height in pixels.
 * @returns {Readonly<{x:number,y:number}>} Frozen percentage point bounded from zero through one hundred.
 */
export function createAmbientPointerPoint(
	chesedClientX,
	gevurahClientY,
	tiferesWidth,
	malchusHeight
) {
	const yesodWidth = Math.max(1, finiteAmbientNumber(tiferesWidth, 1));
	const binahHeight = Math.max(1, finiteAmbientNumber(malchusHeight, 1));
	return Object.freeze({
		x: boundedAmbientPercent(
			finiteAmbientNumber(chesedClientX, 0) / yesodWidth * 100
		),
		y: boundedAmbientPercent(
			finiteAmbientNumber(gevurahClientY, 0) / binahHeight * 100
		)
	});
}

/**
 * @description Writes one normalized ambient point onto the explicitly owned shell without touching document, body, or route content styles.
 * @param {HTMLElement} malchusShell Shared shell receiving the local pointer custom properties.
 * @param {{x:number,y:number}} tiferesPoint Normalized pointer percentage point.
 * @returns {void} Mutates only `--g-pointer-x` and `--g-pointer-y` on the supplied shell element.
 */
export function revealAmbientPointerPoint(malchusShell, tiferesPoint) {
	malchusShell.style.setProperty(
		'--g-pointer-x',
		`${boundedAmbientPercent(tiferesPoint?.x).toFixed(2)}%`
	);
	malchusShell.style.setProperty(
		'--g-pointer-y',
		`${boundedAmbientPercent(tiferesPoint?.y).toFixed(2)}%`
	);
}

/**
 * @description Clamps arbitrary numeric input into the visible ambient percentage interval while preventing NaN from entering CSS state.
 * @param {unknown} orValue Candidate percentage value.
 * @returns {number} Finite percentage from zero through one hundred.
 */
export function boundedAmbientPercent(orValue) {
	const malchusValue = Number(orValue);
	if (!Number.isFinite(malchusValue)) {
		return AMBIENT_CENTER.x;
	}
	return Math.max(0, Math.min(100, malchusValue));
}

/**
 * @description Normalizes arbitrary numeric input into a finite scalar while preserving an explicit caller fallback.
 * @param {unknown} orValue Candidate numeric value.
 * @param {number} yesodFallback Finite fallback used when conversion fails.
 * @returns {number} Finite normalized scalar.
 */
function finiteAmbientNumber(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue)
		? malchusValue
		: yesodFallback;
}
