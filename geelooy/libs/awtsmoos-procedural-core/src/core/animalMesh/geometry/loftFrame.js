// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	sampleCenterline
} from "./centerlineSampler.js";
import {
	addVector,
	crossVector,
	normalizeVector,
	scaleVector,
	subtractVector
} from "./vectorMath.js";

export function createLoftFrame(centerline, amount, rotationDegrees = 0) {
	const delta = 0.001;
	const before = sampleCenterline(centerline, Math.max(0, amount - delta));
	const after = sampleCenterline(centerline, Math.min(1, amount + delta));
	const tangent = normalizeVector(subtractVector(after, before), [
		0,
		1,
		0
	]);
	const reference = Math.abs(tangent[2]) > 0.92
		? [
			1,
			0,
			0
		]
		: [
			0,
			0,
			1
		];
	const right = normalizeVector(crossVector(tangent, reference));
	const up = normalizeVector(crossVector(right, tangent));
	const radians = rotationDegrees * Math.PI / 180;
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);

	return {
		right: addVector(
			scaleVector(right, cosine),
			scaleVector(up, sine)
		),
		up: addVector(
			scaleVector(up, cosine),
			scaleVector(right, -sine)
		)
	};
}
