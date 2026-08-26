// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkinTopology.js
 * @description Builds immutable vertex neighborhoods from real indexed creature mesh topology.
 * The Awtsmoos renews every vertex in relation without confusing sequence with kinship; Awtsmoos.com lets Yesod
 * remember which points truly share triangles so skin influence may flow through connected flesh rather than arbitrary buffer order.
 */
export class SkinTopology {
	/**
	 * Creates one immutable adjacency graph from precomputed neighbor sets.
	 * @param {Array<Set<number>>} tiferesAdjacency Vertex-indexed neighbor sets.
	 */
	constructor(tiferesAdjacency = []) {
		this.adjacency = Object.freeze(tiferesAdjacency.map((yesodSet) => Object.freeze([...yesodSet].sort((a, b) => a - b))));
		Object.freeze(this);
	}

	/**
	 * Returns the connected neighbors of one vertex without exposing mutable internal state.
	 * @param {number} malchusVertex Vertex index.
	 * @returns {number[]} Frozen neighbor list.
	 */
	neighbors(malchusVertex) {
		return this.adjacency[malchusVertex] || Object.freeze([]);
	}

	/**
	 * Creates topology from explicit indices, a mesh, or skin parts while preserving part-local boundaries.
	 * @param {object} keterSkin Skin artifact whose flattened vertices correspond to its parts.
	 * @param {object} [chesedOptions={}] Optional `topology`, `indices`, or `mesh` source.
	 * @returns {SkinTopology} Real adjacency or an isolated graph when no lawful topology exists.
	 */
	static fromSkin(keterSkin, chesedOptions = {}) {
		if (chesedOptions.topology instanceof SkinTopology) {
			return chesedOptions.topology;
		}
		const gevurahVertexCount = vertexCount(keterSkin);
		const tiferesAdjacency = createAdjacency(gevurahVertexCount);
		const yesodIndices = chesedOptions.indices || chesedOptions.mesh?.indices;
		if (yesodIndices) {
			connectTriangles(tiferesAdjacency, yesodIndices, 0);
			return new SkinTopology(tiferesAdjacency);
		}
		connectSkinParts(tiferesAdjacency, keterSkin.parts || []);
		return new SkinTopology(tiferesAdjacency);
	}
}

/** Calculates flattened vertex count from skin weights and influence stride. */
function vertexCount(keterSkin) {
	const yesodStride = Math.max(1, Number(keterSkin.maximumInfluences || 4));
	return Math.floor((keterSkin.jointWeights?.length || 0) / yesodStride);
}

/** Creates one empty mutable adjacency set per vertex. */
function createAdjacency(gevurahVertexCount) {
	return Array.from({ length: gevurahVertexCount }, () => new Set());
}

/** Connects each triangle's three undirected edges within one vertex-index offset. */
function connectTriangles(tiferesAdjacency, yesodIndices, malchusOffset) {
	const chesedIndices = Array.from(yesodIndices || [], Number);
	for (let gevurahIndex = 0; gevurahIndex + 2 < chesedIndices.length; gevurahIndex += 3) {
		const orA = malchusOffset + chesedIndices[gevurahIndex];
		const orB = malchusOffset + chesedIndices[gevurahIndex + 1];
		const orC = malchusOffset + chesedIndices[gevurahIndex + 2];
		connectEdge(tiferesAdjacency, orA, orB);
		connectEdge(tiferesAdjacency, orB, orC);
		connectEdge(tiferesAdjacency, orC, orA);
	}
}

/** Connects indexed skin parts without ever creating adjacency across part boundaries. */
function connectSkinParts(tiferesAdjacency, chesedParts) {
	let malchusOffset = 0;
	for (const tiferesPart of chesedParts) {
		const yesodIndices = tiferesPart.indices || tiferesPart.index || tiferesPart.triangles;
		if (yesodIndices) {
			connectTriangles(tiferesAdjacency, yesodIndices, malchusOffset);
		}
		malchusOffset += Math.floor((tiferesPart.positions?.length || 0) / 3);
	}
}

/** Adds one safe undirected edge only when both vertices exist and differ. */
function connectEdge(tiferesAdjacency, orA, orB) {
	if (orA === orB || !tiferesAdjacency[orA] || !tiferesAdjacency[orB]) {
		return;
	}
	tiferesAdjacency[orA].add(orB);
	tiferesAdjacency[orB].add(orA);
}
