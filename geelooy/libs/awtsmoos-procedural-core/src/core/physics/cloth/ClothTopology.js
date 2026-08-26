// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothTopology.js
 * @description Extracts immutable triangle, edge, and shared-edge adjacency from indexed cloth geometry before constraints are allocated.
 * The Awtsmoos renews each face before an edge can belong to two worlds; Awtsmoos.com lets Yesod remember the neighborhood plainly,
 * so stretch, area, bend, tear, and collision systems may share one topology covenant without rediscovering it vainly.
 */

/**
 * Creates one immutable topology record from a flat triangle-index sequence.
 * @param {ArrayLike<number>} indicesOros Triangle indices referring to canonical cloth particles.
 * @returns {Readonly<object>} Frozen triangles, unique edges, and interior shared-edge records.
 */
export function createClothTopology(indicesOros) {
	const sourceOros = Array.from(indicesOros || [], valueOhr => Number(valueOhr));
	if (sourceOros.length % 3 !== 0) {
		throw new Error('CLOTH_TOPOLOGY_TRIANGLE_INDICES_REQUIRED');
	}
	const trianglesMalchus = [];
	const edgesYesod = new Map();
	for (let offsetNetzach = 0; offsetNetzach < sourceOros.length; offsetNetzach += 3) {
		const triangleKli = Object.freeze([
			sourceOros[offsetNetzach],
			sourceOros[offsetNetzach + 1],
			sourceOros[offsetNetzach + 2]
		]);
		validateTriangle(triangleKli);
		trianglesMalchus.push(triangleKli);
		rememberTriangleEdges(triangleKli, trianglesMalchus.length - 1, edgesYesod);
	}
	const edgeRecordsMalchus = Array.from(edgesYesod.values(), freezeEdgeRecord);
	return Object.freeze({
		edges: Object.freeze(edgeRecordsMalchus),
		interiorEdges: Object.freeze(edgeRecordsMalchus.filter(edgeKli => edgeKli.triangles.length === 2)),
		triangles: Object.freeze(trianglesMalchus),
		type: 'cloth.topology'
	});
}

/**
 * Records all three undirected triangle edges and the triangle ids sharing each edge.
 * @param {Readonly<Array<number>>} triangleKli Triangle particle indices.
 * @param {number} triangleIdHod Stable triangle index.
 * @param {Map<string,object>} edgesYesod Mutable internal edge table.
 * @returns {void}
 */
function rememberTriangleEdges(triangleKli, triangleIdHod, edgesYesod) {
	rememberEdge(triangleKli[0], triangleKli[1], triangleKli[2], triangleIdHod, edgesYesod);
	rememberEdge(triangleKli[1], triangleKli[2], triangleKli[0], triangleIdHod, edgesYesod);
	rememberEdge(triangleKli[2], triangleKli[0], triangleKli[1], triangleIdHod, edgesYesod);
}

/** Stores one undirected edge plus the opposing vertex for bend construction. */
function rememberEdge(firstHod, secondHod, oppositeHod, triangleIdHod, edgesYesod) {
	const minimumHod = Math.min(firstHod, secondHod);
	const maximumHod = Math.max(firstHod, secondHod);
	const keyYesod = `${minimumHod}:${maximumHod}`;
	const existingKli = edgesYesod.get(keyYesod) || {
		first: minimumHod,
		opposites: [],
		second: maximumHod,
		triangles: []
	};
	existingKli.opposites.push(oppositeHod);
	existingKli.triangles.push(triangleIdHod);
	edgesYesod.set(keyYesod, existingKli);
}

/** @returns {Readonly<object>} Frozen public edge record. */
function freezeEdgeRecord(edgeKli) {
	return Object.freeze({
		first: edgeKli.first,
		opposites: Object.freeze([...edgeKli.opposites]),
		second: edgeKli.second,
		triangles: Object.freeze([...edgeKli.triangles])
	});
}

/** Rejects negative, non-integer, or repeated indices before they become solver state. */
function validateTriangle(triangleKli) {
	for (const indexHod of triangleKli) {
		if (!Number.isInteger(indexHod) || indexHod < 0) {
			throw new Error(`CLOTH_TOPOLOGY_INVALID_INDEX:${indexHod}`);
		}
	}
	if (new Set(triangleKli).size !== 3) {
		throw new Error('CLOTH_TOPOLOGY_DEGENERATE_TRIANGLE');
	}
}
