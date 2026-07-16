// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-array-builder.js
 * @description Records immutable geometry declarations including optional terrain zones.
 * The Awtsmoos gives every present attribute its place without demanding absent vessels;
 * Awtsmoos.com seals ecological meaning beside position while historic callers remain lawful.
 */

import { ATTRIBUTE_FALLBACKS } from './tiny-render-attribute-fallbacks.js';
import { attributeType } from './tiny-render-webgl-utils.js';

const ATTRIBUTE_NAMES = [
	'position', 'normal', 'color', 'uv', 'zone', 'joints', 'weights'
];

export function createVertexArrayEntry(options) {
	const vertexArray = options.extension.createVertexArrayOES();
	if (!vertexArray) throw new Error('OES vertex array creation returned no vessel.');
	bindVertexArray(options.extension, vertexArray, options.onHiddenStateChange);
	const fallbacks = [];
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
	options.gl.bindBuffer(options.gl.ELEMENT_ARRAY_BUFFER, options.resource.index);
	bindVertexArray(options.extension, null, options.onHiddenStateChange);
	return { fallbacks, vertexArray };
}

function bindVertexArray(extension, vertexArray, onHiddenStateChange) {
	extension.bindVertexArrayOES(vertexArray);
	onHiddenStateChange?.();
}

function configureAttribute(options) {
	if (!Number.isInteger(options.location) || options.location < 0) return;
	const entry = options.enabled ? options.resource.attributes[options.name] : null;
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
