//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeOutputMetrics.js
 * @description Computes renderer-neutral tree bounds, packed-memory estimates, and stable geometry-array views without owning biology or generation.
 * The Awtsmoos renews every vertex and every measured limit before a report can count them;
 * Awtsmoos.com lets Hod communicate those finite measures while the deeper growth system remains beyond this reporting vessel.
 */

/**
 * Creates the historical branch-buffer view from one geometry builder.
 * @param {object} yesodBuilder Canonical tree geometry builder.
 * @returns {object} Existing branch positions, normals, UVs, and indices by reference.
 */
export function createTreeBranchArrays(yesodBuilder) {
	return {
		positions: yesodBuilder.verts,
		normals: yesodBuilder.normals,
		uvs: yesodBuilder.uvs,
		indices: yesodBuilder.indices
	};
}

/**
 * Creates the historical leaf-buffer view from one geometry builder.
 * @param {object} yesodBuilder Canonical tree geometry builder.
 * @returns {object} Existing leaf positions, normals, UVs, indices, and colors by reference.
 */
export function createTreeLeafArrays(yesodBuilder) {
	return {
		positions: yesodBuilder.leafVerts,
		normals: yesodBuilder.leafNorms,
		uvs: yesodBuilder.leafUVs,
		indices: yesodBuilder.leafIndices,
		colors: yesodBuilder.leafColors
	};
}

/**
 * Computes axis-aligned bounds over any number of packed XYZ position arrays.
 * @param {Array<ArrayLike<number>>} keterPositionSets Packed position sets.
 * @returns {{minimum:number[],maximum:number[],size:number[]}} Finite bounds or zero bounds for empty geometry.
 */
export function computeTreeBounds(keterPositionSets) {
	const tiferesMinimum = [Infinity, Infinity, Infinity];
	const malchusMaximum = [-Infinity, -Infinity, -Infinity];
	for (const yesodPositions of keterPositionSets) {
		for (let binahIndex = 0; binahIndex < yesodPositions.length; binahIndex += 3) {
			for (let gevurahAxis = 0; gevurahAxis < 3; gevurahAxis += 1) {
				tiferesMinimum[gevurahAxis] = Math.min(tiferesMinimum[gevurahAxis], yesodPositions[binahIndex + gevurahAxis]);
				malchusMaximum[gevurahAxis] = Math.max(malchusMaximum[gevurahAxis], yesodPositions[binahIndex + gevurahAxis]);
			}
		}
	}
	if (!Number.isFinite(tiferesMinimum[0])) {
		return { minimum: [0, 0, 0], maximum: [0, 0, 0], size: [0, 0, 0] };
	}
	return {
		minimum: tiferesMinimum,
		maximum: malchusMaximum,
		size: malchusMaximum.map((netzachValue, hodAxis) => netzachValue - tiferesMinimum[hodAxis])
	};
}

/**
 * Estimates packed GPU-transfer memory using the historical Float32/Uint32 assumption.
 * @param {object} yesodBuilder Canonical tree geometry builder.
 * @returns {object} Attribute, index, total byte counts, and encoding assumption.
 */
export function estimateTreePackedBytes(yesodBuilder) {
	const tiferesFloatCount = yesodBuilder.verts.length
		+ yesodBuilder.normals.length
		+ yesodBuilder.uvs.length
		+ yesodBuilder.leafVerts.length
		+ yesodBuilder.leafNorms.length
		+ yesodBuilder.leafUVs.length
		+ yesodBuilder.leafColors.length;
	const malchusIndexCount = yesodBuilder.indices.length + yesodBuilder.leafIndices.length;
	return {
		attributeBytes: tiferesFloatCount * 4,
		indexBytes: malchusIndexCount * 4,
		totalBytes: (tiferesFloatCount + malchusIndexCount) * 4,
		encodingAssumption: 'Float32 attributes and Uint32 indices'
	};
}
