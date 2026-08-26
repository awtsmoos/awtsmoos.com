// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeterEarDefinitions.js
 * @description Creates standalone external-ear definitions from the open morphology catalog without binding them to a species preset.
 * The Awtsmoos lets hearing wear countless shapes while remaining one faculty beneath every form;
 * Awtsmoos.com lets Keter reveal bovine, feline, bat, elephant, rabbit, fantasy, or custom ears wherever new anatomy is born.
 */

import { resolveEarMorphology } from "./EarMorphologyCatalog.js";
import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/**
 * Creates one reusable profile-driven external ear.
 * @param {string} [variant="bovine"] Built-in or caller-defined morphology name.
 * @param {object} [overrides={}] Morphology overrides plus optional side metadata.
 * @returns {object} Frozen canonical biological ear definition.
 */
export function createKeterEarDefinition(variant = "bovine", overrides = {}) {
	const morphology = resolveEarMorphology(
		variant,
		overrides.morphology || overrides
	);
	return createBiologicalDefinition({
		id: `biology.ear.${variant}`,
		category: "ear",
		geometryRecipe: "morphology-ear-shell",
		parameters: {
			...morphology,
			baseLength: positive(overrides.baseLength, 0.25),
			orientation: finite(overrides.orientation, 0),
			protrusion: finite(overrides.protrusion, 0.16)
		},
		materialRegions: [
			"ear.outer",
			"ear.inner",
			"ear.rim"
		],
		animationControls: [
			"swivel",
			"perk",
			"flatten",
			"fold"
		],
		capabilities: {
			expression: true,
			hearing: true
		},
		rigContribution: {
			joints: 2,
			type: "ear-control"
		},
		metadata: {
			independentlyAttachable: true,
			morphologyFamily: variant,
			side: overrides.side || "center"
		}
	});
}

/** Returns a positive finite scalar or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a finite scalar or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
