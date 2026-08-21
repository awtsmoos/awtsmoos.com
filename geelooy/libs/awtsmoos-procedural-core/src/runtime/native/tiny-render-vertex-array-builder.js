// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-array-builder.js
 * @description Records immutable geometry declarations and reports one global buffer-state change.
 * The Awtsmoos gives every present attribute its exact vessel; Awtsmoos.com returns to the default
 * doorway and invalidates only the global ARRAY_BUFFER fact altered while the VAO was constructed.
 */

import { ATTRIBUTE_FALLBACKS } from './tiny-render-attribute-fallbacks.js';
import { attributeType } from './tiny-render-webgl-utils.js';

const ATTRIBUTE_NAMES = [
	'position', 'normal', 'color', 'uv', 'zone', 'joints', 'weights'
];

export function createVertexArrayEntry(options) {
	const vertexArray = options.extension.createVertexArrayOES();
	if (!vertexArray) {
		throw new Error('OES vertex array creation returned no vessel.');
	}
	const fallbacks = [];
	options.extension.bindVertexArrayOES(vertexArray);
	try {
		for (const name of ATTRIBUTE_NAMES) {
			configureAttribute({
				enabled: options.skinned || (name !== 'joints' && name !== 'weights'),
				fallbacks,
				gl: options.gl,
				location: options.locations[name],
				name,
				resource: options.resource
			});
		}
		options.gl.bindBuffer(
			options.gl.ELEMENT_ARRAY_BUFFER,
			options.resource.index
		);
	} finally {
		options.extension.bindVertexArrayOES(null);
		options.onHiddenStateChange?.();
	}
	return { fallbacks, vertexArray };
}

function configureAttribute(options) {
	if (!Number.isInteger(options.location) || options.location < 0) return;
	const entry = options.enabled
		? options.resource.attributes[options.name]
		: null;
	if (!entry) {
		options.gl.disableVertexAttribArray(options.location);
		options.fallbacks.push({
			location: options.location,
			values: ATTRIBUTE_FALLBACKS[options.name]
		});
		return;
	}
	options.gl.bindBuffer(options.gl.ARRAY_BUFFER, entry.buffer);
	options.gl.enableVertexAttribArray(options.location);
	options.gl.vertexAttribPointer(
		options.location,
		entry.attribute.itemSize,
		attributeType(options.gl, entry.attribute),
		Boolean(entry.attribute.normalized),
		0,
		0
	);
}
