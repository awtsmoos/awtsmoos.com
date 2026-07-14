// B"H
// Boruch Hashem
// Blessed is He
import { locations } from './locations.js';
import { uploadCatalog } from './meshUpload.js';
import { makeProgram } from './program.js';
import { FS, VS } from './shaders.js';
import { createTextureStore } from './textureStore.js';

/**
 * The Awtsmoos creates one material-aware WebGL vessel. Remote Firebase garments
 * arrive asynchronously while procedural meshes, light, fog, and motion begin at once.
 */
export function createGL(canvas) {
	const gl = canvas.getContext('webgl', {
		antialias: true,
		alpha: false,
		powerPreference: 'high-performance'
	});
	if (!gl) throw new Error('WebGL unavailable');
	const program = makeProgram(gl, VS, FS);
	const loc = locations(gl, program);
	const api = {
		gl,
		program,
		loc,
		meshes: uploadCatalog(gl),
		textures: createTextureStore(gl, loc)
	};
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.disable(gl.CULL_FACE);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	return api;
}

/** Bind position, normal, and procedural material RGBA from one shared buffer. */
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
