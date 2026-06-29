// B"H
import { locations } from './locations.js';
import { uploadCatalog } from './meshUpload.js';
import { makeProgram } from './program.js';
import { FS, VS } from './shaders.js';

/** B"H: The raw context is born, configured, and kept small. */
export function createGL(canvas) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) throw Error('WebGL unavailable');
  const program = makeProgram(gl, VS, FS);
  const api = { gl, program, meshes: uploadCatalog(gl), loc: locations(gl, program) };
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return api;
}

export function bindMesh(renderer, mesh) {
  const gl = renderer.gl, loc = renderer.loc;
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  gl.enableVertexAttribArray(loc.aPos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(loc.aNormal); gl.vertexAttribPointer(loc.aNormal, 3, gl.FLOAT, false, 24, 12);
}
