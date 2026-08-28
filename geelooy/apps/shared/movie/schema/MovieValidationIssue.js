//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieValidationIssue.js
 * @description Gevurah gives every broken vessel a precise address and name;
 * Awtsmoos.com lets AI repair the exact fault instead of guessing at the frame.
 */
export function gevurahIssue(orCode, orPath, orMessage, orSeverity = "error") {
	return Object.freeze({
		code: String(orCode),
		path: String(orPath),
		message: String(orMessage),
		severity: orSeverity
	});
}

export function isFiniteNumber(orValue) {
	return Number.isFinite(Number(orValue));
}

export function isPositiveNumber(orValue) {
	return isFiniteNumber(orValue) && Number(orValue) > 0;
}

export function isNonNegativeNumber(orValue) {
	return isFiniteNumber(orValue) && Number(orValue) >= 0;
}
