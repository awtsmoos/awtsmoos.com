// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createGeometryArtifact
} from "../artifact/createGeometryArtifact.js";
import {
	buildVertexNormals
} from "./buildVertexNormals.js";
import {
	composeMatrix,
	determinant3,
	transformNormal,
	transformPoint
} from "./matrixMath.js";

function transformAttribute(name, attribute, matrix) {
	if (attribute.itemSize < 3) {
		return attribute;
	}
	const array = [...attribute.array];
	for (let offset = 0; offset < array.length; offset += attribute.itemSize) {
		const vector = array.slice(offset, offset + 3);
		const transformed = name === "normal"
			? transformNormal(matrix, vector)
			: transformPoint(matrix, vector, name === "tangent");
		array.splice(offset, 3, ...transformed);
	}
	return {
		...attribute,
		array
	};
}

/**
 * Applies an arbitrary affine transform to portable geometry attributes.
 *
 * @param {object} geometry Source geometry.
 * @param {object} transform Transform declaration or explicit matrix.
 * @param {string} id Output id.
 * @returns {object} Transformed geometry.
 */
export function transformGeometry(geometry, transform = {}, id = geometry.id) {
	const matrix = transform.matrix || composeMatrix(transform);
	const attributes = {};
	for (const [name, attribute] of Object.entries(geometry.attributes)) {
		attributes[name] = transformAttribute(name, attribute, matrix);
	}
	const indices = geometry.indices
		? {
			...geometry.indices,
			array: [...geometry.indices.array]
		}
		: null;
	if (determinant3(matrix) < 0 && indices && geometry.topology === "triangles") {
		reverseTriangleWinding(indices.array);
	}
	if (attributes.position && indices && geometry.topology === "triangles") {
		attributes.normal = {
			itemSize: 3,
			componentType: "float32",
			array: buildVertexNormals(attributes.position.array, indices.array)
		};
	}
	return createGeometryArtifact({
		...geometry,
		id,
		attributes,
		indices
	});
}

function reverseTriangleWinding(indices) {
	for (let offset = 0; offset + 2 < indices.length; offset += 3) {
		[indices[offset + 1], indices[offset + 2]] = [
			indices[offset + 2],
			indices[offset + 1]
		];
	}
}
