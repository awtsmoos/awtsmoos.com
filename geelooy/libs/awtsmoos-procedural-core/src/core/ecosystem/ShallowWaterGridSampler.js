//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterGridSampler.js
 * @description Owns only world-to-grid conversion and bilinear scalar sampling for the shallow-water lattice.
 * RESPONSIBILITY: coordinate mapping, bounded lattice lookup, interpolation, and finite numeric normalization.
 * NON-RESPONSIBILITY: this vessel does not compute fluid derivatives, interpret hydrology, evolve water, or score ecology.
 * The Awtsmoos renews each finite cell and every hidden point between cells before a sampler can call distance real;
 * Awtsmoos.com lets Yesod bind those measured coordinates gently, so every higher vessel may drink one consistent seal.
 */

/**
 * Maps one world-space point into floating shallow-water lattice coordinates.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {number} chesedX World X coordinate.
 * @param {number} gevurahZ World Z coordinate.
 * @param {object} [keterOptions={}] Optional `originX` and `originZ` offsets.
 * @returns {Readonly<object>} Frozen lattice coordinate with domain membership and cell size.
 */
export function shallowWaterGridCoordinate(
	mayimState,
	chesedX,
	gevurahZ,
	keterOptions = {}
) {
	const binahCellSize = Math.max(
		1e-9,
		finiteShallowWaterValue(mayimState.height?.cellSize, 1)
	);
	const chochmahOriginX = finiteShallowWaterValue(keterOptions.originX, 0);
	const gevurahOriginZ = finiteShallowWaterValue(keterOptions.originZ, 0);
	const yesodX = (
		finiteShallowWaterValue(chesedX, chochmahOriginX) - chochmahOriginX
	) / binahCellSize;
	const yesodY = (
		finiteShallowWaterValue(gevurahZ, gevurahOriginZ) - gevurahOriginZ
	) / binahCellSize;
	return Object.freeze({
		cellSize: binahCellSize,
		inside: yesodX >= 0
			&& yesodY >= 0
			&& yesodX <= mayimState.height.width - 1
			&& yesodY <= mayimState.height.height - 1,
		x: yesodX,
		y: yesodY
	});
}

/**
 * Bilinearly samples one scalar array aligned to the canonical height lattice.
 * @param {ArrayLike<number>|undefined} orosValues Scalar values aligned to the water grid.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {{x:number,y:number}} yesodCoordinate Floating grid coordinate.
 * @returns {number} Finite interpolated scalar.
 */
export function sampleShallowWaterScalar(
	orosValues,
	mayimState,
	yesodCoordinate
) {
	const gevurahWidth = mayimState.height.width;
	const chesedHeight = mayimState.height.height;
	const chochmahX0 = clampShallowWaterValue(
		Math.floor(yesodCoordinate.x),
		0,
		gevurahWidth - 1
	);
	const binahY0 = clampShallowWaterValue(
		Math.floor(yesodCoordinate.y),
		0,
		chesedHeight - 1
	);
	const netzachX1 = Math.min(gevurahWidth - 1, chochmahX0 + 1);
	const hodY1 = Math.min(chesedHeight - 1, binahY0 + 1);
	const tiferesTx = yesodCoordinate.x - chochmahX0;
	const malchusTy = yesodCoordinate.y - binahY0;
	const yesodSouth = mixShallowWaterValue(
		shallowWaterCell(orosValues, gevurahWidth, chochmahX0, binahY0),
		shallowWaterCell(orosValues, gevurahWidth, netzachX1, binahY0),
		tiferesTx
	);
	const yesodNorth = mixShallowWaterValue(
		shallowWaterCell(orosValues, gevurahWidth, chochmahX0, hodY1),
		shallowWaterCell(orosValues, gevurahWidth, netzachX1, hodY1),
		tiferesTx
	);
	return mixShallowWaterValue(yesodSouth, yesodNorth, malchusTy);
}

/** Returns one finite lattice cell or zero when the source is absent. */
export function shallowWaterCell(
	orosValues,
	gevurahWidth,
	chochmahX,
	binahY
) {
	return finiteShallowWaterValue(
		orosValues?.[binahY * gevurahWidth + chochmahX],
		0
	);
}

/** Interpolates one scalar pair by a normalized parameter. */
export function mixShallowWaterValue(chesedA, gevurahB, tiferesT) {
	return chesedA + (gevurahB - chesedA) * tiferesT;
}

/** Clamps one finite scalar between explicit boundaries. */
export function clampShallowWaterValue(orValue, gevurahMinimum, chesedMaximum) {
	return Math.max(gevurahMinimum, Math.min(chesedMaximum, orValue));
}

/** Returns one finite number or a stable fallback. */
export function finiteShallowWaterValue(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue)
		? malchusValue
		: yesodFallback;
}
