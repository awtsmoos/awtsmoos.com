// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachSensoryDefinitions.js
 * @description Defines reusable whiskers, barbels, antennae, and nostril structures as independent sensing features.
 * The Awtsmoos lets touch and scent extend beyond one face or species line;
 * Awtsmoos.com lets whisker, barbel, feeler, and nare find any lawful surface and still retain their sign.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/** Creates a directional vibrissa/whisker field with root sensitivity metadata. */
export function createNetzachWhiskerFieldDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.sensory.whisker-field",
		category: "sensory-hair-field",
		geometryRecipe: "stiff-strand-field",
		parameters: { count: 18, length: 0.12, taper: 0.96, spread: 0.42, curvature: 0.08, rootStiffness: 0.88, ...overrides },
		materialRegions: ["hair.vibrissa"],
		animationControls: ["whisker-splay", "contact-deflect"],
		capabilities: { tactileSense: true },
		rigContribution: { type: "strand-root-controls" },
		metadata: { independentlyAttachable: true }
	});
}

/** Creates one barbel suitable for fish, catfish-like, goat-like, or fantasy placement. */
export function createNetzachBarbelDefinition(variant = "fish", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.sensory.barbel.${variant}`,
		category: "barbel",
		geometryRecipe: "flexible-tapered-tube",
		parameters: { length: 0.16, radius: 0.008, taper: 0.9, joints: 4, droop: 0.12, ...overrides },
		materialRegions: ["barbel.surface"],
		animationControls: ["flow-response", "touch-deflect"],
		capabilities: { tactileSense: true, chemicalSense: variant === "fish" },
		rigContribution: { type: "flexible-chain", joints: 4 },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates an antenna/feeler with arbitrary segment count and sensory semantics. */
export function createNetzachAntennaDefinition(variant = "filiform", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.sensory.antenna.${variant}`,
		category: "antenna",
		geometryRecipe: "segmented-feeler-chain",
		parameters: { length: 0.24, segments: 9, radius: 0.006, taper: 0.86, clubScale: variant === "clubbed" ? 1.8 : 1, ...overrides },
		materialRegions: ["antenna.surface", "antenna.tip"],
		animationControls: ["sweep", "curl", "contact-deflect"],
		capabilities: { tactileSense: true, chemicalSense: true },
		rigContribution: { type: "segmented-soft-chain", joints: 8 },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a nostril/nare pair or single opening independently of a nose or beak. */
export function createNetzachNareDefinition(variant = "mammal", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.nare.${variant}`,
		category: "nare",
		geometryRecipe: "inset-opening-pair",
		parameters: { count: variant === "blowhole" ? 1 : 2, width: 0.025, height: 0.012, depth: 0.018, flare: 0.16, rimThickness: 0.004, ...overrides },
		materialRegions: ["nare.rim", "nare.inner"],
		animationControls: ["flare", "close"],
		capabilities: { respirationOpening: true, smell: variant !== "blowhole" },
		metadata: { variant, independentlyAttachable: true }
	});
}
