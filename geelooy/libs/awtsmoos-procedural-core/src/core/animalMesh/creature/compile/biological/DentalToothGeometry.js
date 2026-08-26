// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DentalToothGeometry.js
 * @description Owns tooth crown/root shapes and deterministic dental-arch repetition without owning gums or palate.
 * The Awtsmoos gives each tooth a root hidden beneath the crown's revealed light;
 * Awtsmoos.com lets many teeth become one ordered arch while every small vessel keeps its measured bite.
 */

import { buildEllipticalLoft } from "../../../geometry/ellipticalLoft.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds one tapered crown/root tooth along local outward +Z.
 * @param {object} parameters Tooth length and width intent.
 * @returns {object} Renderer-neutral tooth geometry.
 */
export function createSingleToothGeometry(parameters = {}) {
	const length = positive(parameters.length, 0.026);
	const width = positive(parameters.width, 0.01);
	return buildEllipticalLoft({
		centerline: [
			[0, 0, -length * 0.34],
			[0, 0, length * 0.26],
			[0, 0, length]
		],
		sections: [
			section(0, width * 0.34, width * 0.28),
			section(0.4, width * 0.62, width * 0.5),
			section(1, width * 0.18, width * 0.14)
		],
		radial_segments: 8,
		longitudinal_segments: 6
	}, {
		cap_start: true,
		cap_end: true
	});
}

/**
 * Builds a bounded dental arch by repeating tooth geometry across a shallow curve.
 * @param {object} parameters Arch count, width, and curvature intent.
 * @returns {object} Joined renderer-neutral dentition geometry.
 */
export function createDentitionGeometry(parameters = {}) {
	const count = Math.max(4, Math.min(14, Math.round(finite(parameters.count, 10))));
	const width = positive(parameters.width, 0.28);
	const curvature = finite(parameters.archCurvature, 0.46);
	const parts = Array.from({ length: count }, (_, index) => {
		const amount = count === 1 ? 0.5 : index / (count - 1);
		const centered = amount - 0.5;
		const tooth = createSingleToothGeometry({
			length: 0.018 + Math.abs(centered) * 0.004,
			width: 0.0085
		});
		return {
			id: `tooth-${index + 1}`,
			...offsetGeometry(
				tooth,
				[centered * width, curvature * width * centered * centered, 0]
			)
		};
	});
	return joinMeshParts(parts);
}

/** Creates one tooth loft section record. */
function section(amount, width, height) {
	return {
		t: amount,
		half_width: width,
		half_height: height,
		rotation: 0
	};
}

/** Offsets one geometry without changing topology or normals. */
function offsetGeometry(geometry, offset) {
	const positions = [...geometry.positions];
	for (let index = 0; index < positions.length; index += 3) {
		positions[index] += offset[0];
		positions[index + 1] += offset[1];
		positions[index + 2] += offset[2];
	}
	return {
		...geometry,
		positions
	};
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a finite number or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
