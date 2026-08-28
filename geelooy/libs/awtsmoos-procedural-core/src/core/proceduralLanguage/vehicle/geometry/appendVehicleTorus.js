//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendVehicleTorus.js
 * @description Appends an X-axis torus directly into one vehicle mesh for tires, rims, wheel hoops, decorative rings, and historical iron bands.
 * The Awtsmoos turns circumference upon circumference while Awtsmoos.com keeps the ring editable, deterministic, and aligned with the universal +X wheel-spin covenant.
 */

/** Appends one torus centered at `center`, whose circular wheel plane lies in YZ and whose spin axis is +X. */
export function appendVehicleTorus(accumulator, input = {}) {
	const center = input.center || [0, 0, 0];
	const majorRadius = positiveNumber(
		input.majorRadius,
		0.3,
		'major radius'
	);
	const tubeRadius = positiveNumber(
		input.tubeRadius,
		0.08,
		'tube radius'
	);
	const radialSegments = normalizeSegments(
		input.radialSegments,
		24,
		6
	);
	const tubeSegments = normalizeSegments(
		input.tubeSegments,
		8,
		4
	);
	const rings = [];
	for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
		rings.push(appendTorusRing(
			accumulator,
			center,
			majorRadius,
			tubeRadius,
			radialIndex,
			radialSegments,
			tubeSegments
		));
	}
	appendTorusFaces(
		accumulator,
		rings,
		radialSegments,
		tubeSegments,
		input
	);
	return rings;
}

/** Creates one circular tube ring around the wheel's YZ centerline. */
function appendTorusRing(accumulator, center, majorRadius, tubeRadius, radialIndex, radialSegments, tubeSegments) {
	const radialAngle = radialIndex / radialSegments * Math.PI * 2;
	const ring = [];
	for (let tubeIndex = 0; tubeIndex < tubeSegments; tubeIndex += 1) {
		const tubeAngle = tubeIndex / tubeSegments * Math.PI * 2;
		const distance = majorRadius + tubeRadius * Math.cos(tubeAngle);
		ring.push(accumulator.vertex([
			center[0] + tubeRadius * Math.sin(tubeAngle),
			center[1] + distance * Math.cos(radialAngle),
			center[2] + distance * Math.sin(radialAngle)
		]));
	}
	return ring;
}

/** Joins adjacent torus rings with deterministic quad faces. */
function appendTorusFaces(accumulator, rings, radialSegments, tubeSegments, input) {
	for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
		const nextRadial = (radialIndex + 1) % radialSegments;
		for (let tubeIndex = 0; tubeIndex < tubeSegments; tubeIndex += 1) {
			const nextTube = (tubeIndex + 1) % tubeSegments;
			accumulator.face([
				rings[radialIndex][tubeIndex],
				rings[nextRadial][tubeIndex],
				rings[nextRadial][nextTube],
				rings[radialIndex][nextTube]
			], {
				id: `${input.id || 'torus'}:face:${radialIndex}:${tubeIndex}`,
				materialRole: input.materialRole
			});
		}
	}
}

/** Returns one finite positive torus scalar. */
function positiveNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | Vehicle torus ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns a finite integer segment count at or above the requested minimum. */
function normalizeSegments(value, fallback, minimum) {
	const candidate = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(candidate)) {
		return fallback;
	}
	return Math.max(minimum, Math.round(candidate));
}
