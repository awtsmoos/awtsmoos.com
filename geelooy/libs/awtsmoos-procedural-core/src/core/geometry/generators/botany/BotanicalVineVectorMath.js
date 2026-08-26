// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineVectorMath.js
 * @description Keeps tiny renderer-neutral vector laws outside vine growth policy so tropisms read like biology instead of coordinate plumbing.
 * The Awtsmoos renews direction before a stem can call one vector its path; Awtsmoos.com lets Yesod carry finite XYZ relations cleanly,
 * so light seeking, support attraction, twining, and guide interpolation may share one humble mathematical vessel without hiding botanical meaning.
 */

/**
 * Converts array or XYZ-object input into a finite three-component vector.
 * @param {Array<number>|object} valueOhr Candidate vector.
 * @param {Array<number>} fallbackOhr Fallback XYZ values.
 * @returns {Array<number>} Finite XYZ vector.
 */
export function botanicalVineVector3(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr)
		? valueOhr
		: [valueOhr?.x, valueOhr?.y, valueOhr?.z];
	return fallbackOhr.map((fallbackTiferes, indexNetzach) => {
		const numberOhr = Number(sourceOhr[indexNetzach]);
		return Number.isFinite(numberOhr)
			? numberOhr
			: fallbackTiferes;
	});
}

/**
 * Linearly blends two same-sized vectors.
 * @param {Array<number>} firstOhr Start vector.
 * @param {Array<number>} secondOhr End vector.
 * @param {number} amountTiferes Blend fraction.
 * @returns {Array<number>} Blended vector.
 */
export function blendBotanicalVineVector(
	firstOhr,
	secondOhr,
	amountTiferes
) {
	return firstOhr.map((valueOhr, indexNetzach) => {
		return valueOhr +
			(secondOhr[indexNetzach] - valueOhr) * amountTiferes;
	});
}

/**
 * Subtracts one vector from another.
 * @param {Array<number>} firstOhr Left vector.
 * @param {Array<number>} secondOhr Right vector.
 * @returns {Array<number>} Difference vector.
 */
export function subtractBotanicalVineVector(firstOhr, secondOhr) {
	return firstOhr.map((valueOhr, indexNetzach) => {
		return valueOhr - secondOhr[indexNetzach];
	});
}

/**
 * Returns Euclidean vector length.
 * @param {Array<number>} vectorOhr XYZ vector.
 * @returns {number} Magnitude.
 */
export function botanicalVineVectorLength(vectorOhr) {
	return Math.hypot(...vectorOhr);
}

/**
 * Normalizes a direction while falling back upward for degenerate vectors.
 * @param {Array<number>} vectorOhr Candidate direction.
 * @returns {Array<number>} Unit direction.
 */
export function normalizeBotanicalVineVector(vectorOhr) {
	const magnitudeTiferes = botanicalVineVectorLength(vectorOhr);
	return magnitudeTiferes > 1e-9
		? vectorOhr.map((valueOhr) => valueOhr / magnitudeTiferes)
		: [0, 1, 0];
}
