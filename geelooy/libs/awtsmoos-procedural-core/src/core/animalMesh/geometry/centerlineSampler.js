// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	distanceBetween,
	lerpNumber,
	lerpVector
} from "./vectorMath.js";

function buildLengths(points) {
	const lengths = [
		0
	];
	for (let index = 1; index < points.length; index += 1) {
		lengths.push(
			lengths[index - 1] + distanceBetween(points[index - 1], points[index])
		);
	}
	return lengths;
}

export function sampleCenterline(points, amount) {
	if (!Array.isArray(points) || points.length < 2) {
		throw new Error('B"H | Centerline requires at least two points.');
	}
	const clamped = Math.max(0, Math.min(1, amount));
	const lengths = buildLengths(points);
	const totalLength = lengths[lengths.length - 1];
	const targetLength = totalLength * clamped;

	for (let index = 1; index < lengths.length; index += 1) {
		if (targetLength <= lengths[index]) {
			const span = lengths[index] - lengths[index - 1];
			const localAmount = span > 0
				? (targetLength - lengths[index - 1]) / span
				: 0;
			return lerpVector(points[index - 1], points[index], localAmount);
		}
	}
	return [
		...points[points.length - 1]
	];
}

export function sampleSection(sections, amount) {
	const ordered = [
		...sections
	].sort((left, right) => left.t - right.t);
	if (amount <= ordered[0].t) {
		return {
			...ordered[0]
		};
	}
	for (let index = 1; index < ordered.length; index += 1) {
		const right = ordered[index];
		if (amount <= right.t) {
			const left = ordered[index - 1];
			const span = right.t - left.t;
			const localAmount = span > 0 ? (amount - left.t) / span : 0;
			return {
				t: amount,
				half_width: lerpNumber(left.half_width, right.half_width, localAmount),
				half_height: lerpNumber(left.half_height, right.half_height, localAmount),
				rotation: lerpNumber(left.rotation || 0, right.rotation || 0, localAmount)
			};
		}
	}
	return {
		...ordered[ordered.length - 1]
	};
}
