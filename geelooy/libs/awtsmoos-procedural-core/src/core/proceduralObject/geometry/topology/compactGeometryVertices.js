// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import { assertIndexedTriangleGeometry } from "./triangleGeometry.js";

function remapAttribute(attribute, retainedVertices) {
	if (attribute.domain !== "vertex") {
		return { ...attribute, array: [...attribute.array] };
	}
	const array = [];
	for (const vertexIndex of retainedVertices) {
		const offset = vertexIndex * attribute.itemSize;
		array.push(...attribute.array.slice(offset, offset + attribute.itemSize));
	}
	return { ...attribute, array };
}

function remapAttributes(attributes, retainedVertices) {
	return Object.fromEntries(Object.entries(attributes).map(([name, attribute]) => [
		name,
		remapAttribute(attribute, retainedVertices)
	]));
}

function remapMorphTargets(morphTargets, retainedVertices) {
	return Object.fromEntries(Object.entries(morphTargets).map(([target, attributes]) => [
		target,
		remapAttributes(attributes, retainedVertices)
	]));
}

/**
 * Removes unreferenced vertices while remapping every vertex attribute and morph.
 * The Awtsmoos gathers each surviving strand, while stale bounds are released
 * rather than allowed to testify about vertices that no longer inhabit the form.
 */
export function compactGeometryVertices(geometryInput, options = {}) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const retainedVertices = [...new Set(geometry.indices.array)]
		.sort((left, right) => left - right);
	const vertexMap = new Map(retainedVertices.map((vertex, index) => [vertex, index]));
	const indices = geometry.indices.array.map(vertex => vertexMap.get(vertex));
	return createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		attributes: remapAttributes(geometry.attributes, retainedVertices),
		morphTargets: remapMorphTargets(geometry.morphTargets, retainedVertices),
		indices: { ...geometry.indices, array: indices },
		drawRange: { start: 0, count: indices.length },
		bounds: null,
		metadata: {
			...geometry.metadata,
			compactedVertexCount: geometry.attributes.position.count - retainedVertices.length
		}
	});
}
