// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TzomayachWorldRecipe.js
 * @description Extends the Domem world-population foundation with serializable ecological growth ranges while preserving inheritance-safe immutability at the actual vegetation leaf.
 * Tzomayach rises through moisture, slope, height, and season while the Awtsmoos renews root and field before growth may claim a separate source;
 * Awtsmoos.com lets living-world intent remain stable data while runtime environments decide where that potential may flower along its course.
 */
import { DomemWorldRecipe } from "./DomemWorldRecipe.js";
import { freezeChochmahWorldRange } from "./ChochmahWorldRecipeValues.js";

export class TzomayachWorldRecipe extends DomemWorldRecipe {
	/**
	 * Creates a vegetation population recipe with normalized ecological ranges layered over the common world foundation.
	 * @param {object} [chochmahInput={}] Serializable vegetation intent and common population fields.
	 */
	constructor(chochmahInput = {}) {
		super(chochmahInput);
		this.ecology = Object.freeze({
			height: freezeChochmahWorldRange(chochmahInput.ecology?.height, -100000, 100000, [-100000, 100000]),
			moisture: freezeChochmahWorldRange(chochmahInput.ecology?.moisture, 0, 1, [0, 1]),
			slope: freezeChochmahWorldRange(chochmahInput.ecology?.slope, 0, 1, [0, 1]),
			minimumScore: clamp01(chochmahInput.ecology?.minimumScore ?? 0)
		});
		this.season = String(chochmahInput.season || "summer");
		if (new.target === TzomayachWorldRecipe) Object.freeze(this);
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

/** Bounds one ecological score to the shared zero-through-one contract. */
function clamp01(chochmahValue) {
	const malchusValue = Number(chochmahValue);
	if (!Number.isFinite(malchusValue)) return 0;
	return Math.min(1, Math.max(0, malchusValue));
}
