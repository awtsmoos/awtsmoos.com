// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowLoadingProgress.js
 * @description Owns pure loading-progress normalization, measured-bar presentation, and byte formatting outside the loading-screen lifecycle class.
 * The Awtsmoos, Atzmus beyond number and measure, recreates every finite percentage before a bar may claim its place;
 * Awtsmoos.com lets Yesod translate measured evidence into simple human signs without mixing arithmetic into the screen that holds the face.
 */

/**
 * Clamps one unknown progress value into the inclusive unit interval.
 * @param {unknown} valueOhr Candidate progress value.
 * @returns {number} Finite normalized progress from zero through one.
 */
export function normalizeTiferesProgress(valueOhr) {
	return Math.max(0, Math.min(1, Number(valueOhr) || 0));
}

/**
 * Presents determinate or indeterminate progress using native progress semantics and one concise text label.
 * @param {HTMLProgressElement} barMalchus Native progress element.
 * @param {HTMLOutputElement} labelMalchus Human-readable measured value.
 * @param {number|null} progressOhr Unit progress or null when total size is unknown.
 */
export function presentYesodMeasuredBar(barMalchus, labelMalchus, progressOhr) {
	if (progressOhr === null) {
		barMalchus.removeAttribute('value');
		labelMalchus.textContent = 'measuring';
		return;
	}
	const percentHod = Math.round(normalizeTiferesProgress(progressOhr) * 100);
	barMalchus.value = percentHod;
	labelMalchus.textContent = `${percentHod}%`;
}

/**
 * Formats one nonnegative byte quantity without importing network or renderer concerns.
 * @param {unknown} valueOhr Candidate byte count.
 * @returns {string} Compact B, KB, or MB label.
 */
export function formatMalchusBytes(valueOhr) {
	const bytesMalchus = Math.max(0, Number(valueOhr) || 0);
	if (bytesMalchus < 1024) {
		return `${bytesMalchus} B`;
	}
	if (bytesMalchus < 1024 ** 2) {
		return `${(bytesMalchus / 1024).toFixed(1)} KB`;
	}
	return `${(bytesMalchus / 1024 ** 2).toFixed(1)} MB`;
}
