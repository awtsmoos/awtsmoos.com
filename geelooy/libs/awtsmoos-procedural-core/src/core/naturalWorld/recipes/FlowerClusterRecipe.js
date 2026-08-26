// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FlowerClusterRecipe.js
 * @description Defines flower-colony intent as immutable ecology-aware data while delegating actual stem, leaf, phyllotaxis, organ, growth, seasonal, and realism geometry to the existing botanical engine.
 * Tzomayach blossoms through colony and organ while the Awtsmoos renews petal, stem, season, moisture, and every living sign;
 * Awtsmoos.com lets authors request a plausible flowering population without duplicating the deep botanical wisdom already aligned.
 */
import { TzomayachWorldRecipe } from "../foundation/TzomayachWorldRecipe.js";
import {
	freezeChochmahWorldData,
	freezeChochmahWorldRange
} from "../foundation/ChochmahWorldRecipeValues.js";

export class FlowerClusterRecipe extends TzomayachWorldRecipe {
	/**
	 * Creates one bounded flower-cluster recipe carrying world placement and sanitized botanical-generation intent.
	 * @param {object} [chochmahInput={}] Population, ecology, scale, material, season, and botanical options.
	 */
	constructor(chochmahInput = {}) {
		super({
			count: 28,
			distribution: "cluster",
			materialRoles: ["meadowLushGrass"],
			minSpacing: 0.16,
			radius: 6,
			ecology: {
				height: [-100000, 100000],
				moisture: [0.22, 0.9],
				slope: [0, 0.52],
				minimumScore: 0.12,
				...(chochmahInput.ecology || {})
			},
			...chochmahInput,
			kind: "flower-cluster"
		});
		this.scale = freezeChochmahWorldRange(chochmahInput.scale, 0.05, 10, [0.76, 1.22]);
		this.botanical = freezeChochmahWorldData({
			growth: clamp01(chochmahInput.botanical?.growth ?? 1),
			quality: String(chochmahInput.botanical?.quality || this.quality),
			realism: chochmahInput.botanical?.realism !== false,
			season: String(chochmahInput.botanical?.season || this.season),
			species: String(chochmahInput.botanical?.species || "daisy"),
			variation: freezeChochmahWorldData(chochmahInput.botanical?.variation || {}, "flowerCluster.botanical.variation")
		}, "flowerCluster.botanical");
	}

	/** @returns {object} Frozen plain flower-colony recipe ready for hashing, transport, diagnostics, placement, and botanical delegation. */
	toJSON() {
		return Object.freeze({
			...super.toJSON(),
			scale: this.scale,
			botanical: this.botanical
		});
	}
}

/**
 * Creates the small public flower-cluster recipe surface while the existing botanical core retains responsibility for actual plant form.
 * @param {object} [chochmahInput={}] Flower-colony intent.
 * @returns {object} Frozen renderer-neutral plain recipe.
 */
export function createFlowerClusterRecipe(chochmahInput = {}) {
	return new FlowerClusterRecipe(chochmahInput).toJSON();
}

/** Bounds one growth fraction into the shared zero-through-one authored contract. */
function clamp01(chochmahValue) {
	const malchusValue = Number(chochmahValue);
	if (!Number.isFinite(malchusValue)) return 0;
	return Math.min(1, Math.max(0, malchusValue));
}
