// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ScalePatchGeometry.js
 * @description Builds bounded staggered patches of overlapping fish, reptile, scute, or fantasy scales.
 * RESPONSIBILITY: derive deterministic local scale positions and flattened volumes from size, density, aspect, and overlap.
 * NON-RESPONSIBILITY: this file does not own belly plates, geodesic whole-body sampling, materials, or Yesod frame transport.
 * The Awtsmoos lets countless small plates clothe one local field while no scale loses its measured sign;
 * Awtsmoos.com arranges each row with order and variation so living surfaces may shimmer by one reusable design.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds a bounded staggered field of overlapping flattened scale volumes.
 * @param {object} parameters Scale size, density, aspect, and overlap controls.
 * @returns {object} Joined renderer-neutral scale-patch geometry.
 */
export function createScalePatchGeometry(parameters = {}) {
	const size = positive(parameters.scaleSize, 0.028);
	const density = clamp(parameters.density, 0.15, 2, 1);
	const aspect = positive(parameters.aspect, 1.05);
	const overlap = clamp(parameters.overlap, 0, 0.8, 0.3);
	const columns = Math.max(
		2,
		Math.min(5, Math.round(2 + density * 1.6))
	);
	const rows = Math.max(
		2,
		Math.min(4, Math.round(2 + density))
	);
	const spacingX = size * aspect * (1 - overlap * 0.48);
	const spacingY = size * (1 - overlap * 0.36);
	const parts = [];
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < columns; column += 1) {
			parts.push(createScalePart({
				row,
				column,
				columns,
				rows,
				size,
				aspect,
				spacingX,
				spacingY
			}));
		}
	}
	return joinMeshParts(parts);
}

/** Creates one deterministic scale tile within a staggered local patch. */
function createScalePart(options) {
	const stagger = options.row % 2 === 0
		? 0
		: options.spacingX * 0.5;
	const x = (options.column - (options.columns - 1) / 2) * options.spacingX + stagger;
	const y = (options.row - (options.rows - 1) / 2) * options.spacingY;
	return {
		id: `scale-${options.row + 1}-${options.column + 1}`,
		...buildEllipsoidFromCommand({
			args: {
				center: [x, y, options.size * 0.1],
				radii: [
					options.size * options.aspect * 0.5,
					options.size * 0.5,
					options.size * 0.12
				],
				vertical_segments: 7,
				radial_segments: 10
			}
		})
	};
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: fallback;
}

/** Clamps a finite value into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	const finite = Number.isFinite(number)
		? number
		: fallback;
	return Math.max(minimum, Math.min(maximum, finite));
}
