// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesEyeDefinitions.js
 * @description Reveals reusable eyes, eyelids, lashes, and brows as independent biological parts.
 * The Awtsmoos lets sight shine from human face, fish flank, or speaking wall;
 * Awtsmoos.com clothes that light in Tiferes so every lid and lash may answer the call.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const EYE_VARIANTS = Object.freeze({
	human: Object.freeze({ globe: [0.15, 0.12, 0.14], pupil: "round", iris: 0.48, cornea: 0.09 }),
	bovine: Object.freeze({ globe: [0.17, 0.13, 0.16], pupil: "horizontal", iris: 0.52, cornea: 0.08 }),
	caprine: Object.freeze({ globe: [0.16, 0.12, 0.15], pupil: "horizontal-slit", iris: 0.5, cornea: 0.08 }),
	fish: Object.freeze({ globe: [0.14, 0.09, 0.14], pupil: "round", iris: 0.58, cornea: 0.05 }),
	avian: Object.freeze({ globe: [0.13, 0.1, 0.13], pupil: "round", iris: 0.62, cornea: 0.07 })
});

/** Creates one layered eye definition usable on any semantic attachment target. */
export function createTiferesEyeDefinition(variant = "human", overrides = {}) {
	const profile = EYE_VARIANTS[variant] || EYE_VARIANTS.human;
	return createBiologicalDefinition({
		id: `biology.eye.${variant}`,
		category: "eye",
		geometryRecipe: "layered-eye",
		parameters: {
			...profile,
			layers: ["globe", "sclera", "iris", "pupil", "cornea", "lacrimal-corner"],
			...overrides
		},
		materialRegions: ["eye.sclera", "eye.iris", "eye.pupil", "eye.cornea", "eye.lacrimal"],
		animationControls: ["look", "vergence", "pupil-dilation"],
		capabilities: { vision: true, tracking: true },
		rigContribution: { type: "eye-control", aimAxis: "+Z" },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates an upper or lower eyelid definition with blink semantics. */
export function createTiferesEyelidDefinition(side = "upper", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.eyelid.${side}`,
		category: "eyelid",
		geometryRecipe: "surface-ribbon",
		parameters: { side, thickness: 0.012, crease: 0.35, ...overrides },
		materialRegions: ["skin.eyelid", "skin.eyelid-rim"],
		animationControls: ["blink", "squint", "wide-eye"],
		rigContribution: { type: "lid-control", follows: "eye" },
		metadata: { independentlyAttachable: true }
	});
}

/** Creates a directional lash field independent from any particular eyelid. */
export function createTiferesEyelashDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.hair.eyelash",
		category: "hair-field",
		geometryRecipe: "strand-row",
		parameters: { count: 24, length: 0.018, curl: 0.38, taper: 0.92, spread: 0.12, ...overrides },
		materialRegions: ["hair.eyelash"],
		animationControls: ["follow-eyelid"],
		metadata: { independentlyAttachable: true, surfaceRole: "eyelash" }
	});
}

/** Creates a groomed brow field that can live on any surface. */
export function createTiferesEyebrowDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.hair.eyebrow",
		category: "hair-field",
		geometryRecipe: "strand-field",
		parameters: { density: 0.74, length: 0.012, arch: 0.28, directionNoise: 0.08, ...overrides },
		materialRegions: ["hair.eyebrow"],
		animationControls: ["brow-raise", "brow-lower", "brow-pinch"],
		metadata: { independentlyAttachable: true, surfaceRole: "eyebrow" }
	});
}
