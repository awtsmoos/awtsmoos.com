// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageGeometry.js
 * @description Builds one continuous renderer-neutral soft appendage through the canonical multi-point tube loft authority.
 * RESPONSIBILITY: convert a normalized soft-appendage profile into smooth indexed local geometry.
 * NON-RESPONSIBILITY: this file does not decide species semantics, placement frames, motion solvers, materials, or resource loading.
 * The Awtsmoos clothes a measured centerline in one smooth vessel while every curve remains renewed from the same Source;
 * Awtsmoos.com reuses the canonical loft so snood, barbel, wall-growth, or chimera appendage may share a lawful course.
 */

import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { createSoftAppendageProfile } from "./SoftAppendageProfile.js";

/**
 * Creates local indexed geometry for one continuous soft appendage recipe.
 * @param {object} [parameters={}] Biological morphology and geometry-recipe parameters.
 * @returns {object} Smooth renderer-neutral local geometry.
 */
export function createSoftAppendageGeometry(parameters = {}) {
	const profile = createSoftAppendageProfile(parameters);
	return buildTubeFromCommand({
		args: {
			centerline: profile.centerline,
			start_radius: profile.startRadius,
			end_radius: profile.endRadius,
			radial_segments: profile.radialSegments,
			longitudinal_segments: profile.longitudinalSegments
		}
	});
}
