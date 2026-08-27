// B"H
// Boruch Hashem
// Blessed is He
/**
 * Along a curving spine the Awtsmoos carries orientation without sudden
 * inversion. This Awtsmoos.com vessel transports one frame into the next in
 * linear time, with no renderer state and no random side effects.
 */

import { sampleCenterline } from "./centerlineSampler.js";
import {
	addVector,
	crossVector,
	dotVector,
	normalizeVector,
	scaleVector,
	subtractVector,
	vectorLength
} from "./vectorMath.js";

function tangentAt(centerline, amount) {
	const delta = 0.001;
	const before = sampleCenterline(centerline, Math.max(0, amount - delta));
	const after = sampleCenterline(centerline, Math.min(1, amount + delta));
	return normalizeVector(subtractVector(after, before), [0, 1, 0]);
}

function initialRight(tangent) {
	const reference = Math.abs(tangent[2]) > 0.92 ? [1, 0, 0] : [0, 0, 1];
	return normalizeVector(crossVector(tangent, reference), [1, 0, 0]);
}

function transportRight(previousRight, tangent) {
	const projected = subtractVector(
		previousRight,
		scaleVector(tangent, dotVector(previousRight, tangent))
	);
	return vectorLength(projected) > 1e-8
		? normalizeVector(projected)
		: initialRight(tangent);
}

function rotateFrame(right, up, rotationDegrees) {
	const radians = rotationDegrees * Math.PI / 180;
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);
	return {
		right: addVector(scaleVector(right, cosine), scaleVector(up, sine)),
		up: addVector(scaleVector(up, cosine), scaleVector(right, -sine))
	};
}

export function createParallelTransportFrames(centerline, amounts, rotations = []) {
	if (!Array.isArray(amounts) || amounts.length === 0) {
		throw new Error('B"H | Parallel transport requires at least one sample amount.');
	}
	let carriedRight = null;
	return amounts.map((amount, index) => {
		const center = sampleCenterline(centerline, amount);
		const tangent = tangentAt(centerline, amount);
		carriedRight = carriedRight
			? transportRight(carriedRight, tangent)
			: initialRight(tangent);
		const carriedUp = normalizeVector(crossVector(carriedRight, tangent), [0, 0, 1]);
		const rotated = rotateFrame(carriedRight, carriedUp, rotations[index] || 0);
		return { center, tangent, right: rotated.right, up: rotated.up };
	});
}

export function createParallelTransportFrame(centerline, amount, rotationDegrees = 0) {
	const sampleCount = Math.max(2, Math.ceil(Math.max(0, Math.min(1, amount)) * 32));
	const amounts = Array.from({ length: sampleCount }, (_, index) => (
		amount * index / (sampleCount - 1)
	));
	const rotations = amounts.map((_, index) => rotationDegrees * index / (sampleCount - 1));
	return createParallelTransportFrames(centerline, amounts, rotations).at(-1);
}
