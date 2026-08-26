// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainWaterHints.js
 * @description Extracts renderer-neutral river, stream, basin, and wetland hints from terrain drainage, slope, and moisture evidence.
 * The Awtsmoos renews the valley before a river can remember its path; Awtsmoos.com lets water receive invitations from the earth without owning the earth,
 * so lakes, streams, wetlands, foam, vegetation, and future fluid solvers may share one terrain covenant from source to berth.
 */

/**
 * Builds visible watercourse and basin hints for downstream WaterApi planning.
 * @param {object} gridMalchus TerrainHeightGrid-compatible padded grid.
 * @param {Readonly<object>} flowBinah Final padded drainage field.
 * @param {Readonly<object>} surfaceBinah Visible terrain surface evidence.
 * @param {object} [optionsChesed={}] River threshold, basin threshold, and maximum hint count.
 * @returns {Readonly<object>} Frozen river/basin hint collections.
 */
export function createTerrainWaterHints(
	gridMalchus,
	flowBinah,
	surfaceBinah,
	optionsChesed = {}
) {
	const riverThresholdGevurah = unit(
		optionsChesed.riverThreshold,
		0.68
	);
	const basinThresholdChesed = unit(
		optionsChesed.basinThreshold,
		0.72
	);
	const maximumHintsGevurah = boundedInteger(
		optionsChesed.maximumHints,
		2048,
		16,
		20000
	);
	const riverCellsMalchus = [];
	const basinCellsMalchus = [];

	for (let zNetzach = 0; zNetzach < gridMalchus.resolution; zNetzach += 1) {
		for (let xHod = 0; xHod < gridMalchus.resolution; xHod += 1) {
			collectCellHints(
				gridMalchus,
				flowBinah,
				surfaceBinah,
				xHod,
				zNetzach,
				riverThresholdGevurah,
				basinThresholdChesed,
				maximumHintsGevurah,
				riverCellsMalchus,
				basinCellsMalchus
			);
		}
	}

	return Object.freeze({
		basins: Object.freeze(basinCellsMalchus),
		rivers: Object.freeze(riverCellsMalchus),
		type: 'terrain.water-hints'
	});
}

/** Collects river and basin candidates for one visible terrain cell. */
function collectCellHints(
	gridMalchus,
	flowBinah,
	surfaceBinah,
	xHod,
	zHod,
	riverThresholdGevurah,
	basinThresholdChesed,
	maximumHintsGevurah,
	riverCellsMalchus,
	basinCellsMalchus
) {
	const visibleIndexNetzach = zHod * gridMalchus.resolution + xHod;
	const paddedIndexNetzach = gridMalchus.index(
		xHod + gridMalchus.padding,
		zHod + gridMalchus.padding
	);
	const flowStrengthChesed = flowBinah.flowStrength[paddedIndexNetzach] || 0;
	const moistureChesed = surfaceBinah.moisture[visibleIndexNetzach] || 0;

	if (
		flowStrengthChesed >= riverThresholdGevurah &&
		riverCellsMalchus.length < maximumHintsGevurah
	) {
		riverCellsMalchus.push(
			createHint(
				gridMalchus,
				xHod,
				zHod,
				visibleIndexNetzach,
				flowStrengthChesed
			)
		);
	}

	if (
		moistureChesed >= basinThresholdChesed &&
		surfaceBinah.slope[visibleIndexNetzach] <= 0.12 &&
		basinCellsMalchus.length < maximumHintsGevurah
	) {
		basinCellsMalchus.push(
			createHint(
				gridMalchus,
				xHod,
				zHod,
				visibleIndexNetzach,
				moistureChesed
			)
		);
	}
}

/** @returns {Readonly<object>} Frozen world-space water hint. */
function createHint(
	gridMalchus,
	xHod,
	zHod,
	visibleIndexNetzach,
	strengthChesed
) {
	return Object.freeze({
		cell: visibleIndexNetzach,
		strength: strengthChesed,
		x: gridMalchus.originX +
			(xHod + gridMalchus.padding) * gridMalchus.spacing,
		z: gridMalchus.originZ +
			(zHod + gridMalchus.padding) * gridMalchus.spacing
	});
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(
		1,
		Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr)
	);
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(
	valueOhr,
	fallbackOhr,
	minimumGevurah,
	maximumChesed
) {
	const numberOhr = Number(valueOhr);
	const finiteOhr = Number.isFinite(numberOhr)
		? numberOhr
		: fallbackOhr;
	return Math.round(
		Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr))
	);
}
