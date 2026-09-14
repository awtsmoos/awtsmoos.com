//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeBiologyPrimitiveCatalog.js
 * @description Shared renderer-neutral low-poly geometry for flowers, buds, fruit, cones, and deadwood manifestations.
 * Reproductive organs now have morphology appropriate to their biological role while remaining one immutable mesh per type for cheap instancing.
 */

import { createTreeFlowerPrimitive } from "./treeFlowerPrimitive.js";
import { createTreeRadialPrimitive } from "./treeRadialPrimitive.js";

/** Creates the tapered dormant-bud primitive used by reproductive attachment instances. */
function createBud() {
	return createTreeRadialPrimitive({
		id: "tree.bud",
		materialRole: "tree.reproduction.bud",
		radialSegments: 7,
		profile: [
			[-0.45, 0.12],
			[-0.15, 0.42],
			[0.35, 0.5],
			[0.85, 0]
		]
	});
}

/** Creates a rounded fruit with narrower stem and blossom ends instead of an octahedral placeholder. */
function createFruit() {
	return createTreeRadialPrimitive({
		id: "tree.fruit",
		materialRole: "tree.reproduction.fruit",
		radialSegments: 10,
		profile: [
			[-0.95, 0.12],
			[-0.68, 0.62],
			[-0.08, 0.92],
			[0.52, 0.72],
			[0.86, 0.28],
			[1.02, 0]
		]
	});
}

/** Creates a conifer-style cone primitive for species-aware reproductive extensions. */
function createCone() {
	return createTreeRadialPrimitive({
		id: "tree.cone",
		materialRole: "tree.reproduction.cone",
		radialSegments: 8,
		profile: [
			[-0.8, 0.22],
			[-0.45, 0.62],
			[0.1, 0.72],
			[0.62, 0.42],
			[0.95, 0]
		]
	});
}

/** Creates a compact irregular deadwood marker that can be instanced at scars and broken tips. */
function createDeadwood() {
	return createTreeRadialPrimitive({
		id: "tree.deadwood",
		materialRole: "tree.deadwood",
		radialSegments: 6,
		profile: [
			[-0.18, 0.92],
			[0.14, 1],
			[0.32, 0.72]
		]
	});
}

const PRIMITIVES = Object.freeze({
	"tree.bud": createBud(),
	"tree.deadwood": createDeadwood(),
	"tree.flower": createTreeFlowerPrimitive(),
	"tree.fruit": createFruit(),
	"tree.cone": createCone()
});

/** Returns the immutable shared primitive catalog used by one or many generated trees. */
export function createTreeBiologyPrimitiveCatalog() {
	return PRIMITIVES;
}
