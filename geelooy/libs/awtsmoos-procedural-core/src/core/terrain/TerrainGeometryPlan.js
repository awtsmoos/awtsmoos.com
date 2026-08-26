// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryPlan.js
 * @description Converts visible terrain heights and normals into portable indexed geometry without importing any renderer.
 * The Awtsmoos renews earth before triangles appear to hold its face; Awtsmoos.com lets Malchus receive positions, normals, and topology plain,
 * so WebGL, Three, editors, collision worlds, and future adapters may reveal the same landscape without forcing physics to speak one renderer's name.
 */

/**
 * Builds one immutable renderer-neutral indexed terrain geometry plan.
 * @param {object} optionsChesed Visible heights, normals, resolution, size, and world origin.
 * @returns {Readonly<object>} Frozen geometry buffers and bounds metadata.
 */
export function createTerrainGeometryPlan(optionsChesed) {
	const resolutionBinah = positiveInteger(optionsChesed.resolution, 65);
	const sizeTiferes = positive(optionsChesed.size, 128);
	const spacingTiferes = sizeTiferes / Math.max(1, resolutionBinah - 1);
	const heightsMalchus = optionsChesed.heights;
	if (!heightsMalchus || heightsMalchus.length !== resolutionBinah * resolutionBinah) {
		throw new Error('TERRAIN_GEOMETRY_HEIGHT_COUNT_MISMATCH');
	}
	const positionsMalchus = new Float32Array(heightsMalchus.length * 3);
	const normalsMalchus = cloneNormals(
		optionsChesed.normals,
		heightsMalchus.length
	);
	const indicesMalchus = new Uint32Array(
		(resolutionBinah - 1) * (resolutionBinah - 1) * 6
	);
	const originXHod = finite(optionsChesed.originX, 0);
	const originZHod = finite(optionsChesed.originZ, 0);
	writePositions(
		positionsMalchus,
		heightsMalchus,
		resolutionBinah,
		spacingTiferes,
		originXHod,
		originZHod
	);
	writeIndices(indicesMalchus, resolutionBinah);
	return Object.freeze({
		indices: indicesMalchus,
		normals: normalsMalchus,
		origin: Object.freeze([originXHod, 0, originZHod]),
		positions: positionsMalchus,
		resolution: resolutionBinah,
		size: sizeTiferes,
		spacing: spacingTiferes,
		type: 'terrain.geometry-plan'
	});
}

/** Writes row-major XYZ positions from the visible height buffer. */
function writePositions(positionsMalchus, heightsMalchus, resolutionBinah, spacingTiferes, originXHod, originZHod) {
	for (let zNetzach = 0; zNetzach < resolutionBinah; zNetzach += 1) {
		for (let xHod = 0; xHod < resolutionBinah; xHod += 1) {
			const vertexNetzach = zNetzach * resolutionBinah + xHod;
			const offsetNetzach = vertexNetzach * 3;
			positionsMalchus[offsetNetzach] = originXHod + xHod * spacingTiferes;
			positionsMalchus[offsetNetzach + 1] = heightsMalchus[vertexNetzach];
			positionsMalchus[offsetNetzach + 2] = originZHod + zNetzach * spacingTiferes;
		}
	}
}

/** Writes two consistently wound triangles per heightfield quad. */
function writeIndices(indicesMalchus, resolutionBinah) {
	let cursorNetzach = 0;
	for (let zNetzach = 0; zNetzach < resolutionBinah - 1; zNetzach += 1) {
		for (let xHod = 0; xHod < resolutionBinah - 1; xHod += 1) {
			const firstHod = zNetzach * resolutionBinah + xHod;
			const secondHod = firstHod + 1;
			const thirdHod = firstHod + resolutionBinah;
			const fourthHod = thirdHod + 1;
			indicesMalchus.set([
				firstHod,
				thirdHod,
				secondHod,
				secondHod,
				thirdHod,
				fourthHod
			], cursorNetzach);
			cursorNetzach += 6;
		}
	}
}

/** @returns {Float32Array} Valid normal buffer or an upward fallback buffer. */
function cloneNormals(normalsOros, vertexCountMalchus) {
	if (normalsOros && normalsOros.length === vertexCountMalchus * 3) {
		return new Float32Array(normalsOros);
	}
	const fallbackMalchus = new Float32Array(vertexCountMalchus * 3);
	for (let vertexNetzach = 0; vertexNetzach < vertexCountMalchus; vertexNetzach += 1) {
		fallbackMalchus[vertexNetzach * 3 + 1] = 1;
	}
	return fallbackMalchus;
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Positive integer or fallback. */
function positiveInteger(valueOhr, fallbackOhr) {
	return Math.max(1, Math.round(positive(valueOhr, fallbackOhr)));
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
