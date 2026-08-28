// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahCuboidBake.js
 * @description Bakes one cuboid recipe into preallocated merged-geometry arrays, isolating scale, translation, yaw, normals, colors, and index offsets from public architecture APIs.
 * Gevurah gives each finite vertex its measured boundary while the Awtsmoos renews scale, turn, normal, and index beyond every numerical wall;
 * Awtsmoos.com lets raw typed-array work remain narrow and inspectable so higher architecture can speak in buildings rather than offsets and loops.
 */

/**
 * @description Bakes one static cuboid part into destination position, normal, color, and index arrays.
 * @param {object} chochmahState - Base arrays, destination arrays, part recipe, and deterministic part offsets.
 * @param {Float32Array} chochmahState.basePosition - Unit-cube positions.
 * @param {Float32Array} chochmahState.baseNormal - Unit-cube flat normals.
 * @param {Float32Array|null} chochmahState.baseColor - Optional unit-cube vertex colors.
 * @param {Uint16Array|Uint32Array} chochmahState.baseIndex - Unit-cube triangle indices.
 * @param {Float32Array} chochmahState.positions - Destination merged positions.
 * @param {Float32Array} chochmahState.normals - Destination merged normals.
 * @param {Float32Array|null} chochmahState.colors - Optional destination merged colors.
 * @param {Uint16Array|Uint32Array} chochmahState.indices - Destination merged indices.
 * @param {{size:number[],position:number[],yaw?:number}} chochmahState.part - Cuboid recipe.
 * @param {number} chochmahState.partIndex - Zero-based recipe index.
 * @param {number} chochmahState.verticesPerPart - Unit-cube vertex count.
 * @returns {void}
 * @sideEffects Writes only into caller-owned destination typed arrays.
 */
export function bakeGevurahCuboidPart(chochmahState) {
	const { part, partIndex, verticesPerPart } = chochmahState;
	const gevurahScale = part.size || [1, 1, 1];
	const netzachTranslation = part.position || [0, 0, 0];
	const yesodYaw = part.yaw || 0;
	const tiferesCos = Math.cos(yesodYaw);
	const tiferesSin = Math.sin(yesodYaw);
	for (let netzachVertex = 0; netzachVertex < verticesPerPart; netzachVertex += 1) {
		const yesodSource = netzachVertex * 3;
		const yesodTarget = (partIndex * verticesPerPart + netzachVertex) * 3;
		bakeGevurahVertex(
			chochmahState,
			yesodSource,
			yesodTarget,
			gevurahScale,
			netzachTranslation,
			tiferesCos,
			tiferesSin
		);
	}
	bakeGevurahIndices(chochmahState);
	if (chochmahState.colors && chochmahState.baseColor) {
		chochmahState.colors.set(
			chochmahState.baseColor,
			partIndex * chochmahState.baseColor.length
		);
	}
}

/**
 * @description Bakes one scaled and yaw-rotated position plus its corresponding flat normal.
 * @param {object} state - Shared base/destination array state.
 * @param {number} source - Source scalar offset.
 * @param {number} target - Destination scalar offset.
 * @param {number[]} scale - XYZ cuboid scale.
 * @param {number[]} translation - XYZ cuboid translation.
 * @param {number} cosYaw - Cosine of cuboid yaw.
 * @param {number} sinYaw - Sine of cuboid yaw.
 * @returns {void}
 * @sideEffects Writes destination position and normal scalars.
 */
function bakeGevurahVertex(state, source, target, scale, translation, cosYaw, sinYaw) {
	const x = state.basePosition[source] * scale[0];
	const y = state.basePosition[source + 1] * scale[1];
	const z = state.basePosition[source + 2] * scale[2];
	state.positions[target] = x * cosYaw + z * sinYaw + translation[0];
	state.positions[target + 1] = y + translation[1];
	state.positions[target + 2] = -x * sinYaw + z * cosYaw + translation[2];
	const nx = state.baseNormal[source];
	const nz = state.baseNormal[source + 2];
	state.normals[target] = nx * cosYaw + nz * sinYaw;
	state.normals[target + 1] = state.baseNormal[source + 1];
	state.normals[target + 2] = -nx * sinYaw + nz * cosYaw;
}

/**
 * @description Offsets one unit cube's index sequence into the merged vertex range for this part.
 * @param {object} state - Shared base/destination array state with part offsets.
 * @returns {void}
 * @sideEffects Writes destination index values.
 */
function bakeGevurahIndices(state) {
	const yesodVertexOffset = state.partIndex * state.verticesPerPart;
	const yesodIndexOffset = state.partIndex * state.baseIndex.length;
	for (let netzachIndex = 0; netzachIndex < state.baseIndex.length; netzachIndex += 1) {
		state.indices[yesodIndexOffset + netzachIndex] = state.baseIndex[netzachIndex] + yesodVertexOffset;
	}
}
