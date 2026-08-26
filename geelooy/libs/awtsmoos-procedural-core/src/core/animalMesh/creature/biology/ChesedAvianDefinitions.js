// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChesedAvianDefinitions.js
 * @description Defines reusable avian and turkey display anatomy as independent biological features.
 * The Awtsmoos lets Chesed spread feather, snood, wattle, and fan from one living source;
 * Awtsmoos.com lets each feature stand alone or join a complete turkey by one composable course.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

/** Creates the turkey snood as soft extensible tissue. */
export function createChesedTurkeySnoodDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.turkey.snood",
		category: "soft-tissue",
		geometryRecipe: "hanging-soft-tube",
		parameters: { length: 0.16, width: 0.035, taper: 0.72, curl: 0.18, engorgement: 0.45, ...overrides },
		materialRegions: ["turkey.snood.skin", "turkey.snood.wet"],
		animationControls: ["droop", "engorge", "secondary-sway"],
		rigContribution: { type: "soft-chain", joints: 4 },
		metadata: { turkeySpecific: true, independentlyAttachable: true }
	});
}

/** Creates a turkey wattle/dewlap beneath the beak and neck. */
export function createChesedTurkeyWattleDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.turkey.wattle",
		category: "soft-tissue",
		geometryRecipe: "hanging-surface-lobe",
		parameters: { width: 0.15, length: 0.2, thickness: 0.018, lobes: 3, wrinkle: 0.32, ...overrides },
		materialRegions: ["turkey.wattle.skin"],
		animationControls: ["secondary-sway", "display-engorge"],
		rigContribution: { type: "soft-surface-control" },
		metadata: { turkeySpecific: true, independentlyAttachable: true }
	});
}

/** Creates a field of turkey caruncles over any selected surface region. */
export function createChesedTurkeyCaruncleFieldDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.turkey.caruncle-field",
		category: "surface-field",
		geometryRecipe: "soft-nodule-field",
		parameters: { density: 0.58, size: 0.012, sizeVariation: 0.42, height: 0.009, clustering: 0.36, ...overrides },
		materialRegions: ["turkey.caruncle.skin"],
		animationControls: ["vascular-engorge"],
		skinningContribution: { type: "inherit-underlying-surface" },
		metadata: { turkeySpecific: true, independentlyAttachable: true }
	});
}

/** Creates a display tail fan as a semantic feather-array assembly. */
export function createChesedTurkeyTailFanDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.turkey.tail-fan",
		category: "feather-array",
		geometryRecipe: "radial-feather-fan",
		parameters: { featherCount: 18, radius: 0.72, arc: Math.PI * 0.92, featherLength: 0.58, featherWidth: 0.12, overlap: 0.34, ...overrides },
		materialRegions: ["feather.tail", "feather.tail-band", "feather.tail-tip"],
		animationControls: ["fan-open", "fan-close", "flutter"],
		rigContribution: { type: "feather-fan-control" },
		metadata: { turkeySpecific: true, independentlyAttachable: true }
	});
}

/** Creates a keratin spur that can be attached to any limb or surface. */
export function createChesedAvianSpurDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.avian.spur",
		category: "keratin-spur",
		geometryRecipe: "curved-keratin-spike",
		parameters: { length: 0.075, radius: 0.015, curve: 0.18, taper: 0.94, ...overrides },
		materialRegions: ["keratin.spur"],
		capabilities: { defense: true },
		metadata: { independentlyAttachable: true }
	});
}
