// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahRuminantDefinitions.js
 * @description Defines reusable ruminant anatomy without imprisoning it inside cow, deer, sheep, goat, or ram presets.
 * The Awtsmoos gives Gevurah measured hoof, dewlap, ear, udder, and tail;
 * Awtsmoos.com lets each vessel join a proper beast or wander into a chimera without making the architecture fail.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/** Creates a cloven hoof with dewclaw and contact semantics. */
export function createGevurahClovenHoofDefinition(variant = "bovine", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.hoof.cloven.${variant}`,
		category: "hoof",
		geometryRecipe: "paired-hoof-shell",
		parameters: { width: 0.2, length: 0.26, height: 0.14, cleft: 0.08, toeSpread: 0.12, dewclaws: 2, wear: 0.05, ...overrides },
		materialRegions: ["hoof.keratin", "hoof.sole", "hoof.cleft"],
		animationControls: ["toe-spread", "contact-compress"],
		capabilities: { contact: true, traction: true, support: true },
		rigContribution: { type: "paired-digit-endpoint" },
		contactRegions: ["hoof.left-claw", "hoof.right-claw"],
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a mobile ruminant ear with species-family proportion controls. */
export function createGevurahRuminantEarDefinition(variant = "bovine", overrides = {}) {
	const longEar = variant === "deer" || variant === "antelope";
	return createBiologicalDefinition({
		id: `biology.ear.ruminant.${variant}`,
		category: "ear",
		geometryRecipe: "soft-ear-shell",
		parameters: { length: longEar ? 0.34 : 0.25, width: 0.14, cupDepth: 0.06, tipSharpness: longEar ? 0.34 : 0.16, ...overrides },
		materialRegions: ["ear.outer", "ear.inner", "ear.rim"],
		animationControls: ["swivel", "flatten", "perk"],
		capabilities: { hearing: true, expression: true },
		rigContribution: { type: "ear-control", joints: 2 },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a soft dewlap/neck-fold component. */
export function createGevurahDewlapDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.soft-tissue.dewlap",
		category: "soft-tissue",
		geometryRecipe: "hanging-surface-loft",
		parameters: { length: 0.38, depth: 0.16, thickness: 0.025, folds: 3, softness: 0.82, ...overrides },
		materialRegions: ["skin.dewlap"],
		animationControls: ["secondary-sway", "breathing-follow"],
		rigContribution: { type: "soft-chain", joints: 4 },
		metadata: { independentlyAttachable: true }
	});
}

/** Creates an udder assembly with configurable teat count and soft-tissue behavior. */
export function createGevurahUdderDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.mammary.udder",
		category: "mammary",
		geometryRecipe: "lobed-soft-volume",
		parameters: { width: 0.32, length: 0.34, depth: 0.2, teatCount: 4, teatLength: 0.09, fullness: 0.55, ...overrides },
		materialRegions: ["skin.udder", "skin.teat"],
		animationControls: ["secondary-sway"],
		rigContribution: { type: "soft-volume" },
		metadata: { independentlyAttachable: true }
	});
}

/** Creates a tail-end hair tuft independent from the tail itself. */
export function createGevurahTailTuftDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.hair.tail-tuft",
		category: "hair-field",
		geometryRecipe: "strand-cluster",
		parameters: { length: 0.26, density: 0.72, spread: 0.18, clumping: 0.16, ...overrides },
		materialRegions: ["hair.tail-tuft"],
		animationControls: ["wind", "tail-follow"],
		metadata: { independentlyAttachable: true }
	});
}
