// B"H
// Boruch Hashem
// Blessed is He
/**
 * Yesod is the faithful bond: an eye follows the brow and a foot follows its
 * chain even as geometry is renewed. This Awtsmoos.com resolver turns semantic
 * axial coordinates into twist-stable transported frames without storing faces.
 */
import { createParallelTransportFrames } from "../../geometry/parallelTransportFrames.js";
import { clampCreatureNumber, finiteCreatureNumber } from "../foundation/value.js";
function interpolate(left, right, amount) {
	return left.map((value, axis) => value + (right[axis] - value) * amount);
}
function scale(vector, amount) {
	return vector.map(value => value * amount);
}
function add(...vectors) {
	return vectors[0].map((_, axis) => vectors.reduce((sum, vector) => sum + vector[axis], 0));
}
/** Resolves a semantic axial anchor after deformation in O(section count). */
export function resolveAxialAttachmentFrame(axis, anchor = {}) {
	const amount = clampCreatureNumber(anchor.axialPosition, 0, 1);
	const sections = axis.sections;
	const scaled = amount * (sections.length - 1);
	const leftIndex = Math.min(sections.length - 2, Math.floor(scaled));
	const localAmount = scaled - leftIndex;
	const frames = createParallelTransportFrames(
		sections.map(section => section.position),
		[amount],
		[finiteCreatureNumber(anchor.roll, 0)]
	);
	const frame = frames[0];
	const radius = interpolate(
		sections[leftIndex].ellipticalRadius,
		sections[leftIndex + 1].ellipticalRadius,
		localAmount
	);
	const angle = finiteCreatureNumber(anchor.angularPosition, 0);
	const radial = finiteCreatureNumber(anchor.radialOffset, 1);
	return {
		position: add(
			frame.center,
			scale(frame.right, Math.cos(angle) * radius[0] * radial),
			scale(frame.up, Math.sin(angle) * radius[1] * radial)
		),
		tangent: [...frame.tangent],
		right: [...frame.right],
		up: [...frame.up],
		axialPosition: amount,
		angularPosition: angle
	};
}
