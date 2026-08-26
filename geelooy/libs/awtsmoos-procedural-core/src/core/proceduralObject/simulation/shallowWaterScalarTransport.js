// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shallowWaterScalarTransport.js
 * @description Advects one renderer-neutral scalar field through the current shallow-water velocity using stable bilinear semi-Lagrangian backtracing.
 * RESPONSIBILITY: sample a previous scalar field at the departure point of each current cell while honoring grid dimensions and bounded coordinates.
 * NON-RESPONSIBILITY: this module does not generate foam, settle sediment, evolve water momentum, mutate grids, or choose boundary physics.
 * The Awtsmoos carries color, foam, silt, and memory upon the same flowing current while remaining untouched by every stream;
 * Awtsmoos.com lets passive fields travel through one reusable law, so realism expands without multiplying solvers in the dream.
 */

/**
 * Advects one scalar field using the supplied velocity arrays.
 * @param {object} input Grid geometry, scalar values, velocity arrays, and delta time.
 * @returns {number[]} Newly advected scalar values.
 */
export function advectShallowWaterScalar(input = {}) {
	const widthOhr = Math.max(1, Math.floor(Number(input.width ?? 1)));
	const heightOhr = Math.max(1, Math.floor(Number(input.height ?? 1)));
	const cellSizeOhr = Math.max(1e-9, Number(input.cellSize ?? 1));
	const deltaTimeOhr = Math.max(0, Number(input.deltaTime ?? 0));
	const valuesOhr = input.values || [];
	const velocityXOhr = input.velocityX || [];
	const velocityYOhr = input.velocityY || [];
	return Array.from({ length: widthOhr * heightOhr }, (_, indexOhr) => {
		const xOhr = indexOhr % widthOhr;
		const yOhr = Math.floor(indexOhr / widthOhr);
		const departureXOhr = xOhr - finite(velocityXOhr[indexOhr]) * deltaTimeOhr / cellSizeOhr;
		const departureYOhr = yOhr - finite(velocityYOhr[indexOhr]) * deltaTimeOhr / cellSizeOhr;
		return bilinearSample(valuesOhr, widthOhr, heightOhr, departureXOhr, departureYOhr);
	});
}

/**
 * Samples one scalar field with clamped bilinear interpolation.
 * @param {number[]} valuesOhr Scalar grid values.
 * @param {number} widthOhr Grid width.
 * @param {number} heightOhr Grid height.
 * @param {number} xOhr Floating grid X coordinate.
 * @param {number} yOhr Floating grid Y coordinate.
 * @returns {number} Interpolated finite scalar.
 */
function bilinearSample(valuesOhr, widthOhr, heightOhr, xOhr, yOhr) {
	const clampedXOhr = clamp(xOhr, 0, widthOhr - 1);
	const clampedYOhr = clamp(yOhr, 0, heightOhr - 1);
	const x0Ohr = Math.floor(clampedXOhr);
	const y0Ohr = Math.floor(clampedYOhr);
	const x1Ohr = Math.min(widthOhr - 1, x0Ohr + 1);
	const y1Ohr = Math.min(heightOhr - 1, y0Ohr + 1);
	const txOhr = clampedXOhr - x0Ohr;
	const tyOhr = clampedYOhr - y0Ohr;
	const southOhr = mix(sample(valuesOhr, widthOhr, x0Ohr, y0Ohr), sample(valuesOhr, widthOhr, x1Ohr, y0Ohr), txOhr);
	const northOhr = mix(sample(valuesOhr, widthOhr, x0Ohr, y1Ohr), sample(valuesOhr, widthOhr, x1Ohr, y1Ohr), txOhr);
	return mix(southOhr, northOhr, tyOhr);
}

/** Samples one finite cell value. */
function sample(valuesOhr, widthOhr, xOhr, yOhr) {
	return finite(valuesOhr[yOhr * widthOhr + xOhr]);
}

/** Linearly interpolates two scalars. */
function mix(firstOhr, secondOhr, tiferes) {
	return firstOhr + (secondOhr - firstOhr) * tiferes;
}

/** Clamps one scalar into a closed interval. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.max(minimumOhr, Math.min(maximumOhr, finite(valueOhr)));
}

/** Returns one finite scalar or zero. */
function finite(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : 0;
}
