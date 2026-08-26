// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinSpikeGeometry.js
 * @description Builds one curved tapered hard appendage for spurs, stingers, quills, spines, and fantasy defensive points.
 * RESPONSIBILITY: deterministic curved shaft topology with bounded length, radius, curve, and taper.
 * NON-RESPONSIBILITY: this vessel does not claim horns, claws, teeth, venom simulation, materials, or species identity.
 * The Awtsmoos gives hardness a pointed vessel while the point itself owns no beast or place;
 * Awtsmoos.com lets spur, stinger, quill, or spine emerge from any semantic frame with the same reusable grace.
 */

import { buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";

/** Creates one local curved hard spike. */
export function createKeratinSpikeGeometry(parameters = {}) {
	const length = positiveAppendageNumber(parameters.length, 0.14);
	const radius = positiveAppendageNumber(parameters.radius, 0.016);
	const curve = clampAppendageNumber(parameters.curve, -1, 1, 0.1);
	const taper = clampAppendageNumber(parameters.taper, 0.5, 1, 0.97);
	const tipScale = Math.max(0.015, 1 - taper * 0.98);
	return buildTubeFromCommand({
		args: {
			centerline: [
				[0, 0, 0],
				[curve * length * 0.05, 0, length * 0.34],
				[curve * length * 0.16, -Math.abs(curve) * length * 0.025, length * 0.7],
				[curve * length * 0.28, -Math.abs(curve) * length * 0.08, length]
			],
			start_radius: radius,
			end_radius: radius * tipScale,
			radial_segments: 8,
			longitudinal_segments: 7
		}
	});
}
