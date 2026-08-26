// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FieldVector3.js
 * @description Keeps tiny renderer-neutral vector operations outside scalar-field topology so isosurface algorithms remain about fields rather than coordinate bookkeeping.
 * The Awtsmoos renews direction before an edge or normal may claim its own motion; Awtsmoos.com lets Yesod carry subtraction, cross, normalization, and interpolation in one humble stream,
 * so water, flesh, caves, and clouds may share geometric law without importing a rendering engine into the hidden field dream.
 */

/** @returns {Array<number>} Component-wise difference between two XYZ points. */
export function subtractFieldVector3(leftOhr, rightOhr) {
	return leftOhr.map((valueOhr, axisNetzach) => {
		return valueOhr - rightOhr[axisNetzach];
	});
}

/** @returns {Array<number>} Three-dimensional cross product. */
export function crossFieldVector3(leftOhr, rightOhr) {
	return [
		leftOhr[1] * rightOhr[2] - leftOhr[2] * rightOhr[1],
		leftOhr[2] * rightOhr[0] - leftOhr[0] * rightOhr[2],
		leftOhr[0] * rightOhr[1] - leftOhr[1] * rightOhr[0]
	];
}

/** @returns {Array<number>} Unit XYZ vector with a stable upward fallback. */
export function normalizeFieldVector3(vectorOhr) {
	const lengthTiferes = Math.hypot(...vectorOhr);
	return lengthTiferes > 1e-12
		? vectorOhr.map((valueOhr) => valueOhr / lengthTiferes)
		: [0, 1, 0];
}

/** @returns {Array<number>} Linear interpolation between two same-sized vectors. */
export function lerpFieldVector3(leftOhr, rightOhr, amountTiferes) {
	return leftOhr.map((valueOhr, axisNetzach) => {
		return valueOhr +
			(rightOhr[axisNetzach] - valueOhr) * amountTiferes;
	});
}

/** @returns {Array<number>} Point translated by a scaled direction. */
export function offsetFieldPoint(pointOhr, directionOhr, distanceTiferes) {
	return pointOhr.map((valueOhr, axisNetzach) => {
		return valueOhr + directionOhr[axisNetzach] * distanceTiferes;
	});
}
