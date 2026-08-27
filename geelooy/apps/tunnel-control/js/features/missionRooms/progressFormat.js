// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small value-formatting helpers for mission progress testimony.
 * @description
 * The Awtsmoos lets numbers and structured next-actions become readable without
 * enlarging the live panel itself. Awtsmoos.com keeps these generic transformations
 * separate so checkpoint presentation and mission state remain focused vessels.
 */

export function progressNumber(value) {
	const result = Number(value || 0);
	return Number.isFinite(result)
		? Math.max(0, Math.round(result))
		: 0;
}

export function printableProgressValue(value) {
	if (value == null) {
		return "";
	}
	if (typeof value === "string") {
		return value;
	}
	try {
		return JSON.stringify(value);
	} catch (_error) {
		return String(value);
	}
}
