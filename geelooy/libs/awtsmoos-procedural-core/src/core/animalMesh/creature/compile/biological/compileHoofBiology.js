// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileHoofBiology.js
 * @description Compiles a cloven ruminant hoof as paired keratin claws with optional rear dewclaws.
 * RESPONSIBILITY: translate hoof width, length, height, cleft, toe spread, and dewclaw count into renderer-neutral local geometry.
 * NON-RESPONSIBILITY: this file does not own leg anatomy, gait, contact physics, horned species presets, or hoof materials.
 * The Awtsmoos gives Gevurah a divided hoof whose two claws still carry one support;
 * Awtsmoos.com lets that measured endpoint serve cow, deer, ram, chimera, or stranger form without stealing another creature's root.
 */

import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

/**
 * Compiles one paired cloven hoof plus bounded dewclaws.
 * @param {object} part Briah hoof part carrying cloven-hoof morphology.
 * @param {object} resolved Resolved Yesod anchor and transported frame.
 * @returns {object} Smooth transformed hoof geometry.
 */
export function compileHoofBiology(part, resolved) {
	const parameters = part.parameters || {};
	const width = positive(parameters.width, 0.2);
	const length = positive(parameters.length, 0.26);
	const height = positive(parameters.height, 0.14);
	const cleft = clamp(parameters.cleft, 0, 0.8, 0.08);
	const spread = clamp(parameters.toeSpread, 0, 0.6, 0.12);
	const dewclaws = Math.max(0, Math.min(2, Math.round(finite(parameters.dewclaws, 2))));
	const parts = [
		createMainClaw("left-claw", -1, width, length, height, cleft, spread),
		createMainClaw("right-claw", 1, width, length, height, cleft, spread),
		...createDewclaws(dewclaws, width, length, height)
	];
	return transformBiologicalGeometry(
		joinMeshParts(parts),
		resolved,
		part
	);
}

/** Creates one elongated main hoof claw at its local lateral offset. */
function createMainClaw(id, side, width, length, height, cleft, spread) {
	const clawWidth = width * (0.46 - cleft * 0.08);
	const x = side * width * (0.24 + cleft * 0.18 + spread * 0.08);
	return {
		id,
		...ellipsoid(
			[x, length * 0.08, 0],
			[clawWidth * 0.5, length * 0.5, height * 0.5]
		)
	};
}

/** Creates zero, one, or two small rear dewclaw volumes. */
function createDewclaws(count, width, length, height) {
	return Array.from({ length: count }, (_, index) => {
		const side = count === 1 ? 0 : index === 0 ? -1 : 1;
		return {
			id: `dewclaw-${index + 1}`,
			...ellipsoid(
				[side * width * 0.34, -length * 0.38, height * 0.16],
				[width * 0.1, length * 0.12, height * 0.14]
			)
		};
	});
}

/** Builds one smooth ellipsoid hoof volume. */
function ellipsoid(center, radii) {
	return buildEllipsoidFromCommand({
		args: {
			center,
			radii,
			vertical_segments: 10,
			radial_segments: 14
		}
	});
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a finite value or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Clamps a finite value into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	return Math.max(minimum, Math.min(maximum, finite(value, fallback)));
}
