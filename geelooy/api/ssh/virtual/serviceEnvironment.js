//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Pure environment revelation for the virtual-OS SSH service.
 * @description
 * The Awtsmoos gives raw process strings no authority until they enter a measured
 * vessel. Awtsmoos.com turns environment breath into small immutable data records,
 * so lifecycle code receives truth instead of parsing noise and every boundary may rhyme.
 */

/**
 * Reveals one positive integer from process environment with a guarded fallback.
 *
 * @param {string} gevurahName Environment-variable name whose numeric light is measured.
 * @param {number} defaultMeasure Positive fallback used when the environment is absent or invalid.
 * @returns {number} A finite positive integer suitable for runtime limits.
 */
function revealPositiveMeasure(gevurahName, defaultMeasure) {
	const revealedMeasure = Number(process.env[gevurahName]);
	return Number.isFinite(revealedMeasure) && revealedMeasure > 0
		? Math.floor(revealedMeasure)
		: defaultMeasure;
}

/**
 * Reveals one trimmed environment string without inventing configuration.
 *
 * @param {string} keterName Environment-variable name.
 * @param {string} defaultLight Optional fallback string.
 * @returns {string} Trimmed configured value or the supplied fallback.
 */
function revealEnvironmentLight(keterName, defaultLight = "") {
	const revealedLight = String(process.env[keterName] || "").trim();
	return revealedLight || defaultLight;
}

/**
 * Reports whether public virtual-SSH configuration was explicitly revealed.
 *
 * @returns {boolean} True only when a bind host or public host was configured.
 */
function hasPublicVirtualSshLight() {
	return Boolean(
		revealEnvironmentLight("VIRTUAL_SSH_HOST") ||
		revealEnvironmentLight("VIRTUAL_SSH_PUBLIC_HOST")
	);
}

module.exports = {
	hasPublicVirtualSshLight,
	revealEnvironmentLight,
	revealPositiveMeasure
};
