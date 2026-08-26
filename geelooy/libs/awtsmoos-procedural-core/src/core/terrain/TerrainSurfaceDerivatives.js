// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainSurfaceDerivatives.js
 * @description Measures finite-difference slope, curvature, height range, and normals without mixing those laws into ecology or rendering.
 * The Awtsmoos renews every incline before grass calls it gentle and stone calls it steep; Awtsmoos.com lets Binah measure the hidden turn,
 * so each later system may drink one truthful derivative field while the terrain core remains modular, finite, and clear to learn.
 */

/**
 * Samples central finite differences at one padded terrain cell.
 * @param {object} gridMalchus TerrainHeightGrid-compatible source.
 * @param {number} xHod Padded X coordinate.
 * @param {number} zHod Padded Z coordinate.
 * @returns {Readonly<object>} Frozen slope components, curvature, and unit normal.
 */
export function sampleTerrainDerivatives(gridMalchus, xHod, zHod) {
	const spacingTiferes = gridMalchus.spacing;
	const centerOhr = heightAt(gridMalchus, xHod, zHod);
	const leftOhr = heightAt(gridMalchus, xHod - 1, zHod);
	const rightOhr = heightAt(gridMalchus, xHod + 1, zHod);
	const backOhr = heightAt(gridMalchus, xHod, zHod - 1);
	const frontOhr = heightAt(gridMalchus, xHod, zHod + 1);
	const dxGevurah = (rightOhr - leftOhr) / (spacingTiferes * 2);
	const dzGevurah = (frontOhr - backOhr) / (spacingTiferes * 2);
	const curvatureBinah = (
		(leftOhr + rightOhr + backOhr + frontOhr) * 0.25 - centerOhr
	) / spacingTiferes;
	const normalLengthTiferes = Math.hypot(dxGevurah, 1, dzGevurah);
	return Object.freeze({
		curvature: curvatureBinah,
		dx: dxGevurah,
		dz: dzGevurah,
		normal: Object.freeze([
			-dxGevurah / normalLengthTiferes,
			1 / normalLengthTiferes,
			-dzGevurah / normalLengthTiferes
		]),
		slope: Math.hypot(dxGevurah, dzGevurah)
	});
}

/**
 * Finds minimum and maximum height across one working grid.
 * @param {object} gridMalchus TerrainHeightGrid-compatible source.
 * @returns {Readonly<object>} Frozen minimum/maximum range.
 */
export function terrainHeightRange(gridMalchus) {
	let minimumGevurah = Infinity;
	let maximumChesed = -Infinity;
	for (const heightOhr of gridMalchus.heights) {
		minimumGevurah = Math.min(minimumGevurah, heightOhr);
		maximumChesed = Math.max(maximumChesed, heightOhr);
	}
	return Object.freeze({
		maximum: maximumChesed,
		minimum: minimumGevurah
	});
}

/**
 * Normalizes one height against a known terrain range.
 * @param {number} heightOhr Height to normalize.
 * @param {Readonly<object>} rangeBinah Minimum/maximum range.
 * @returns {number} Unit interval elevation evidence.
 */
export function normalizeTerrainHeight(heightOhr, rangeBinah) {
	const spanTiferes = rangeBinah.maximum - rangeBinah.minimum;
	return spanTiferes > 1e-9
		? (heightOhr - rangeBinah.minimum) / spanTiferes
		: 0.5;
}

/** @returns {number} Clamped padded height sample. */
function heightAt(gridMalchus, xHod, zHod) {
	const boundedXHod = Math.min(
		gridMalchus.sampleResolution - 1,
		Math.max(0, xHod)
	);
	const boundedZHod = Math.min(
		gridMalchus.sampleResolution - 1,
		Math.max(0, zHod)
	);
	return gridMalchus.heights[
		gridMalchus.index(boundedXHod, boundedZHod)
	];
}
