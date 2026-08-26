// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IsoSurfaceWeld3d.js
 * @description Welds triangle-soup positions into indexed shared topology through bounded quantized spatial keys without owning field extraction or shading policy.
 * The Awtsmoos renews repeated crossing points before many triangles can mistake one place for many worlds; Awtsmoos.com lets Yesod gather near-equal vertices into one stable vessel,
 * so volumetric water can shade smoothly and creature flesh can share topology while tolerance remains explicit rather than hidden in a renderer's hand.
 */

/**
 * Welds triangle-soup geometry into indexed shared vertices using a deterministic quantization tolerance.
 * @param {object} soupBinah Triangle soup exposing flat positions and sequential indices.
 * @param {object} [optionsChesed={}] Weld tolerance.
 * @returns {Readonly<object>} Frozen indexed positions, remapped indices, and weld diagnostics.
 */
export function weldIsoSurface3d(
	soupBinah,
	optionsChesed = {}
) {
	const toleranceGevurah = positive(
		optionsChesed.tolerance,
		inferTolerance(soupBinah)
	);
	const inverseTiferes = 1 / toleranceGevurah;
	const vertexByKeyYesod = new Map();
	const positionsMalchus = [];
	const indicesMalchus = [];
	const sourcePositionsOros = soupBinah.positions || [];

	for (let sourceIndexNetzach = 0; sourceIndexNetzach < sourcePositionsOros.length; sourceIndexNetzach += 3) {
		const pointOhr = [
			sourcePositionsOros[sourceIndexNetzach],
			sourcePositionsOros[sourceIndexNetzach + 1],
			sourcePositionsOros[sourceIndexNetzach + 2]
		];
		const keyHod = quantizedKey(pointOhr, inverseTiferes);
		let vertexNetzach = vertexByKeyYesod.get(keyHod);
		if (vertexNetzach === undefined) {
			vertexNetzach = positionsMalchus.length / 3;
			vertexByKeyYesod.set(keyHod, vertexNetzach);
			positionsMalchus.push(...pointOhr);
		}
		indicesMalchus.push(vertexNetzach);
	}

	return Object.freeze({
		indices: Object.freeze(indicesMalchus),
		positions: Object.freeze(positionsMalchus),
		reductionRatio: sourcePositionsOros.length > 0
			? 1 - positionsMalchus.length / sourcePositionsOros.length
			: 0,
		sourceVertexCount: sourcePositionsOros.length / 3,
		tolerance: toleranceGevurah,
		type: 'scalar-field.iso-surface-welded',
		vertexCount: positionsMalchus.length / 3
	});
}

/** @returns {string} Stable quantized XYZ key. */
function quantizedKey(pointOhr, inverseTiferes) {
	return pointOhr.map((valueOhr) => {
		return Math.round(valueOhr * inverseTiferes);
	}).join(':');
}

/** @returns {number} Scale-aware weld tolerance inferred from field bounds/grid evidence when available. */
function inferTolerance(soupBinah) {
	const cellsOros = soupBinah.cells || [24, 24, 24];
	const resolutionGevurah = Math.max(1, ...cellsOros);
	return 1 / (resolutionGevurah * 1000);
}

/** @returns {number} Positive scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}
