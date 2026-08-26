// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ContinuousFleshAssembler.js
 * @description Coordinates anatomical primitives, implicit union, surface extraction, welding, and semantic mesh wrapping.
 * RESPONSIBILITY: create one continuous body-and-limb flesh mesh while preserving every region needed by semantic skinning.
 * NON-RESPONSIBILITY: this vessel does not compile discrete eyes, horns, beaks, teeth, feathers, materials, or animation clips.
 * The Awtsmoos reveals one body where many limbs once appeared as separate shells;
 * Awtsmoos.com gathers their measured lineage into continuous flesh while each bone still moves through its own living wells.
 */

import { createCreatureMeshPart } from "../createMeshPart.js";
import { createFleshImplicitField } from "./FleshImplicitField.js";
import { createFleshPrimitives } from "./FleshPrimitiveBuilder.js";
import { extractFleshSurface } from "./MarchingTetrahedra.js";
import { weldMeshTopology } from "./MeshTopologyWeld.js";

/**
 * Compiles body and every semantic limb into one renderer-neutral continuous flesh mesh.
 * @param {object} creature Authoritative Briah creature.
 * @param {object} recipe Current Asiyah compile recipe.
 * @param {object} options Flesh resolution, blend, and weld controls.
 * @returns {object} One creature mesh part spanning body and limbs.
 */
export function compileContinuousFlesh(creature, recipe, options = {}) {
	const primitives = createFleshPrimitives(creature, recipe);
	const characteristicRadius = averageRadius(primitives);
	const field = createFleshImplicitField(primitives, {
		blendRadius: positive(
			options.fleshBlendRadius,
			characteristicRadius * 0.34
		),
		padding: positive(
			options.fleshBoundsPadding,
			characteristicRadius * 0.7
		)
	});
	const triangleSoup = extractFleshSurface(field, {
		resolution: positive(
			options.fleshResolution,
			resolutionForQuality(recipe.quality)
		)
	});
	const geometry = weldMeshTopology(triangleSoup, {
		tolerance: positive(
			options.fleshWeldTolerance,
			characteristicRadius * 0.001
		)
	});
	if (!geometry.indices.length) {
		throw new Error('B"H | Continuous flesh extraction produced no surface triangles.');
	}
	return createCreatureMeshPart(
		"body.flesh",
		geometry,
		semanticRegions(primitives)
	);
}

/** Collects unique semantic lineage across every body and limb primitive. */
function semanticRegions(primitives) {
	const regions = new Set(["body.base", "body.flesh"]);
	for (const primitive of primitives) {
		for (const region of primitive.semanticRegionIds || []) {
			regions.add(region);
		}
	}
	return [...regions];
}

/** Computes a scale-aware average primitive radius for stable defaults. */
function averageRadius(primitives) {
	const total = primitives.reduce((sum, primitive) => {
		return sum + primitive.radiusStart + primitive.radiusEnd;
	}, 0);
	return Math.max(0.005, total / Math.max(1, primitives.length * 2));
}

/** Maps compile quality to bounded longest-axis field resolution. */
function resolutionForQuality(quality) {
	if (quality === "high") {
		return 34;
	}
	if (quality === "low" || quality === "fast") {
		return 18;
	}
	return 26;
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
