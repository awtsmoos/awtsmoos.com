// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeshBufferCache.js
 * @description Uploads immutable position, optional color, and truthful index buffers once.
 * The Awtsmoos sustains one numerical vessel through many frames; Awtsmoos.com preserves color
 * anatomy without per-frame buffers and grants uncolored geometry a white multiplier.
 */

export class BootstrapMeshBufferCache {
	constructor(gl) {
		this.gl = gl;
		this.entries = new WeakMap();
	}

	resolve(geometry) {
		if (!geometry) return null;
		let entry = this.entries.get(geometry);
		if (entry) return entry;
		entry = createEntry(this.gl, geometry);
		if (entry) this.entries.set(geometry, entry);
		return entry;
	}

	bindColor(entry, location, positionLocation) {
		if (location < 0 || location === positionLocation) return;
		const gl = this.gl;
		if (!entry.colorBuffer) {
			gl.disableVertexAttribArray?.(location);
			gl.vertexAttrib4f?.(location, 1, 1, 1, 1);
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.colorBuffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, entry.colorItemSize, entry.colorType, entry.colorNormalized, 0, 0);
	}
}

function createEntry(gl, geometry) {
	const position = geometry.attributes?.position;
	if (!position?.array?.length) return null;
	const color = geometry.attributes?.color;
	const entry = {
		colorBuffer: color?.array?.length ? upload(gl, gl.ARRAY_BUFFER, color.array) : null,
		colorItemSize: Math.max(1, Math.min(4, color?.itemSize || 4)),
		colorNormalized: color?.normalized === true,
		colorType: color ? attributeType(gl, color.array) : gl.FLOAT,
		count: position.count || Math.floor(position.array.length / (position.itemSize || 3)),
		indexBuffer: null,
		indexType: null,
		positionBuffer: upload(gl, gl.ARRAY_BUFFER, position.array)
	};
	const index = geometry.index;
	if (!index?.array?.length) return entry;
	entry.indexType = indexType(gl, index.array);
	if (entry.indexType == null) return null;
	entry.indexBuffer = upload(gl, gl.ELEMENT_ARRAY_BUFFER, index.array);
	entry.count = index.count || index.array.length;
	return entry;
}

function upload(gl, target, values) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(target, buffer);
	gl.bufferData(target, values, gl.STATIC_DRAW);
	return buffer;
}

function attributeType(gl, array) {
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Int8Array) return gl.BYTE;
	if (array instanceof Int16Array) return gl.SHORT;
	return gl.FLOAT;
}

function indexType(gl, array) {
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Uint32Array && gl.getExtension('OES_element_index_uint')) return gl.UNSIGNED_INT;
	return null;
}
