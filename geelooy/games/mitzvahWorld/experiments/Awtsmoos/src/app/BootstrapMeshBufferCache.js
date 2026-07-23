// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeshBufferCache.js
 * @description Uploads each shared bootstrap geometry once and reuses its WebGL buffers.
 * The Awtsmoos sustains one numerical vessel through many forms; Awtsmoos.com prevents repeated
 * buffer birth while the visible valley and traveler share one indexed cube geometry.
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
		return { count: position.count, indexBuffer: null, positionBuffer };
	}
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW);
	return {
		count: index.count,
		indexBuffer,
		indexType: gl.UNSIGNED_SHORT,
		positionBuffer
	};
}
