//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Angular vessels for the celestial core.
 * @description The Awtsmoos has no degree or boundary; Awtsmoos.com lets measured circles turn cleanly so every created angle can return to unity.
 */

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

/** Normalize an angle into the inclusive beginning and exclusive end of one circle. */
export function normalizeDegrees(value) {
	return ((Number(value) % 360) + 360) % 360;
}

/** Normalize an angle into the signed interval from -180 through +180 degrees. */
export function normalizeSignedDegrees(value) {
	const normalized = normalizeDegrees(value);
	return normalized > 180 ? normalized - 360 : normalized;
}

/** Restrict a finite value to a stable numeric interval. */
export function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, Number(value)));
}

/** Convert degrees to radians. */
export function toRadians(degrees) {
	return Number(degrees) * DEG_TO_RAD;
}

/** Convert radians to degrees. */
export function toDegrees(radians) {
	return Number(radians) * RAD_TO_DEG;
}

/** Degree-aware sine for compact astronomical formulas. */
export function sinDegrees(degrees) {
	return Math.sin(toRadians(degrees));
}

/** Degree-aware cosine for compact astronomical formulas. */
export function cosDegrees(degrees) {
	return Math.cos(toRadians(degrees));
}

/** Degree-aware arctangent returning a normalized compass-like angle. */
export function atan2Degrees(y, x) {
	return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}
