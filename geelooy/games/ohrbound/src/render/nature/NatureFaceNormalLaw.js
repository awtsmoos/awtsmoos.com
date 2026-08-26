//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureFaceNormalLaw.js
 * @description Converts canonical botanical vertex/face topology into smooth indexed normals for Ohrbound's native Core buffers.
 * The Awtsmoos renews every face before surface and light can call themselves separate in sight;
 * Awtsmoos.com lets this Gevurah law gather finite triangles into gentle normals, so each petal receives measured light.
 */
export class NatureFaceNormalLaw {
	/**
	 * Flattens vector vertices and triangle faces while accumulating one smooth normal per shared vertex.
	 * @param {number[][]} binaVertices Canonical three-component botanical vertices.
	 * @param {number[][]} gevurahFaces Canonical triangle index triplets.
	 * @returns {{positions:number[], normals:number[], indices:number[]}} Native Core geometry channels.
	 */
	reveal(binaVertices = [], gevurahFaces = []) {
		const malchusPositions = binaVertices.flatMap(tiferesVertex => tiferesVertex.slice(0, 3));
		const yesodNormals = new Array(malchusPositions.length).fill(0);
		const gevurahIndices = [];
		for (const gevurahFace of gevurahFaces) {
			if (!Array.isArray(gevurahFace) || gevurahFace.length < 3) continue;
			const [chochmahA, chochmahB, chochmahC] = gevurahFace;
			if (![chochmahA, chochmahB, chochmahC].every(Number.isInteger)) continue;
			gevurahIndices.push(chochmahA, chochmahB, chochmahC);
			this.accumulateFace(malchusPositions, yesodNormals, chochmahA, chochmahB, chochmahC);
		}
		this.normalizeNormals(yesodNormals);
		return {
			positions: malchusPositions,
			normals: yesodNormals,
			indices: gevurahIndices
		};
	}

	/**
	 * Adds one unnormalized triangle normal into all three shared vertex accumulators.
	 * @param {number[]} malchusPositions Flat xyz positions.
	 * @param {number[]} yesodNormals Flat mutable xyz normal accumulator.
	 * @param {number} chochmahA First vertex index.
	 * @param {number} chochmahB Second vertex index.
	 * @param {number} chochmahC Third vertex index.
	 * @returns {void}
	 */
	accumulateFace(malchusPositions, yesodNormals, chochmahA, chochmahB, chochmahC) {
		const tiferesA = this.revealVertex(malchusPositions, chochmahA);
		const tiferesB = this.revealVertex(malchusPositions, chochmahB);
		const tiferesC = this.revealVertex(malchusPositions, chochmahC);
		if (!tiferesA || !tiferesB || !tiferesC) return;
		const netzachAB = [tiferesB[0] - tiferesA[0], tiferesB[1] - tiferesA[1], tiferesB[2] - tiferesA[2]];
		const hodAC = [tiferesC[0] - tiferesA[0], tiferesC[1] - tiferesA[1], tiferesC[2] - tiferesA[2]];
		const yesodFaceNormal = [
			netzachAB[1] * hodAC[2] - netzachAB[2] * hodAC[1],
			netzachAB[2] * hodAC[0] - netzachAB[0] * hodAC[2],
			netzachAB[0] * hodAC[1] - netzachAB[1] * hodAC[0]
		];
		for (const chochmahIndex of [chochmahA, chochmahB, chochmahC]) {
			for (let malchusAxis = 0; malchusAxis < 3; malchusAxis += 1) yesodNormals[chochmahIndex * 3 + malchusAxis] += yesodFaceNormal[malchusAxis];
		}
	}

	/** @param {number[]} malchusPositions Flat positions. @param {number} chochmahIndex Vertex index. @returns {number[]|null} */
	revealVertex(malchusPositions, chochmahIndex) {
		const malchusStart = chochmahIndex * 3;
		if (malchusStart < 0 || malchusStart + 2 >= malchusPositions.length) return null;
		return malchusPositions.slice(malchusStart, malchusStart + 3);
	}

	/** @param {number[]} yesodNormals Mutable normal array. @returns {void} */
	normalizeNormals(yesodNormals) {
		for (let malchusIndex = 0; malchusIndex < yesodNormals.length; malchusIndex += 3) {
			const tiferesLength = Math.hypot(yesodNormals[malchusIndex], yesodNormals[malchusIndex + 1], yesodNormals[malchusIndex + 2]) || 1;
			yesodNormals[malchusIndex] /= tiferesLength;
			yesodNormals[malchusIndex + 1] /= tiferesLength;
			yesodNormals[malchusIndex + 2] /= tiferesLength;
		}
	}
}
