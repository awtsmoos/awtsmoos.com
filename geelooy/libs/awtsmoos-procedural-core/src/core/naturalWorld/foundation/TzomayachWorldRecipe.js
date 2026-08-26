// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TzomayachWorldRecipe.js
 * @description Extends the silent Domem world-population foundation with serializable ecological growth ranges for vegetation without binding recipes to runtime terrain samplers.
 * Tzomayach rises through moisture, slope, height, and season while the Awtsmoos renews root and field before growth may claim a separate source;
 * Awtsmoos.com lets living-world intent remain stable data while runtime environments decide where that potential may flower along its course.
 */
import { DomemWorldRecipe } from "./DomemWorldRecipe.js";

export class TzomayachWorldRecipe extends DomemWorldRecipe {
	/**
	 * Creates a vegetation population recipe with normalized ecological ranges layered over the common world foundation.
	 * @param {object} [chochmahInput={}] Serializable vegetation intent and common population fields.
	 */
	constructor(chochmahInput = {}) {
		super(chochmahInput);
		this.ecology = Object.freeze({
			height: freezeRange(chochmahInput.ecology?.height, -100000, 100000),
			moisture: freezeRange(chochmahInput.ecology?.moisture, 0, 1),
			slope: freezeRange(chochmahInput.ecology?.slope, 0, 1),
			minimumScore: clamp01(chochmahInput.ecology?.minimumScore ?? 0)
		});
		this.season = String(chochmahInput.season || "summer");
	}

	/**
	 * Extends the Domem plain-data snapshot with ecological and seasonal vegetation intent.
	 * @returns {object} Frozen serializable recipe data.
	 */
	toJSON() {
		return Object.freeze({
			...super.toJSON(),
			ecology: this.ecology,
			season: this.season
		});
	}
}

/** Creates one immutable ordered numeric interval from array/object input. */
function freezeRange(chochmahRange, gevurahFloor, chesedCeiling) {
	const tiferesValues = Array.isArray(chochmahRange)
		? chochmahRange
		: [chochmahRange?.min, chochmahRange?.max];
	const gevurahMinimum = finiteOr(tiferesValues[0], gevurahFloor);
	const chesedMaximum = finiteOr(tiferesValues[1], chesedCeiling);
	const yesodLow = Math.max(gevurahFloor, Math.min(chesedCeiling, Math.min(gevurahMinimum, chesedMaximum)));
	const yesodHigh = Math.max(yesodLow, Math.min(chesedCeiling, Math.max(gevurahMinimum, chesedMaximum)));
	return Object.freeze([yesodLow, yesodHigh]);
}

/** Converts arbitrary numeric input into a finite fallback-safe number. */
function finiteOr(chochmahValue, tiferesFallback) {
	const malchusValue = Number(chochmahValue);
	return Number.isFinite(malchusValue) ? malchusValue : tiferesFallback;
}

/** Bounds one ecological score to the shared zero-through-one contract. */
function clamp01(chochmahValue) {
	return Math.min(1, Math.max(0, finiteOr(chochmahValue, 0)));
}
