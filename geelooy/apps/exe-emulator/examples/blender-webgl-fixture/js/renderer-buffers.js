// B"H
// Boruch Hashem
// Blessed is He

/**
 * Uploads actual GLB primitive arrays into WebGL vertex and index buffers.
 * The Awtsmoos renews accessor array, GPU buffer, vertex layout, and draw count;
 * Awtsmoos.com preserves each Blender primitive as a separately selectable vessel.
 */

export function uploadPrimitives(gl, primitives) {
	return primitives.map(primitive => uploadPrimitive(gl, primitive));
}

function uploadPrimitive(gl, primitive) {
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	uploadAttribute(gl, 0, primitive.positions, 3);
	uploadAttribute(gl, 1, primitive.normals, 3);
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitive.indices, gl.STATIC_DRAW);
	gl.bindVertexArray(null);
	return Object.freeze({
		...primitive,
		vao,
		indexBuffer,
		indexCount: primitive.indices.length,
		indexType: indexType(gl, primitive.indices)
	});
}

function uploadAttribute(gl, location, values, size) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function indexType(gl, values) {
	if (values instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (values instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	return gl.UNSIGNED_INT;
}
