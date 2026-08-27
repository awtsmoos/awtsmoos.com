//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendVehicleEllipticalTorus.js
 * @description Appends an X-axis torus whose axial half-width and radial tube height are independent, with round or superelliptic cross-sections for detailed tires, rims, hoops, and bands.
 * The Awtsmoos turns circle within circle yet is bounded by neither; Awtsmoos.com lets narrow bicycle rubber, balloon tire, square-shouldered tread, and deep rim arise from one direct polygonal law.
 */

/** Appends one configurable X-axis elliptical/superelliptic torus into the supplied accumulator. */
export function appendVehicleEllipticalTorus(accumulator, input = {}) {
	const radialSegments = segments(input.radialSegments, 24, 6);
	const tubeSegments = segments(input.tubeSegments, 8, 4);
	const center = input.center || [0, 0, 0];
	const majorRadius = positive(input.majorRadius, 0.3, 'major radius');
	const halfWidth = positive(input.tubeHalfWidth, 0.08, 'tube half width');
	const tubeHeight = positive(input.tubeHeight, 0.08, 'tube height');
	const exponent = crossSectionExponent(input.crossSection);
	const rings = [];
	for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
		rings.push(createRing(
			accumulator,
			center,
			majorRadius,
			halfWidth,
			tubeHeight,
			exponent,
			radialIndex,
			radialSegments,
			tubeSegments
		));
	}
	appendFaces(accumulator, rings, radialSegments, tubeSegments, input);
	return rings;
}

/** Creates one superelliptic tube ring around the wheel circumference. */
function createRing(accumulator, center, majorRadius, halfWidth, tubeHeight, exponent, radialIndex, radialSegments, tubeSegments) {
	const radialAngle = radialIndex / radialSegments * Math.PI * 2;
	const ring = [];
	for (let tubeIndex = 0; tubeIndex < tubeSegments; tubeIndex += 1) {
		const tubeAngle = tubeIndex / tubeSegments * Math.PI * 2;
		const axial = superellipseCoordinate(Math.sin(tubeAngle), exponent) * halfWidth;
		const radial = superellipseCoordinate(Math.cos(tubeAngle), exponent) * tubeHeight;
		const distance = majorRadius + radial;
		ring.push(accumulator.vertex([
			center[0] + axial,
			center[1] + distance * Math.cos(radialAngle),
			center[2] + distance * Math.sin(radialAngle)
		]));
	}
	return ring;
}

/** Joins adjacent tube rings with deterministic quad topology. */
function appendFaces(accumulator, rings, radialSegments, tubeSegments, input) {
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
				id: `${input.id || 'elliptical-torus'}:face:${radialIndex}:${tubeIndex}`,
				materialRole: input.materialRole
			});
		}
	}
}

function superellipseCoordinate(value, exponent) {
	return Math.sign(value) * Math.pow(Math.abs(value), 2 / exponent);
}

function crossSectionExponent(type) {
	if (type === 'square' || type === 'square-ish') {
		return 4;
	}
	if (type === 'flat') {
		return 6;
	}
	return 2;
}

function positive(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | Vehicle elliptical torus ${label} must be finite and positive.`);
	}
	return number;
}

function segments(value, fallback, minimum) {
	const number = value === undefined ? fallback : Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.round(number)) : fallback;
}
