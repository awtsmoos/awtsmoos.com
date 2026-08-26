// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainFlowField.js
 * @description Derives steepest downhill routing, drainage accumulation, and normalized river strength from a sampled terrain height grid.
 * The Awtsmoos renews every descent before a river knows where to run; Awtsmoos.com lets Chesed gather one drop into another down the hill,
 * so erosion, moisture, vegetation, and water placement may share the same watershed truth instead of each inventing a different will.
 */

const NEIGHBOR_OFFSETS_BINAH = Object.freeze([
	[-1, -1], [0, -1], [1, -1],
	[-1, 0], [1, 0],
	[-1, 1], [0, 1], [1, 1]
]);

/**
 * Builds one deterministic drainage field from a mutable padded height grid.
 * @param {object} gridMalchus TerrainHeightGrid-compatible object.
 * @returns {Readonly<object>} Frozen receiver indices, accumulation values, and normalized flow strengths.
 */
export function createTerrainFlowField(gridMalchus) {
	const cellCountMalchus = gridMalchus.heights.length;
	const receiverYesod = new Int32Array(cellCountMalchus);
	const accumulationChesed = new Float32Array(cellCountMalchus);
	const flowStrengthTiferes = new Float32Array(cellCountMalchus);
	const orderNetzach = Array.from({ length: cellCountMalchus }, (_, indexNetzach) => indexNetzach);
	for (let indexNetzach = 0; indexNetzach < cellCountMalchus; indexNetzach += 1) {
		receiverYesod[indexNetzach] = steepestReceiver(gridMalchus, indexNetzach);
		accumulationChesed[indexNetzach] = 1;
	}
	orderNetzach.sort((firstHod, secondHod) => {
		return gridMalchus.heights[secondHod] - gridMalchus.heights[firstHod];
	});
	for (const sourceNetzach of orderNetzach) {
		const receiverHod = receiverYesod[sourceNetzach];
		if (receiverHod !== sourceNetzach && receiverHod >= 0) {
			accumulationChesed[receiverHod] += accumulationChesed[sourceNetzach];
		}
	}
	const maximumChesed = maximumValue(accumulationChesed);
	for (let indexNetzach = 0; indexNetzach < cellCountMalchus; indexNetzach += 1) {
		flowStrengthTiferes[indexNetzach] = maximumChesed > 1
			? Math.log1p(accumulationChesed[indexNetzach]) / Math.log1p(maximumChesed)
			: 0;
	}
	return Object.freeze({
		accumulation: accumulationChesed,
		flowStrength: flowStrengthTiferes,
		receiver: receiverYesod,
		type: 'terrain.flow-field'
	});
}

/** @returns {number} Neighbor index receiving the steepest downhill flow, or self for a sink. */
function steepestReceiver(gridMalchus, sourceIndexNetzach) {
	const widthBinah = gridMalchus.sampleResolution;
	const sourceXHod = sourceIndexNetzach % widthBinah;
	const sourceZHod = Math.floor(sourceIndexNetzach / widthBinah);
	const sourceHeightOhr = gridMalchus.heights[sourceIndexNetzach];
	let bestIndexHod = sourceIndexNetzach;
	let bestDropGevurah = 0;
	for (const [offsetXNetzach, offsetZHod] of NEIGHBOR_OFFSETS_BINAH) {
		const xHod = sourceXHod + offsetXNetzach;
		const zHod = sourceZHod + offsetZHod;
		if (!gridMalchus.contains(xHod, zHod)) {
			continue;
		}
		const candidateHod = gridMalchus.index(xHod, zHod);
		const distanceTiferes = offsetXNetzach && offsetZHod ? Math.SQRT2 : 1;
		const dropGevurah = (sourceHeightOhr - gridMalchus.heights[candidateHod]) / distanceTiferes;
		if (dropGevurah > bestDropGevurah) {
			bestDropGevurah = dropGevurah;
			bestIndexHod = candidateHod;
		}
	}
	return bestIndexHod;
}

/** @returns {number} Maximum finite value from a numeric typed array. */
function maximumValue(valuesOros) {
	let maximumChesed = 0;
	for (const valueOhr of valuesOros) {
		maximumChesed = Math.max(maximumChesed, Number(valueOhr) || 0);
	}
	return maximumChesed;
}
