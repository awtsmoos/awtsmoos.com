//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file queryMeshSelection.js
 * @description Resolves JSON-safe semantic queries into deterministic vertex or face selections by group, material, metadata, component identity, bounds, or proximity.
 * The Awtsmoos knows every point and surface before a query gives them a finite name; Awtsmoos.com lets editors ask for meaning instead of memorizing indices in the frame.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { editableMeshFaceCentroid } from './meshFaceGeometry.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns sorted indices matching one JSON-safe query in the requested topology domain. */
export function queryMeshSelection(input, domain, query = {}) {
	const mesh = createEditableMesh(input);
	if (query.selection !== undefined || query.indices !== undefined) {
		return resolveMeshSelection(
			mesh,
			domain,
			query.selection ?? query.indices
		);
	}
	const maximum = domain === 'vertices'
		? mesh.vertices.length
		: domain === 'faces'
			? mesh.faces.length
			: 0;
	if (!maximum && !['vertices', 'faces'].includes(domain)) {
		throw new TypeError('B"H | Mesh queries currently support vertices or faces.');
	}
	const indices = Array.from({ length: maximum }, (_, index) => index);
	return indices.filter(index => matchesQuery(mesh, domain, index, query));
}

/** Tests one indexed topology element against every supplied query clause. */
function matchesQuery(mesh, domain, index, query) {
	if (query.group && !matchesGroup(mesh, domain, index, query.group)) {
		return false;
	}
	if (domain === 'faces' && query.material !== undefined && mesh.faces[index].material !== query.material) {
		return false;
	}
	if (domain === 'faces' && query.componentId && mesh.faces[index].metadata?.componentId !== query.componentId) {
		return false;
	}
	if (domain === 'faces' && query.metadata && !matchesMetadata(mesh.faces[index].metadata, query.metadata)) {
		return false;
	}
	if (query.bounds && !insideBounds(elementPoint(mesh, domain, index), query.bounds)) {
		return false;
	}
	if (query.near && !insideRadius(elementPoint(mesh, domain, index), query.near)) {
		return false;
	}
	return true;
}

/** Checks membership in one named semantic group stored inside mesh attributes. */
function matchesGroup(mesh, domain, index, groupId) {
	const group = mesh.attributes?.groups?.[String(groupId)];
	if (!group) {
		return false;
	}
	const values = domain === 'vertices' ? group.vertices : group.faces;
	return Array.isArray(values) && values.includes(index);
}

/** Returns vertex position or polygon centroid for spatial queries. */
function elementPoint(mesh, domain, index) {
	return domain === 'vertices'
		? mesh.vertices[index]
		: editableMeshFaceCentroid(mesh, mesh.faces[index]);
}

function matchesMetadata(metadata = {}, query = {}) {
	return Object.entries(query).every(([key, value]) => metadata?.[key] === value);
}

function insideBounds(point, bounds = {}) {
	const minimum = bounds.min || [-Infinity, -Infinity, -Infinity];
	const maximum = bounds.max || [Infinity, Infinity, Infinity];
	return point.every((value, axis) => value >= minimum[axis] && value <= maximum[axis]);
}

function insideRadius(point, query = {}) {
	const center = query.position || query.center || [0, 0, 0];
	const radius = Number(query.radius ?? 0);
	const distance = Math.hypot(...point.map((value, axis) => value - Number(center[axis] || 0)));
	return Number.isFinite(radius) && distance <= radius;
}
