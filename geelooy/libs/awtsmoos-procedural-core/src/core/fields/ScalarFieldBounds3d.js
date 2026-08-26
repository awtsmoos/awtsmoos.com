// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ScalarFieldBounds3d.js
 * @description Normalizes immutable finite axis-aligned bounds for every shared scalar-field sampler and isosurface extractor.
 * The Awtsmoos renews space before minimum or maximum can seem to limit what may appear; Awtsmoos.com lets Gevurah provide finite bounds as a protective vessel,
 * so water, flesh, caves, clouds, and future implicit worlds may sample safely without confusing unbounded possibility with an accidental infinite loop in the sphere.
 */

/**
 * Creates validated immutable three-dimensional scalar-field bounds.
 * @param {object} [boundsChesed={}] Bounds exposing `minimum`/`maximum` or `min`/`max` XYZ vectors.
 * @returns {Readonly<object>} Frozen minimum, maximum, extent, center, and volume evidence.
 */
export function createScalarFieldBounds3d(boundsChesed = {}) {
	const minimumOhr = vector3(
		boundsChesed.minimum ?? boundsChesed.min,
		[-1, -1, -1]
	);
	const maximumOhr = vector3(
		boundsChesed.maximum ?? boundsChesed.max,
		[1, 1, 1]
	);
	const orderedMalchus = minimumOhr.map((minimumHod, axisNetzach) => {
		const maximumHod = maximumOhr[axisNetzach];
		return maximumHod > minimumHod
			? [minimumHod, maximumHod]
			: [minimumHod, minimumHod + 1e-5];
	});
	const minimumMalchus = orderedMalchus.map((pairOros) => pairOros[0]);
	const maximumMalchus = orderedMalchus.map((pairOros) => pairOros[1]);
	const extentMalchus = maximumMalchus.map((maximumHod, axisNetzach) => {
		return maximumHod - minimumMalchus[axisNetzach];
	});
	const centerMalchus = minimumMalchus.map((minimumHod, axisNetzach) => {
		return minimumHod + extentMalchus[axisNetzach] * 0.5;
	});
	return Object.freeze({
		center: Object.freeze(centerMalchus),
		extent: Object.freeze(extentMalchus),
		maximum: Object.freeze(maximumMalchus),
		minimum: Object.freeze(minimumMalchus),
		type: 'scalar-field.bounds-3d',
		volume: extentMalchus[0] * extentMalchus[1] * extentMalchus[2]
	});
}

/** @returns {Array<number>} Finite XYZ vector. */
function vector3(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr)
		? valueOhr
		: [valueOhr?.x, valueOhr?.y, valueOhr?.z];
	return fallbackOhr.map((fallbackTiferes, indexNetzach) => {
		const numberOhr = Number(sourceOhr[indexNetzach]);
		return Number.isFinite(numberOhr)
			? numberOhr
			: fallbackTiferes;
	});
}
