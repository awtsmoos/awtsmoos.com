// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesAppendageDefinitions.js
 * @description Defines species-neutral continuous appendages whose identity comes from semantic composition rather than ownership by one animal.
 * The Awtsmoos lets tentacle, tendril, proboscis, and trunk reveal different service while sharing continuous living law;
 * Awtsmoos.com makes each independently attachable to creature, wall, tree, vehicle, or any target with a semantic frame to draw.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/** Creates a soft tentacle for cephalopod, cnidarian, sensory, fantasy, or arbitrary use. */
export function createTiferesTentacleDefinition(variant = "cephalopod", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.appendage.tentacle.${variant}`,
		category: "tentacle",
		geometryRecipe: "tentacle-loft",
		parameters: { length: 0.52, radius: 0.035, taper: 0.86, curl: 0.28, undulation: 0.22, droop: 0.16, joints: 10, ...overrides },
		materialRegions: ["appendage.soft.surface", "appendage.soft.tip"],
		animationControls: ["curl", "undulate", "reach", "secondary-sway"],
		rigContribution: { type: "flexible-chain", joints: 10 },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a grasp-capable prehensile appendage without assuming tail, trunk, vine, or fantasy identity. */
export function createTiferesPrehensileAppendageDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.appendage.prehensile",
		category: "prehensile-appendage",
		geometryRecipe: "prehensile-tube",
		parameters: { length: 0.65, radius: 0.035, taper: 0.78, curl: 0.52, coil: 0.3, joints: 9, ...overrides },
		materialRegions: ["appendage.prehensile.surface"],
		animationControls: ["curl", "grasp", "release", "sway"],
		capabilities: { grasp: true, prehensile: true },
		rigContribution: { type: "prehensile-chain", joints: 9 },
		metadata: { independentlyAttachable: true }
	});
}

/** Creates a projecting proboscis usable for feeding, sensing, fantasy speech organs, or other compositions. */
export function createTiferesProboscisDefinition(variant = "feeding", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.appendage.proboscis.${variant}`,
		category: "proboscis",
		geometryRecipe: "proboscis-tube",
		parameters: { length: 0.4, radius: 0.03, taper: 0.45, curve: 0.18, tipScale: 0.72, joints: 7, ...overrides },
		materialRegions: ["appendage.proboscis.surface", "appendage.proboscis.tip"],
		animationControls: ["extend", "retract", "curl"],
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a heavy flexible trunk independently of an elephant or other archetype. */
export function createTiferesTrunkDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.appendage.trunk",
		category: "trunk",
		geometryRecipe: "trunk-loft",
		parameters: { length: 0.72, radius: 0.09, taper: 0.52, curl: 0.12, droop: 0.28, tipScale: 0.46, joints: 10, ...overrides },
		materialRegions: ["appendage.trunk.surface", "appendage.trunk.tip"],
		animationControls: ["curl", "lift", "grasp", "swing"],
		capabilities: { grasp: true, respirationOpening: true },
		rigContribution: { type: "heavy-flexible-chain", joints: 10 },
		metadata: { independentlyAttachable: true }
	});
}
