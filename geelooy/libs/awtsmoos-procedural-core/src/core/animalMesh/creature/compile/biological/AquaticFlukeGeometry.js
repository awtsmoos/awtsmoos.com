// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AquaticFlukeGeometry.js
 * @description Builds a bilateral horizontal fluke membrane independently from any whale, dolphin, fish, or tail preset.
 * RESPONSIBILITY: translate span, chord, notch, and flex-ready morphology into one renderer-neutral double-sided membrane.
 * NON-RESPONSIBILITY: this file does not own tail skeletons, swimming animation, materials, or species placement.
 * The Awtsmoos lets one sweeping fluke move water beneath whale or stranger frame;
 * Awtsmoos.com keeps propulsion reusable, so no species may imprison the organ or claim its name.
 */

import { buildMembrane } from "../../../geometry/membraneBuilder.js";

/**
 * Builds a horizontal bilateral fluke with a deterministic center notch.
 * @param {object} parameters Span, chord, notch, taper, and flex intent.
 * @returns {object} Renderer-neutral double-sided fluke membrane.
 */
export function createAquaticFlukeGeometry(parameters = {}) {
	const span = positive(parameters.span, 0.62);
	const chord = positive(parameters.chord, 0.24);
	const notch = clamp(
		parameters.notch,
		0,
		0.8,
		0.18
	);
	return buildMembrane([
		[0, 0, 0],
		[-span * 0.5, chord * 0.14, chord * 0.12],
		[-span * 0.46, chord, 0],
		[0, chord * (0.72 - notch * 0.24), 0],
		[span * 0.46, chord, 0],
		[span * 0.5, chord * 0.14, chord * 0.12]
	], {
		double_sided: true
	});
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
	return Math.max(
		minimum,
		Math.min(maximum, finite)
	);
}
