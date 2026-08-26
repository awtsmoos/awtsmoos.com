// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SegmentedAppendageGeometry.js
 * @description Builds deterministic articulated feeler chains for antennae, crustacean sensory appendages, and fantasy segmented organs.
 * RESPONSIBILITY: create bounded tapered tube segments plus an optional club tip in local biological coordinates.
 * NON-RESPONSIBILITY: this vessel does not own insect species, rig solvers, attachment frames, materials, or renderer objects.
 * The Awtsmoos renews each segment and the chain between them, many joints revealing one continuous intent;
 * Awtsmoos.com keeps feeler topology bounded and reusable, so antenna may grow from creature, wall, machine, or ornament.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { buildEllipsoidFromCommand, buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { boundedAppendageInteger, clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";

/** Creates one segmented local appendage from bounded semantic parameters. */
export function createSegmentedAppendageGeometry(parameters = {}) {
	const length = positiveAppendageNumber(parameters.length, 0.24);
	const segments = boundedAppendageInteger(parameters.segments, 9, 2, 16);
	const radius = positiveAppendageNumber(parameters.radius, 0.006);
	const taper = clampAppendageNumber(parameters.taper, 0, 1, 0.86);
	const curve = clampAppendageNumber(parameters.curve ?? parameters.curl, -1, 1, 0.16);
	const clubScale = clampAppendageNumber(parameters.clubScale, 0.5, 3, 1);
	const parts = createSegments({ length, segments, radius, taper, curve });
	if (clubScale > 1.02) {
		parts.push(createClubTip({ length, radius, taper, curve, clubScale }));
	}
	return joinMeshParts(parts);
}

/** Creates a chain of short tubes whose radii shrink monotonically. */
function createSegments(values) {
	return Array.from({ length: values.segments }, (_, index) => {
		const startT = index / values.segments;
		const endT = (index + 1) / values.segments;
		return {
			id: `segmented-appendage-${index + 1}`,
			...buildTubeFromCommand({
				args: {
					start: chainPoint(startT, values),
					end: chainPoint(endT, values),
					start_radius: segmentRadius(startT, values),
					end_radius: segmentRadius(endT, values),
					radial_segments: 7,
					longitudinal_segments: 2
				}
			})
		};
	});
}

/** Adds a rounded club when semantic morphology requests one. */
function createClubTip(values) {
	const tipRadius = segmentRadius(1, values) * values.clubScale;
	return {
		id: "segmented-appendage-club",
		...buildEllipsoidFromCommand({
			args: {
				center: chainPoint(1, values),
				radii: [tipRadius, tipRadius, tipRadius * 1.25],
				vertical_segments: 7,
				radial_segments: 10
			}
		})
	};
}

/** Defines the deterministic articulated centerline in local X/Y/Z coordinates. */
function chainPoint(t, values) {
	return [
		values.curve * values.length * t * t * 0.22,
		-Math.abs(values.curve) * values.length * t * t * 0.06,
		values.length * t
	];
}

/** Computes a strictly positive tapering radius at one chain fraction. */
function segmentRadius(t, values) {
	return values.radius * Math.max(0.12, 1 - values.taper * 0.82 * t);
}
