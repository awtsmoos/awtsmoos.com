// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainEcologyEvidence.js
 * @description Converts physical terrain evidence into normalized suitability fields for grass, flowers, bushes, trees, exposed rock, water, and buildings.
 * The Awtsmoos renews slope and moisture before a root can call one place home; Awtsmoos.com lets each kingdom receive a measured invitation,
 * so ecology, stone, water, and architecture may compose with terrain truth without hard-coding one game-specific destination.
 */

/**
 * Derives domain-neutral suitability scores from visible terrain surface evidence.
 * @param {Readonly<object>} surfaceBinah Surface evidence with slope, moisture, elevation, exposure, and curvature.
 * @returns {Readonly<object>} Frozen typed-array suitability fields.
 */
export function createTerrainEcologyEvidence(surfaceBinah) {
	const cellCountMalchus = surfaceBinah.slope.length;
	const grassChesed = new Float32Array(cellCountMalchus);
	const flowersTiferes = new Float32Array(cellCountMalchus);
	const bushesNetzach = new Float32Array(cellCountMalchus);
	const treesYesod = new Float32Array(cellCountMalchus);
	const rockGevurah = new Float32Array(cellCountMalchus);
	const waterMalchus = new Float32Array(cellCountMalchus);
	const buildingBinah = new Float32Array(cellCountMalchus);

	for (let indexNetzach = 0; indexNetzach < cellCountMalchus; indexNetzach += 1) {
		const evidenceBinah = normalizeCellEvidence(surfaceBinah, indexNetzach);
		grassChesed[indexNetzach] = grassSuitability(evidenceBinah);
		flowersTiferes[indexNetzach] = flowerSuitability(
			evidenceBinah,
			grassChesed[indexNetzach]
		);
		bushesNetzach[indexNetzach] = bushSuitability(evidenceBinah);
		treesYesod[indexNetzach] = treeSuitability(evidenceBinah);
		rockGevurah[indexNetzach] = rockSuitability(evidenceBinah);
		waterMalchus[indexNetzach] = waterSuitability(evidenceBinah);
		buildingBinah[indexNetzach] = buildingSuitability(evidenceBinah);
	}

	return Object.freeze({
		building: buildingBinah,
		bushes: bushesNetzach,
		flowers: flowersTiferes,
		grass: grassChesed,
		rock: rockGevurah,
		trees: treesYesod,
		type: 'terrain.ecology-evidence',
		water: waterMalchus
	});
}

/** @returns {Readonly<object>} Normalized physical evidence for one visible terrain cell. */
function normalizeCellEvidence(surfaceBinah, indexNetzach) {
	return Object.freeze({
		concavity: unit(
			Math.max(0, -surfaceBinah.curvature[indexNetzach]) * 2.2
		),
		elevation: unit(surfaceBinah.elevation[indexNetzach]),
		exposure: unit(surfaceBinah.exposure[indexNetzach]),
		moisture: unit(surfaceBinah.moisture[indexNetzach]),
		slope: unit(surfaceBinah.slope[indexNetzach] / 1.35)
	});
}

/** @returns {number} Grass carrying-capacity hint. */
function grassSuitability(evidenceBinah) {
	return unit(
		(1 - evidenceBinah.slope) * 0.62 +
		evidenceBinah.moisture * 0.3 +
		(1 - evidenceBinah.exposure) * 0.08
	);
}

/** @returns {number} Flower carrying-capacity hint. */
function flowerSuitability(evidenceBinah, grassChesed) {
	return unit(
		grassChesed * 0.64 +
		midBand(evidenceBinah.moisture, 0.56) * 0.28 +
		midBand(evidenceBinah.elevation, 0.5) * 0.08
	);
}

/** @returns {number} Multi-stem bush carrying-capacity hint. */
function bushSuitability(evidenceBinah) {
	return unit(
		(1 - evidenceBinah.slope * 0.72) * 0.52 +
		evidenceBinah.moisture * 0.22 +
		evidenceBinah.concavity * 0.14 +
		evidenceBinah.exposure * 0.12
	);
}

/** @returns {number} Tree carrying-capacity hint. */
function treeSuitability(evidenceBinah) {
	return unit(
		(1 - evidenceBinah.slope) * 0.45 +
		evidenceBinah.moisture * 0.34 +
		evidenceBinah.concavity * 0.16 +
		(1 - evidenceBinah.exposure) * 0.05
	);
}

/** @returns {number} Exposed-rock likelihood hint. */
function rockSuitability(evidenceBinah) {
	return unit(
		evidenceBinah.slope * 0.54 +
		evidenceBinah.exposure * 0.34 +
		evidenceBinah.elevation * 0.12
	);
}

/** @returns {number} Surface-water or wetland likelihood hint. */
function waterSuitability(evidenceBinah) {
	return unit(
		evidenceBinah.moisture * 0.68 +
		evidenceBinah.concavity * 0.24 +
		(1 - evidenceBinah.slope) * 0.08
	);
}

/** @returns {number} Terrain suitability for stable building foundations. */
function buildingSuitability(evidenceBinah) {
	return unit(
		(1 - evidenceBinah.slope) * 0.72 +
		(1 - evidenceBinah.moisture) * 0.2 +
		(1 - Math.abs(evidenceBinah.elevation - 0.45)) * 0.08
	);
}

/** @returns {number} Bell-like suitability around one normalized center. */
function midBand(valueOhr, centerTiferes) {
	return unit(1 - Math.abs(valueOhr - centerTiferes) * 2);
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}
