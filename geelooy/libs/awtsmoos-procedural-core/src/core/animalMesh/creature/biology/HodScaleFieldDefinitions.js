// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodScaleFieldDefinitions.js
 * @description Defines conforming scale fields that can cover fish, reptile, human, wall, horn, or any future surface.
 * The Awtsmoos lets Hod pattern one skin with countless measured signs;
 * Awtsmoos.com lets every scale follow curvature and flow without becoming trapped inside one species' lines.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const SCALE_VARIANTS = Object.freeze({
	cycloid: Object.freeze({ aspect: 1.05, overlap: 0.34, ridge: 0.04, keel: 0, edge: "smooth" }),
	ctenoid: Object.freeze({ aspect: 1.02, overlap: 0.32, ridge: 0.09, keel: 0.06, edge: "comb" }),
	ganoid: Object.freeze({ aspect: 1.18, overlap: 0.08, ridge: 0.16, keel: 0.1, edge: "hard" }),
	placoid: Object.freeze({ aspect: 0.72, overlap: 0.06, ridge: 0.36, keel: 0.42, edge: "denticle" }),
	snake: Object.freeze({ aspect: 1.32, overlap: 0.28, ridge: 0.12, keel: 0.18, edge: "rounded" }),
	scute: Object.freeze({ aspect: 1.55, overlap: 0.02, ridge: 0.32, keel: 0.22, edge: "plate" }),
	dragon: Object.freeze({ aspect: 1.24, overlap: 0.42, ridge: 0.44, keel: 0.38, edge: "pointed" })
});

/** Creates a deterministic surface-distribution definition for overlapping scales. */
export function createHodScaleFieldDefinition(variant = "cycloid", overrides = {}) {
	const profile = SCALE_VARIANTS[variant] || SCALE_VARIANTS.cycloid;
	return createBiologicalDefinition({
		id: `biology.scale-field.${variant}`,
		category: "scale-field",
		geometryRecipe: "conforming-surface-field",
		parameters: {
			...profile,
			scaleSize: 0.028,
			density: 1,
			flow: "surface-principal-direction",
			orientationNoise: 0.06,
			sizeVariation: 0.12,
			missingRatio: 0,
			damage: 0,
			growthGradient: 0.18,
			...overrides
		},
		materialRegions: ["scale.face", "scale.edge", "scale.gap"],
		animationControls: ["follow-surface", "flex-with-skin"],
		skinningContribution: { type: "inherit-underlying-surface" },
		metadata: {
			variant,
			independentlyAttachable: true,
			distribution: "surface-field",
			instanceFriendly: true
		}
	});
}

/** Creates a belly-plate field using large transverse plates. */
export function createHodBellyPlateDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.scale-field.belly-plates",
		category: "scale-field",
		geometryRecipe: "transverse-plate-field",
		parameters: {
			plateWidth: 0.18,
			plateLength: 0.05,
			overlap: 0.12,
			count: 22,
			flow: "axial",
			...overrides
		},
		materialRegions: ["scale.belly-plate", "scale.gap"],
		skinningContribution: { type: "inherit-underlying-surface" },
		metadata: { independentlyAttachable: true, distribution: "axial-array" }
	});
}

/** Creates a sparse armored scute field for crocodilian or fantasy use. */
export function createHodScuteFieldDefinition(overrides = {}) {
	return createHodScaleFieldDefinition("scute", {
		scaleSize: 0.065,
		density: 0.56,
		overlap: 0.02,
		orientationNoise: 0.12,
		...overrides
	});
}
