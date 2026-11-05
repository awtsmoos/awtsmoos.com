// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-buffer-resources.js
 * @description Creates immutable buffers including ecological terrain-zone weights.
 * The Awtsmoos gives every vertex both place and meaning; Awtsmoos.com preserves full
 * geometry while meadow, lake, stream, and hill weights enter one resident GPU vessel.
 */

const ATTRIBUTE_NAMES = [
	'position',
	'normal',
	'color',
	'uv',
	'zone',
	'joints',
	'weights'
];

export class RenderBufferResources {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
	}

	has(geometry) {
		return Boolean(geometry && this.cache.has(geometry));
	}

	forMesh(mesh) {
		const geometry = mesh?.geometry;
		if (!geometry) return null;
		const existing = this.cache.get(geometry);
		if (existing) return existing;
		const position = geometry.attributes?.position;
		if (!position) return null;
		const resource = this.createResource(geometry, position);
		this.cache.set(geometry, resource);
		return resource;
	}

	createResource(geometry, position) {
		const attributes = {};
		for (const name of ATTRIBUTE_NAMES) {
			const attribute = geometry.attributes?.[name];
			attributes[name] = attribute
				? {
					attribute,
					buffer: this.createBuffer(this.gl.ARRAY_BUFFER, attribute.array)
				}
				: null;
		}
		const resource = {
			attributes,
			count: position.count,
			geometry,
			index: null,
			indexType: null,
			mode: geometry.mode ?? 4
		};
		if (geometry.index) this.addIndex(resource, geometry.index);
		return resource;
	}

	createBuffer(target, data) {
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(target, buffer);
		this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
		return buffer;
	}

	addIndex(resource, index) {
		if (index.array instanceof Uint32Array) this.gl.getExtension('OES_element_index_uint');
		resource.index = this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index.array);
		resource.indexType = index.array instanceof Uint32Array
			? this.gl.UNSIGNED_INT
			: this.gl.UNSIGNED_SHORT;
		resource.count = index.count;
	}
}
