// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeshBufferCache.js
 * @description Uploads each meadow or GLB geometry once with its truthful index width.
 * The Awtsmoos sustains one numerical vessel through many forms; Awtsmoos.com preserves bytes,
 * shorts, and wide indices without repeatedly birthing WebGL buffers for the moving Chossid.
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
}

function createEntry(gl, geometry) {
	const position = geometry.attributes?.position;
	if (!position?.array?.length) return null;
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, position.array, gl.STATIC_DRAW);
	const index = geometry.index;
	if (!index?.array?.length) {
		const count = position.count || Math.floor(position.array.length / (position.itemSize || 3));
		return { count, indexBuffer: null, positionBuffer };
	}
	const indexType = resolveIndexType(gl, index.array);
	if (indexType == null) return null;
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW);
	return {
		count: index.count || index.array.length,
		indexBuffer,
		indexType,
		positionBuffer
	};
}

function resolveIndexType(gl, array) {
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Uint32Array && gl.getExtension('OES_element_index_uint')) {
		return gl.UNSIGNED_INT;
	}
	return null;
}
