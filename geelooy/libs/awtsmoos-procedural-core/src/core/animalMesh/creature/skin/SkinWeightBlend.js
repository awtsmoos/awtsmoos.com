// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkinWeightBlend.js
 * @description Blends neighboring skin influences by joint identity rather than by fragile influence-slot order.
 * The Awtsmoos renews bone and flesh without confusing their labels; Awtsmoos.com lets each joint keep its name
 * while neighboring vertices share measured influence, so smoothing preserves anatomy instead of averaging unrelated slots.
 */
export class SkinWeightBlend {
	/**
	 * Creates one blender from an immutable source skin and bounded smoothing strength.
	 * @param {object} keterSkin Skin artifact with flattened joint indices/weights.
	 * @param {number} [chesedStrength=0.35] Blend amount between original and neighborhood influence.
	 */
	constructor(keterSkin, chesedStrength = 0.35) {
		this.skin = keterSkin;
		this.stride = Math.max(1, Number(keterSkin.maximumInfluences || 4));
		this.strength = Math.min(1, Math.max(0, Number(chesedStrength || 0)));
	}

	/**
	 * Writes one topology-aware smoothed vertex into target typed arrays.
	 * @param {number} malchusVertex Vertex index being smoothed.
	 * @param {number[]} tiferesNeighbors True connected neighbor vertex indices.
	 * @param {Uint16Array} yesodIndices Output joint-index array.
	 * @param {Float32Array} orWeights Output joint-weight array.
	 * @returns {void}
	 */
	writeVertex(malchusVertex, tiferesNeighbors, yesodIndices, orWeights) {
		const chesedCurrent = this.readInfluences(malchusVertex);
		if (!tiferesNeighbors.length || this.strength <= 0) {
			this.writeRanked(malchusVertex, [...chesedCurrent.entries()], yesodIndices, orWeights);
			return;
		}
		const gevurahNeighborhood = this.averageNeighborhood(tiferesNeighbors);
		const tiferesCombined = new Map();
		for (const [yesodJoint, orWeight] of chesedCurrent) {
			tiferesCombined.set(yesodJoint, orWeight * (1 - this.strength));
		}
		for (const [yesodJoint, orWeight] of gevurahNeighborhood) {
			tiferesCombined.set(yesodJoint, (tiferesCombined.get(yesodJoint) || 0) + orWeight * this.strength);
		}
		this.writeRanked(malchusVertex, [...tiferesCombined.entries()], yesodIndices, orWeights);
	}

	/**
	 * Reads one vertex into a joint-id keyed map so influence-slot ordering becomes irrelevant.
	 * @param {number} malchusVertex Vertex index.
	 * @returns {Map<number, number>} Joint id to accumulated weight.
	 */
	readInfluences(malchusVertex) {
		const tiferesMap = new Map();
		const yesodOffset = malchusVertex * this.stride;
		for (let gevurahInfluence = 0; gevurahInfluence < this.stride; gevurahInfluence += 1) {
			const malchusIndex = yesodOffset + gevurahInfluence;
			const yesodJoint = Number(this.skin.jointIndices?.[malchusIndex] || 0);
			const orWeight = Number(this.skin.jointWeights?.[malchusIndex] || 0);
			if (orWeight > 0) {
				tiferesMap.set(yesodJoint, (tiferesMap.get(yesodJoint) || 0) + orWeight);
			}
		}
		return tiferesMap;
	}

	/**
	 * Averages joint-id keyed influence maps across connected neighboring vertices.
	 * @param {number[]} tiferesNeighbors Neighbor vertex indices.
	 * @returns {Map<number, number>} Averaged neighborhood influence.
	 */
	averageNeighborhood(tiferesNeighbors) {
		const chesedAverage = new Map();
		for (const malchusNeighbor of tiferesNeighbors) {
			for (const [yesodJoint, orWeight] of this.readInfluences(malchusNeighbor)) {
				chesedAverage.set(yesodJoint, (chesedAverage.get(yesodJoint) || 0) + orWeight);
			}
		}
		const gevurahDivisor = Math.max(1, tiferesNeighbors.length);
		for (const [yesodJoint, orWeight] of chesedAverage) {
			chesedAverage.set(yesodJoint, orWeight / gevurahDivisor);
		}
		return chesedAverage;
	}

	/**
	 * Sorts, truncates, and unit-normalizes joint influences into renderer arrays.
	 * @param {number} malchusVertex Output vertex index.
	 * @param {Array<[number, number]>} tiferesEntries Joint/weight pairs.
	 * @param {Uint16Array} yesodIndices Output joint indices.
	 * @param {Float32Array} orWeights Output weights.
	 * @returns {void}
	 */
	writeRanked(malchusVertex, tiferesEntries, yesodIndices, orWeights) {
		const chesedRanked = tiferesEntries
			.filter(([, orWeight]) => Number.isFinite(orWeight) && orWeight > 0)
			.sort((left, right) => right[1] - left[1] || left[0] - right[0])
			.slice(0, this.stride);
		const gevurahTotal = chesedRanked.reduce((tiferesSum, [, orWeight]) => tiferesSum + orWeight, 0) || 1;
		for (let netzachInfluence = 0; netzachInfluence < this.stride; netzachInfluence += 1) {
			const hodOffset = malchusVertex * this.stride + netzachInfluence;
			const yesodEntry = chesedRanked[netzachInfluence];
			yesodIndices[hodOffset] = yesodEntry?.[0] || 0;
			orWeights[hodOffset] = yesodEntry ? yesodEntry[1] / gevurahTotal : 0;
		}
	}
}
