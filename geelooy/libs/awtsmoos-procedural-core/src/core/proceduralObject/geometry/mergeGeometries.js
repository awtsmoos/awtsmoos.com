// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createGeometryArtifact,
	getGeometryVertexCount
} from "../artifact/createGeometryArtifact.js";

function attributeCatalog(geometries) {
	const catalog = {};
	for (const geometry of geometries) {
		for (const [name, attribute] of Object.entries(geometry.attributes)) {
			const current = catalog[name];
			if (current && (
				current.itemSize !== attribute.itemSize
				|| current.componentType !== attribute.componentType
			)) {
				throw new Error(`B"H | Attribute layout mismatch: ${name}`);
			}
			catalog[name] = {
				itemSize: attribute.itemSize,
				componentType: attribute.componentType,
				normalized: attribute.normalized,
				domain: attribute.domain,
				usage: attribute.usage,
				semantic: attribute.semantic
			};
		}
	}
	return catalog;
}

function sourceIndices(geometry, vertexCount) {
	if (geometry.indices) {
		return geometry.indices.array;
	}
	return Array.from({length: vertexCount}, (_, index) => index);
}

/**
 * Merges compatible geometries while preserving arbitrary named attributes.
 *
 * Missing attributes are zero-filled, allowing custom channels to remain
 * explicit instead of forcing renderer-specific buffer assumptions.
 *
 * @param {object[]} geometries Source geometries.
 * @param {string} id Output id.
 * @returns {object} Merged geometry artifact.
 */
export function mergeGeometries(geometries, id = "merged") {
	if (!geometries.length) {
		return createGeometryArtifact({id});
	}
	const topology = geometries[0].topology;
	if (geometries.some((geometry) => geometry.topology !== topology)) {
		throw new Error('B"H | Merged geometries require matching topology.');
	}
	const catalog = attributeCatalog(geometries);
	const attributes = {};
	for (const [name, layout] of Object.entries(catalog)) {
		attributes[name] = {
			...layout,
			array: []
		};
	}
	const indices = [];
	const groups = [];
	let vertexOffset = 0;
	let indexOffset = 0;

	for (const geometry of geometries) {
		const vertexCount = getGeometryVertexCount(geometry);
		for (const [name, target] of Object.entries(attributes)) {
			const source = geometry.attributes[name];
			const values = source?.array
				?? new Array(vertexCount * target.itemSize).fill(0);
			target.array.push(...values);
		}
		const localIndices = sourceIndices(geometry, vertexCount);
		indices.push(...localIndices.map((index) => index + vertexOffset));
		for (const group of geometry.groups || []) {
			groups.push({
				...group,
				start: group.start + indexOffset
			});
		}
		vertexOffset += vertexCount;
		indexOffset += localIndices.length;
	}
	return createGeometryArtifact({
		id,
		topology,
		attributes,
		indices,
		groups
	});
}
