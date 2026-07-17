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

/**
 * Returns a geometry with one arbitrary attribute replaced or added.
 *
 * @param {object} geometry Source geometry.
 * @param {string} name Attribute name.
 * @param {object} declaration Attribute declaration.
 * @param {string} id Output id.
 * @returns {object} Updated geometry.
 */
export function setGeometryAttribute(geometry, name, declaration, id = geometry.id) {
	return createGeometryArtifact({
		...geometry,
		id,
		attributes: {
			...geometry.attributes,
			[name]: declaration
		}
	});
}

/**
 * Returns a geometry without one named attribute.
 *
 * @param {object} geometry Source geometry.
 * @param {string} name Attribute name.
 * @param {string} id Output id.
 * @returns {object} Updated geometry.
 */
export function removeGeometryAttribute(geometry, name, id = geometry.id) {
	const attributes = {...geometry.attributes};
	delete attributes[name];
	return createGeometryArtifact({
		...geometry,
		id,
		attributes
	});
}

/**
 * Returns a geometry with a new index stream.
 *
 * @param {object} geometry Source geometry.
 * @param {object|number[]} indices Index declaration.
 * @param {string} id Output id.
 * @returns {object} Updated geometry.
 */
export function setGeometryIndices(geometry, indices, id = geometry.id) {
	return createGeometryArtifact({
		...geometry,
		id,
		indices
	});
}
