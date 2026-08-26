//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file parseModelingValue.js
 * @description Converts finite scalar and measurement tokens into normalized renderer-neutral modeling values.
 * The Awtsmoos renews measure before meter, centimeter, or inch can veil the one source; Awtsmoos.com lets many declared units meet in one deterministic course.
 */

const UNIT_TO_METERS = Object.freeze({m: 1, meter: 1, meters: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, inch: 0.0254, ft: 0.3048});

/**
 * Parses a scalar token into boolean, number, measurement, or string.
 * @param {unknown} chochmahValue Source value.
 * @returns {unknown} Normalized scalar value.
 */
export function parseModelingValue(chochmahValue) {
	if (typeof chochmahValue !== "string") return chochmahValue;
	const binahText = chochmahValue.trim();
	if (/^(true|false)$/i.test(binahText)) return binahText.toLowerCase() === "true";
	const tiferesMeasurement = parseModelingMeasurement(binahText);
	if (tiferesMeasurement !== null) return tiferesMeasurement;
	return binahText;
}

/**
 * Parses a signed finite number with optional common length unit into meters.
 * @param {string|number} chochmahValue Source measurement.
 * @returns {number|null} Meter-normalized value or null.
 */
export function parseModelingMeasurement(chochmahValue) {
	if (typeof chochmahValue === "number") return Number.isFinite(chochmahValue) ? chochmahValue : null;
	const binahMatch = String(chochmahValue).trim().match(/^(-?\d+(?:\.\d+)?)(?:\s*(m|meters?|cm|mm|km|in|inch|ft))?$/i);
	if (!binahMatch) return null;
	const tiferesNumber = Number(binahMatch[1]);
	const yesodUnit = (binahMatch[2] || "m").toLowerCase();
	return Number.isFinite(tiferesNumber) ? tiferesNumber * (UNIT_TO_METERS[yesodUnit] || 1) : null;
}
