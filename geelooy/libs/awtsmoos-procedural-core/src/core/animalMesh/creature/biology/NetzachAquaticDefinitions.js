// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAquaticDefinitions.js
 * @description Defines fins, gills, flukes, and aquatic sensory structures as reusable parts rather than fish-owned organs.
 * The Awtsmoos lets Netzach move through water, air, beast, or stone;
 * Awtsmoos.com lets fin and gill keep their living law wherever a new body is grown.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const FIN_VARIANTS = Object.freeze({
	dorsal: Object.freeze({ length: 0.42, height: 0.26, rayCount: 11, sweep: 0.18, fork: 0 }),
	pectoral: Object.freeze({ length: 0.38, height: 0.22, rayCount: 9, sweep: 0.34, fork: 0 }),
	pelvic: Object.freeze({ length: 0.24, height: 0.16, rayCount: 7, sweep: 0.26, fork: 0 }),
	anal: Object.freeze({ length: 0.3, height: 0.18, rayCount: 8, sweep: 0.2, fork: 0 }),
	adipose: Object.freeze({ length: 0.15, height: 0.1, rayCount: 0, sweep: 0.08, fork: 0 }),
	caudal: Object.freeze({ length: 0.36, height: 0.48, rayCount: 16, sweep: 0.12, fork: 0.52 })
});

/** Creates a fin usable on fish or any arbitrary biological/non-biological target. */
export function createNetzachFinDefinition(variant = "dorsal", overrides = {}) {
	const profile = FIN_VARIANTS[variant] || FIN_VARIANTS.dorsal;
	return createBiologicalDefinition({
		id: `biology.fin.${variant}`,
		category: "fin",
		geometryRecipe: "ray-membrane-fin",
		parameters: {
			...profile,
			membraneThickness: 0.008,
			flex: 0.42,
			rayTaper: 0.86,
			flowAlignment: 1,
			...overrides
		},
		materialRegions: ["fin.ray", "fin.membrane", "fin.edge"],
		animationControls: ["fold", "fan", "flex", "flow-response"],
		capabilities: { swimming: true, stabilization: variant !== "caudal", propulsion: variant === "caudal" },
		rigContribution: { type: "fin-control", flexible: true },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates covered, slit, or external-frond respiratory gill structures. */
export function createNetzachGillDefinition(variant = "operculum", overrides = {}) {
	const external = variant === "external-frond";
	return createBiologicalDefinition({
		id: `biology.gill.${variant}`,
		category: "gill",
		geometryRecipe: external ? "branching-gill-fronds" : "layered-gill-slit",
		parameters: {
			count: variant === "shark-slits" ? 5 : external ? 6 : 1,
			length: external ? 0.24 : 0.18,
			opening: 0.12,
			frondDensity: external ? 0.72 : 0,
			...overrides
		},
		materialRegions: ["gill.outer", "gill.inner", "gill.frond"],
		animationControls: ["respiration-open", "respiration-close", "flow-response"],
		capabilities: { respiration: "aquatic" },
		rigContribution: { type: external ? "soft-branch" : "surface-flap" },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates horizontal aquatic-mammal flukes without requiring a fish body. */
export function createNetzachFlukeDefinition(variant = "whale", overrides = {}) {
	return createBiologicalDefinition({
		id: `biology.fluke.${variant}`,
		category: "fluke",
		geometryRecipe: "bilateral-fluke",
		parameters: { span: 0.62, chord: 0.24, notch: 0.18, taper: 0.7, flex: 0.3, ...overrides },
		materialRegions: ["fluke.surface", "fluke.edge"],
		animationControls: ["pitch", "flex"],
		capabilities: { swimming: true, propulsion: true },
		rigContribution: { type: "paired-fluke-control" },
		metadata: { variant, independentlyAttachable: true }
	});
}

/** Creates a lateral-line-like sensory field independent of fish archetypes. */
export function createNetzachLateralLineDefinition(overrides = {}) {
	return createBiologicalDefinition({
		id: "biology.sensory.lateral-line",
		category: "sensory-field",
		geometryRecipe: "surface-line-field",
		parameters: { length: 0.72, poreCount: 28, depth: 0.004, waviness: 0.05, ...overrides },
		materialRegions: ["sensory.lateral-line"],
		capabilities: { waterMotionSense: true },
		metadata: { independentlyAttachable: true }
	});
}
