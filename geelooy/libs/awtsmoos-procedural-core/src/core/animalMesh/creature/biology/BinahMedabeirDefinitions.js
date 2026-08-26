// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BinahMedabeirDefinitions.js
 * @description Defines specifically human/Medabeir anatomical parts without reducing humanity to a generic biped preset.
 * The Awtsmoos grants Binah measured hand, foot, ear, and nose with speech-ready face nearby;
 * Awtsmoos.com lets each human vessel remain precise while still being attachable wherever a new composition may lie.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/** Creates a five-digit human hand with opposable thumb and palm semantics. */
export function createBinahHumanHandDefinition(side = "left", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.hand.human.${side}`,
		category: "hand",
		geometryRecipe: "articulated-palm-digits",
		parameters: {
			palm: [0.095, 0.105, 0.032],
			digitCount: 5,
			thumbOpposition: 0.74,
			fingerLengths: [0.72, 1, 1.07, 0.98, 0.78],
			phalanges: [2, 3, 3, 3, 3],
			nails: true,
			...overrides
		},
		materialRegions: ["skin.hand", "nail.hand", "skin.palm-pad"],
		animationControls: ["grip", "spread", "point", "thumb-opposition"],
		capabilities: { grasping: true, manipulation: true, gesture: true },
		rigContribution: { type: "human-hand-chain", digitCount: 5 },
		contactRegions: ["palm", "fingertips"],
		metadata: { side, medabeirSpecific: true, independentlyAttachable: true }
	});
}

/** Creates a human foot with heel, arch, ball, and five toes. */
export function createBinahHumanFootDefinition(side = "left", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.foot.human.${side}`,
		category: "foot",
		geometryRecipe: "human-foot-volume",
		parameters: { length: 0.25, width: 0.095, heel: 0.085, arch: 0.42, toeCount: 5, bigToeScale: 1.18, nails: true, ...overrides },
		materialRegions: ["skin.foot", "nail.toe", "skin.sole-pad"],
		animationControls: ["toe-flex", "toe-spread", "arch-compress"],
		capabilities: { support: true, walking: true, balance: true },
		rigContribution: { type: "human-foot-chain", toeCount: 5 },
		contactRegions: ["heel", "ball", "toes"],
		metadata: { side, medabeirSpecific: true, independentlyAttachable: true }
	});
}

/** Creates a human external ear with named folds and expressive soft control. */
export function createBinahHumanEarDefinition(side = "left", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.ear.human.${side}`,
		category: "ear",
		geometryRecipe: "folded-ear-shell",
		parameters: { height: 0.062, width: 0.034, cupDepth: 0.014, folds: ["helix", "antihelix", "tragus", "antitragus", "concha", "lobule"], ...overrides },
		materialRegions: ["skin.ear.outer", "skin.ear.inner", "skin.ear-lobule"],
		animationControls: ["subtle-ear-motion"],
		capabilities: { hearing: true },
		rigContribution: { type: "soft-ear-control" },
		metadata: { side, medabeirSpecific: true, independentlyAttachable: true }
	});
}

/** Creates a specifically human nose with bridge, alae, septum, and nostrils. */
export function createBinahHumanNoseDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.nose.human",
		category: "nose",
		geometryRecipe: "human-nose-loft",
		parameters: { length: 0.055, width: 0.036, projection: 0.028, bridge: 0.54, tipRoundness: 0.48, alae: 0.44, nostrilCount: 2, septum: 0.42, ...overrides },
		materialRegions: ["skin.nose", "skin.nostril", "skin.septum"],
		animationControls: ["nostril-flare", "nose-wrinkle"],
		capabilities: { respiration: "air", smell: true },
		metadata: { medabeirSpecific: true, independentlyAttachable: true }
	});
}
