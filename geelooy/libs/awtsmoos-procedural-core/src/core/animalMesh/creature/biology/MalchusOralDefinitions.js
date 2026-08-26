// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusOralDefinitions.js
 * @description Defines reusable mouths, tongues, beaks, and snouts with visible internal anatomy.
 * The Awtsmoos gives speech to Medabeir and chewing law to beast or wall;
 * Awtsmoos.com lets Malchus reveal lips, palate, fang, beak, and tongue wherever living form may call.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const BEAK_VARIANTS = Object.freeze({
	turkey: Object.freeze({ length: 0.22, width: 0.11, depth: 0.09, hook: 0.04, gape: 0.34 }),
	duck: Object.freeze({ length: 0.28, width: 0.18, depth: 0.07, hook: 0, gape: 0.26 }),
	raptor: Object.freeze({ length: 0.25, width: 0.1, depth: 0.12, hook: 0.42, gape: 0.38 }),
	parrot: Object.freeze({ length: 0.2, width: 0.12, depth: 0.14, hook: 0.58, gape: 0.4 }),
	toucan: Object.freeze({ length: 0.48, width: 0.15, depth: 0.17, hook: 0.08, gape: 0.3 })
});

/** Creates a mouth with explicit external and internal oral regions. */
export function createMalchusMouthDefinition(variant = "human", overrides = {}) {
	const ruminant = variant === "ruminant";
	return createBiologicalDefinition({
		id: `biology.mouth.${variant}`,
		category: "mouth",
		geometryRecipe: "layered-mouth-cavity",
		parameters: {
			width: ruminant ? 0.42 : 0.3,
			height: ruminant ? 0.15 : 0.1,
			depth: ruminant ? 0.28 : 0.18,
			gape: 0.36,
			internalRegions: ["inner-lips", "gums", "teeth", "tongue-bed", "hard-palate", "soft-palate", "inner-cheeks", "throat"],
			dentition: ruminant ? "ruminant-dental-pad" : "generalized-mammal",
			...overrides
		},
		materialRegions: ["mouth.lip", "mouth.gum", "mouth.tooth", "mouth.tongue", "mouth.palate", "mouth.wet"],
		animationControls: ["jaw-open", "lip-shape", "chew", "speech", "snarl"],
		capabilities: { vocalOpening: true, feeding: true },
		rigContribution: { type: "jaw-and-lip-controls" },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a standalone tongue family that can be placed inside or outside mouths. */
export function createMalchusTongueDefinition(variant = "human", overrides = {}) {
	const forked = variant === "snake";
	return createBiologicalDefinition({
		id: `biology.tongue.${variant}`,
		category: "tongue",
		geometryRecipe: forked ? "forked-soft-tube" : "soft-tapered-loft",
		parameters: { length: forked ? 0.34 : 0.22, width: 0.08, thickness: 0.035, fork: forked ? 2 : 0, papillae: variant === "feline" ? 0.85 : 0.18, ...overrides },
		materialRegions: ["tongue.surface", "tongue.wet"],
		animationControls: ["extend", "curl", "flatten", "retract"],
		rigContribution: { type: "flexible-chain", joints: 5 },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates an upper/lower keratin beak assembly profile with nares and gape. */
export function createMalchusBeakDefinition(variant = "turkey", overrides = {}) {
	const profile = BEAK_VARIANTS[variant] || BEAK_VARIANTS.turkey;
	return createBiologicalDefinition({
		id: `biology.beak.${variant}`,
		category: "beak",
		geometryRecipe: "paired-beak-loft",
		parameters: { ...profile, upperLowerRatio: 1.12, nareCount: 2, keratinRidge: 0.14, ...overrides },
		materialRegions: ["beak.upper", "beak.lower", "beak.nares", "beak.inner"],
		animationControls: ["gape", "bite"],
		capabilities: { feeding: true, grasping: true },
		rigContribution: { type: "beak-jaw-control" },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a reusable muzzle/snout volume independent from a head archetype. */
export function createMalchusSnoutDefinition(variant = "bovine", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.snout.${variant}`,
		category: "snout",
		geometryRecipe: "muzzle-loft",
		parameters: { length: 0.34, width: 0.28, height: 0.2, nosePad: variant === "bovine", nostrils: 2, whiskerPads: variant === "feline", ...overrides },
		materialRegions: ["snout.skin", "snout.nose", "snout.nostril"],
		animationControls: ["nostril-flare", "muzzle-compress"],
		metadata: { variant, independentlyAttachable: true }
	});
}
