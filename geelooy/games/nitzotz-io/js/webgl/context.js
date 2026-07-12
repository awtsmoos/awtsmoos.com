// B"H
import { locations } from './locations.js';
import { uploadCatalog } from './meshUpload.js';
import { makeProgram } from './program.js';
import { FS, VS } from './shaders.js';

/** Create a double-sided material-aware WebGL vessel for procedural models. */
export function createGL(canvas) {
	const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' });
	if (!gl) throw new Error('WebGL unavailable');
	const program = makeProgram(gl, VS, FS);
	const api = { gl, program, meshes: uploadCatalog(gl), loc: locations(gl, program) };
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.disable(gl.CULL_FACE);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	return api;
}

/** Bind position, normal, and procedural material RGBA from one buffer. */
export function bindMesh(renderer, mesh) {
	const { gl, loc } = renderer;
	const stride = 40;
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
	gl.enableVertexAttribArray(loc.aPos);
	gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(loc.aNormal);
	gl.vertexAttribPointer(loc.aNormal, 3, gl.FLOAT, false, stride, 12);
	gl.enableVertexAttribArray(loc.aColor);
	gl.vertexAttribPointer(loc.aColor, 4, gl.FLOAT, false, stride, 24);
}
