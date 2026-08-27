//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file transformMeshSelectionSet.js
 * @description Grows, shrinks, or inverts deterministic vertex, edge, and face selections using actual editable-mesh topology.
 * The Awtsmoos knows chosen and unchosen before finite editing divides them; Awtsmoos.com lets selection flow across adjacency as portable indices so edit-mode power does not depend on a renderer screen.
 */

import { createEditableMeshTopology } from './meshTopology.js';
import { meshEdges, resolveMeshSelection } from './meshSelection.js';

/**
 * Grows one selection by a single adjacency ring.
 * @param {object} mesh Editable mesh definition.
 * @param {'vertices'|'edges'|'faces'} domain Topology domain.
 * @param {string|Array<number>|object} selection Starting selection.
 * @returns {Array<number>} Sorted deterministic grown indices.
 */
export function growMeshSelection(mesh, domain, selection) {
	const selected = new Set(resolveMeshSelection(mesh, domain, selection));
	for (const index of [...selected]) {
		for (const neighbor of neighborsFor(mesh, domain, index)) {
			selected.add(neighbor);
		}
	}
	return [...selected].sort((left, right) => left - right);
}

/** Shrinks one selection by removing elements that touch an unselected topological neighbor. */
export function shrinkMeshSelection(mesh, domain, selection) {
	const selected = new Set(resolveMeshSelection(mesh, domain, selection));
	return [...selected]
		.filter(index => neighborsFor(mesh, domain, index).every(neighbor => selected.has(neighbor)))
		.sort((left, right) => left - right);
}

/** Returns every element in the selected topology domain that was not previously selected. */
export function invertMeshSelection(mesh, domain, selection) {
	const selected = new Set(resolveMeshSelection(mesh, domain, selection));
	const maximum = domainSize(mesh, domain);
	return Array.from({ length: maximum }, (_, index) => index)
		.filter(index => !selected.has(index));
}

/** Returns adjacent element indices for the requested topology domain. */
function neighborsFor(mesh, domain, index) {
	const topology = createEditableMeshTopology(mesh);
	if (domain === 'faces') {
		return topology.faceNeighbors[index] || [];
	}
	if (domain === 'vertices') {
		return vertexNeighbors(topology.edges, index);
	}
	if (domain === 'edges') {
		return edgeNeighbors(topology.edges, index);
	}
	throw new TypeError(`B"H | Unsupported mesh selection domain: ${domain}`);
}

/** Returns all vertices connected to one vertex by an existing mesh edge. */
function vertexNeighbors(edges, vertexIndex) {
	const neighbors = new Set();
	for (const [first, second] of edges) {
		if (first === vertexIndex) {
			neighbors.add(second);
		}
		if (second === vertexIndex) {
			neighbors.add(first);
		}
	}
	return [...neighbors];
}

/** Returns all edges sharing at least one endpoint with the indexed edge. */
function edgeNeighbors(edges, edgeIndex) {
	const edge = edges[edgeIndex];
	if (!edge) {
		return [];
	}
	return edges
		.map((candidate, index) => ({ candidate, index }))
		.filter(entry => entry.index !== edgeIndex && entry.candidate.some(vertex => edge.includes(vertex)))
		.map(entry => entry.index);
}

/** Returns element count for one topology domain. */
function domainSize(mesh, domain) {
	if (domain === 'vertices') {
		return mesh.vertices.length;
	}
	if (domain === 'faces') {
		return mesh.faces.length;
	}
	if (domain === 'edges') {
		return meshEdges(mesh).length;
	}
	throw new TypeError(`B"H | Unsupported mesh selection domain: ${domain}`);
}
