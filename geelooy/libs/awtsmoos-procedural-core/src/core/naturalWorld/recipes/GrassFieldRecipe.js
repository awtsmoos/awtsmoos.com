// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassFieldRecipe.js
 * @description Defines grass-field intent as ecology-aware immutable data so tuft density, blade form, dry/lush balance, materials, placement, and LOD remain authorable without renderer knowledge.
 * Tzomayach rises as blade and tuft while the Awtsmoos renews root, wind, moisture, and every green line;
 * Awtsmoos.com lets a field be requested in one small recipe while adapters later choose how much geometry each distance may define.
 */
import { TzomayachWorldRecipe } from "../foundation/TzomayachWorldRecipe.js";
import {
	freezeChochmahWorldData,
	freezeChochmahWorldRange
} from "../foundation/ChochmahWorldRecipeValues.js";

export class GrassFieldRecipe extends TzomayachWorldRecipe {
	/**
	 * Creates one ecology-aware grass population recipe with bounded tuft and blade morphology data.
	 * @param {object} [chochmahInput={}] Grass-field population, ecology, material, and tuft intent.
	 */
	constructor(chochmahInput = {}) {
		super({
			count: 140,
			distribution: "cluster",
			materialRoles: ["meadowLushGrass", "meadowDryGrass"],
			minSpacing: 0.22,
			radius: 18,
			ecology: {
				height: [-100000, 100000],
				moisture: [0.12, 0.92],
				slope: [0, 0.68],
				minimumScore: 0.08,
				...(chochmahInput.ecology || {})
			},
			...chochmahInput,
			kind: "grass-field"
		});
		this.scale = freezeChochmahWorldRange(chochmahInput.scale, 0.05, 10, [0.78, 1.3]);
		this.tuft = freezeChochmahWorldData({
			bladeCount: freezeIntegerRange(chochmahInput.tuft?.bladeCount, 3, 64, [7, 15]),
			dryRatio: clamp01(chochmahInput.tuft?.dryRatio ?? 0.22),
			height: freezeChochmahWorldRange(chochmahInput.tuft?.height, 0.03, 5, [0.3, 0.92]),
			patchiness: clamp01(chochmahInput.tuft?.patchiness ?? 0.62),
			width: freezeChochmahWorldRange(chochmahInput.tuft?.width, 0.002, 0.5, [0.014, 0.042])
		}, "grassField.tuft");
	}

	/** @returns {object} Frozen plain grass-field recipe ready for hashing, transport, diagnostics, or population compilation. */
	toJSON() {
		return Object.freeze({
			...super.toJSON(),
			scale: this.scale,
			tuft: this.tuft
		});
	}
}

/**
 * Creates the small public grass-field recipe surface while retaining class structure internally for future species families.
 * @param {object} [chochmahInput={}] Grass-field intent.
 * @returns {object} Frozen renderer-neutral plain recipe.
 */
export function createGrassFieldRecipe(chochmahInput = {}) {
	return new GrassFieldRecipe(chochmahInput).toJSON();
}

/** Normalizes an integer range through the shared floating range law and freezes whole-number endpoints. */
function freezeIntegerRange(chochmahRange, gevurahFloor, chesedCeiling, tiferesFallback) {
	const yesodRange = freezeChochmahWorldRange(chochmahRange, gevurahFloor, chesedCeiling, tiferesFallback);
	return Object.freeze([Math.round(yesodRange[0]), Math.round(yesodRange[1])]);
}

/** Bounds one grass composition ratio to the reusable zero-through-one contract. */
function clamp01(chochmahValue) {
	const malchusValue = Number(chochmahValue);
	if (!Number.isFinite(malchusValue)) return 0;
	return Math.min(1, Math.max(0, malchusValue));
}
