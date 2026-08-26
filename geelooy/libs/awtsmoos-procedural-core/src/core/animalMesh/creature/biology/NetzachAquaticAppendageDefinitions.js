// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAquaticAppendageDefinitions.js
 * @description Extends aquatic appendage vocabulary with finlets, ribbon fins, caudal families, lures, tentacles, cirri, and sucker fields.
 * The Awtsmoos lets water reveal fin, tail, lure, sucker, and reaching arm without sealing their geometry inside a fish;
 * Awtsmoos.com keeps every part independently callable, so aquatic law may clothe land creature, wall, dragon, or any target one may wish.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const CAUDAL = Object.freeze({
	emarginate: { length: 0.4, span: 0.31, notch: 0.18, upperScale: 1, lowerScale: 1 },
	forked: { length: 0.42, span: 0.32, notch: 0.34, upperScale: 1, lowerScale: 1 },
	heterocercal: { length: 0.44, span: 0.32, notch: 0.22, upperScale: 1.28, lowerScale: 0.72 },
	homocercal: { length: 0.4, span: 0.3, notch: 0.22, upperScale: 1, lowerScale: 1 },
	lunate: { length: 0.46, span: 0.35, notch: 0.48, upperScale: 1, lowerScale: 1 },
	rounded: { length: 0.36, span: 0.3, notch: 0.05, upperScale: 0.92, lowerScale: 0.92 },
	shark: { length: 0.46, span: 0.34, notch: 0.2, upperScale: 1.38, lowerScale: 0.64 },
	truncate: { length: 0.34, span: 0.29, notch: 0.01, upperScale: 0.9, lowerScale: 0.9 }
});

/** Creates one small finlet through the existing ray-membrane fin law. */
export function createNetzachFinletDefinition(overrides = {}) {
	return aquatic("finlet", "fin", "ray-membrane-fin", { length: 0.1, height: 0.07, rayCount: 3, sweep: 0.18, fork: 0, ...overrides });
}

/** Creates a long ribbon/continuous fin as a reusable membrane appendage. */
export function createNetzachRibbonFinDefinition(overrides = {}) {
	return aquatic("ribbon-fin", "fin", "ray-membrane-fin", { length: 0.72, height: 0.11, rayCount: 6, sweep: 0.08, fork: 0, ...overrides });
}

/** Creates a paired caudal fin family with symmetric or heterocercal lobe intent. */
export function createNetzachCaudalFinDefinition(variant = "forked", overrides = {}) {
	const profile = CAUDAL[variant] || CAUDAL.forked;
	return aquatic(`caudal.${variant}`, "caudal-fin", "caudal-fin", { ...profile, rayCount: 6, ...overrides }, { variant });
}

/** Creates an angler-style lure stalk independently from the fish head that may carry it. */
export function createNetzachAnglerLureDefinition(overrides = {}) {
	return aquatic("angler-lure", "lure", "lure-stalk", { length: 0.3, radius: 0.012, curve: 0.2, tipScale: 1.7, joints: 5, ...overrides });
}

/** Creates an aquatic tentacle without owning the generic tentacle geometry family. */
export function createNetzachAquaticTentacleDefinition(variant = "cephalopod", overrides = {}) {
	return aquatic(`tentacle.${variant}`, "tentacle", "tentacle-loft", { length: 0.58, radius: 0.038, taper: 0.86, curl: 0.3, undulation: 0.24, droop: 0.12, joints: 10, ...overrides }, { variant });
}

/** Creates a short sensory cirrus through the same continuous tentacle law. */
export function createNetzachCirrusDefinition(overrides = {}) {
	return aquatic("cirrus", "cirrus", "tentacle-loft", { length: 0.16, radius: 0.012, taper: 0.9, curl: 0.18, undulation: 0.14, droop: 0.08, joints: 5, ...overrides });
}

/** Creates a stand-alone sucker field suitable for tentacle, hand, foot, wall, or fantasy attachment. */
export function createNetzachSuckerFieldDefinition(overrides = {}) {
	return aquatic("sucker-field", "sucker-field", "sucker-cup-array", { count: 12, rows: 2, radius: 0.012, depth: 0.008, spacing: 0.035, ...overrides });
}

/** Creates one compact aquatic definition while preserving target-independent semantics. */
function aquatic(id, category, geometryRecipe, parameters, metadata = {}) {
	return createBiologicalDefinition({
		id: `biology.aquatic.${id}`,
		category,
		geometryRecipe,
		parameters,
		materialRegions: [`aquatic.${category}.surface`],
		animationControls: ["flow-response", "secondary-motion"],
		metadata: { ...metadata, independentlyAttachable: true }
	});
}
