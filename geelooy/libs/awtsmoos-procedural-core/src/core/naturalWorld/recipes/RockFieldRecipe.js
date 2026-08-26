// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldRecipe.js
 * @description Expresses geological field intent as immutable data—scale, fracture, erosion, burial, tilt, aspect, materials, distribution, and LOD—without choosing renderer meshes or mutating terrain.
 * Domem appears as strata, fracture, burial, and weight while the Awtsmoos renews every stone before geology may call itself alone;
 * Awtsmoos.com lets authors ask for a believable rock field in one small recipe while adapters later reveal whichever mesh language is shown.
 */
import { DomemWorldRecipe } from "../foundation/DomemWorldRecipe.js";
import {
	freezeChochmahWorldData,
	freezeChochmahWorldRange
} from "../foundation/ChochmahWorldRecipeValues.js";

export class RockFieldRecipe extends DomemWorldRecipe {
	/**
	 * Creates one normalized geological population recipe from simple authored intent.
	 * @param {object} [chochmahInput={}] Rock population, material, transform, and geology options.
	 */
	constructor(chochmahInput = {}) {
		super({
			count: 18,
			distribution: "cluster",
			materialRoles: ["weatheredRock"],
			minSpacing: 1.1,
			radius: 22,
			...chochmahInput,
			kind: "rock-field"
		});
		this.scale = freezeChochmahWorldRange(chochmahInput.scale, 0.1, 100, [0.65, 1.8]);
		this.geology = freezeChochmahWorldData({
			aspect: freezeChochmahWorldRange(chochmahInput.geology?.aspect, 0.2, 5, [0.72, 1.48]),
			burial: freezeChochmahWorldRange(chochmahInput.geology?.burial, 0, 1, [0.04, 0.26]),
			erosion: clamp01(chochmahInput.geology?.erosion ?? 0.58),
			fracture: clamp01(chochmahInput.geology?.fracture ?? 0.64),
			primitive: String(chochmahInput.geology?.primitive || "icosphere"),
			tilt: freezeChochmahWorldRange(chochmahInput.geology?.tilt, -Math.PI, Math.PI, [-0.3, 0.3])
		}, "rockField.geology");
	}

	/** @returns {object} Frozen plain rock-field recipe ready for hashing, transport, diagnostics, or population compilation. */
	toJSON() {
		return Object.freeze({
			...super.toJSON(),
			scale: this.scale,
			geology: this.geology
		});
	}
}

/**
 * Creates the small public rock-field recipe surface while retaining the class internally for architectural extension.
 * @param {object} [chochmahInput={}] Rock-field intent.
 * @returns {object} Frozen renderer-neutral plain recipe.
 */
export function createRockFieldRecipe(chochmahInput = {}) {
	return new RockFieldRecipe(chochmahInput).toJSON();
}

/** Bounds one geological intensity into the shared zero-through-one contract. */
function clamp01(chochmahValue) {
	const malchusValue = Number(chochmahValue);
	if (!Number.isFinite(malchusValue)) return 0;
	return Math.min(1, Math.max(0, malchusValue));
}
