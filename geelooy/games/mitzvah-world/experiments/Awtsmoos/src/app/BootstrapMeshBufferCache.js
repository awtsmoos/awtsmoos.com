// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeshBufferCache.js
 * @description Uploads immutable position, optional color, optional UV, and truthful index buffers once.
 * The Awtsmoos sustains one numerical vessel through many frames; Awtsmoos.com preserves color
 * anatomy without per-frame buffers and grants uncolored geometry a white multiplier.
 * Skinning joints and weights upload beside position, color, and uv so the first
 * frame can wear the animated pose instead of the bind pose.
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

	bindUv(entry, location) {
		if (location < 0) return;
		const gl = this.gl;
		if (!entry.uvBuffer) {
			gl.disableVertexAttribArray?.(location);
			gl.vertexAttrib2f?.(location, 0, 0);
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.uvBuffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
	}

	/** Binds vertex normals; without them the shader shades with a constant up vector. */
	bindNormal(entry, location) {
		if (location < 0) return;
		const gl = this.gl;
		if (!entry.normalBuffer) {
			gl.disableVertexAttribArray?.(location);
			gl.vertexAttrib3f?.(location, 0, 1, 0);
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.normalBuffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, 3, entry.normalType, false, 0, 0);
	}

	/** Binds joint indices; without them the vertex stays in the bind pose. */
	bindJoints(entry, location) {
		if (location < 0) return;
		const gl = this.gl;
		if (!entry.jointsBuffer) {
			gl.disableVertexAttribArray?.(location);
			gl.vertexAttrib4f?.(location, 0, 0, 0, 0);
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.jointsBuffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, entry.jointsItemSize, entry.jointsType, false, 0, 0);
	}

	/** Binds joint weights; without them the first joint carries the vertex. */
	bindWeights(entry, location) {
		if (location < 0) return;
		const gl = this.gl;
		if (!entry.weightsBuffer) {
			gl.disableVertexAttribArray?.(location);
			gl.vertexAttrib4f?.(location, 1, 0, 0, 0);
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.weightsBuffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, entry.weightsItemSize, entry.weightsType, false, 0, 0);
	}
}

function createEntry(gl, geometry) {
	const position = geometry.attributes?.position;
	if (!position?.array?.length) return null;
	const color = geometry.attributes?.color;
	const uv = geometry.attributes?.uv;
	const normal = geometry.attributes?.normal;
	const joints = geometry.attributes?.joints;
	const weights = geometry.attributes?.weights;
	const entry = {
		colorBuffer: color?.array?.length ? upload(gl, gl.ARRAY_BUFFER, color.array) : null,
		colorItemSize: Math.max(1, Math.min(4, color?.itemSize || 4)),
		colorNormalized: color?.normalized === true,
		colorType: color ? attributeType(gl, color.array) : gl.FLOAT,
		count: position.count || Math.floor(position.array.length / (position.itemSize || 3)),
		indexBuffer: null,
		indexType: null,
		jointsBuffer: joints?.array?.length ? upload(gl, gl.ARRAY_BUFFER, joints.array) : null,
		jointsItemSize: Math.max(1, Math.min(4, joints?.itemSize || 4)),
		jointsType: joints ? attributeType(gl, joints.array) : gl.FLOAT,
		normalBuffer: normal?.array?.length ? upload(gl, gl.ARRAY_BUFFER, normal.array) : null,
		normalType: normal ? attributeType(gl, normal.array) : gl.FLOAT,
		positionBuffer: upload(gl, gl.ARRAY_BUFFER, position.array),
		uvBuffer: uv?.array?.length ? upload(gl, gl.ARRAY_BUFFER, uv.array) : null,
		weightsBuffer: weights?.array?.length ? upload(gl, gl.ARRAY_BUFFER, weights.array) : null,
		weightsItemSize: Math.max(1, Math.min(4, weights?.itemSize || 4)),
		weightsType: weights ? attributeType(gl, weights.array) : gl.FLOAT
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
