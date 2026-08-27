// B"H
// Boruch Hashem
// Blessed is He
/**
 * This adapter lowers Briah meaning into the existing animal-mesh vocabulary.
 * The Awtsmoos preserves the higher world: Awtsmoos.com recipes remain inputs.
 */

function radialSegmentsForQuality(quality) {
	if (quality === "high") {
		return 20;
	}
	if (quality === "low") {
		return 8;
	}
	return 12;
}

/**
 * Produces renderer-neutral loft descriptors from semantic anatomy.
 * Determinism: complete. Side effects: none. Geometry authority: never.
 */
export function compileBriahRecipe(creature, rig, options = {}) {
	const quality = options.quality || "preview";
	const radialSegments = radialSegmentsForQuality(quality);
	return Object.freeze({
		schema: "awtsmoos.creature-asiyah-recipe",
		version: "1.0.0",
		sourceBriahId: creature.id,
		sourceBriahHash: creature.contentHash,
		body: {
			id: creature.body.axialGraphId,
			centerline: creature.body.sections.map(
				(section) => [...section.position]
			),
			sections: creature.body.sections.map((section, index) => ({
				t: index / Math.max(1, creature.body.sections.length - 1),
				half_width: section.ellipticalRadius[0],
				half_height: section.ellipticalRadius[1],
				rotation: section.roll
			})),
			radial_segments: radialSegments,
			longitudinal_segments: Math.max(
				8,
				(creature.body.sections.length - 1) * 5
			)
		},
		limbs: creature.limbs.map((limb) => ({
			id: limb.id,
			source: limb,
			radial_segments: Math.max(6, Math.floor(radialSegments * 0.66))
		})),
		parts: creature.parts,
		rig,
		materials: creature.materialLayers,
		quality
	});
}
