//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mirrorMeshGeometry.js
 * @description Mirrors selected polygon geometry across X, Y, or Z inside the same indexed mesh, correcting winding and optionally reusing vertices already on the mirror plane.
 * The Awtsmoos contains left and right before reflection divides the sight; Awtsmoos.com lets one wing, door, hull half, rotor detail, or spacecraft panel become its partner without another mesh flight.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { appendMeshVertexAttributes } from './copyMeshVertexAttributes.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns one mesh containing source geometry plus a mirrored copy of selected faces. */
export function mirrorMeshGeometry(input, selection = 'all', options = {}) {
	const mesh = createEditableMesh(input);
	const faceIndices = resolveMeshSelection(mesh, 'faces', selection);
	const sourceVertices = selectedVertexIndices(mesh, faceIndices);
	const vertices = mesh.vertices.map(vertex => [...vertex]);
	const vertexMap = createMirrorVertexMap(mesh, sourceVertices, vertices, options);
	const mirroredFaces = faceIndices.map(faceIndex => mirrorFace(
		mesh.faces[faceIndex],
		vertexMap,
		options
	));
	let attributes = appendMeshVertexAttributes(
		mesh.attributes,
		sourceVertices.filter(index => vertexMap.get(index) >= mesh.vertices.length),
		{
			vertexCount: mesh.vertices.length,
			mirrorAxis: options.axis || 'x'
		}
	);
	attributes = addMirrorGroup(attributes, options.groupId, vertexMap, faceIndices, mesh.faces.length);
	return createEditableMesh({
		...mesh,
		vertices,
		faces: [...mesh.faces, ...mirroredFaces],
		attributes,
		selections: { vertices: mesh.selections.vertices, edges: {}, faces: {} }
	});
}

function selectedVertexIndices(mesh, faceIndices) {
	const values = new Set();
	for (const faceIndex of faceIndices) {
		for (const vertexIndex of mesh.faces[faceIndex].vertices) {
			values.add(vertexIndex);
		}
	}
	return [...values].sort((left, right) => left - right);
}

function createMirrorVertexMap(mesh, sourceIndices, vertices, options) {
	const axis = axisIndex(options.axis || 'x');
	const origin = Number(options.origin ?? 0);
	const weldPlane = options.weldPlane !== false;
	const epsilon = Math.max(0, Number(options.epsilon ?? 1e-9));
	const map = new Map();
	for (const sourceIndex of sourceIndices) {
		const source = mesh.vertices[sourceIndex];
		if (weldPlane && Math.abs(source[axis] - origin) <= epsilon) {
			map.set(sourceIndex, sourceIndex);
			continue;
		}
		const mirrored = [...source];
		mirrored[axis] = origin - (source[axis] - origin);
		vertices.push(mirrored);
		map.set(sourceIndex, vertices.length - 1);
	}
	return map;
}

function mirrorFace(face, vertexMap, options) {
	return {
		...face,
		id: `${face.id}:mirror:${options.axis || 'x'}`,
		vertices: face.vertices.map(index => vertexMap.get(index)).reverse(),
		metadata: { ...face.metadata, generatedBy: 'mirror' }
	};
}

function addMirrorGroup(attributes, groupId, vertexMap, faceIndices, faceOffset) {
	if (!groupId) {
		return attributes;
	}
	return {
		...attributes,
		groups: {
			...(attributes.groups || {}),
			[String(groupId)]: {
				id: String(groupId),
				vertices: [...new Set(vertexMap.values())].sort((a, b) => a - b),
				edges: [],
				faces: faceIndices.map((faceIndex, index) => faceOffset + index),
				material: null,
				metadata: { generatedBy: 'mirror' }
			}
		}
	};
}

function axisIndex(axis) {
	if (!['x', 'y', 'z'].includes(axis)) {
		throw new TypeError('B"H | Mirror axis must be x, y, or z.');
	}
	return axis === 'y' ? 1 : axis === 'z' ? 2 : 0;
}
