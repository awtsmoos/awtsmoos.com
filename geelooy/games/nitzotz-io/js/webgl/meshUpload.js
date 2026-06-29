// B"H
import { catalogMesh, catalogNames, meshToTriangles } from '../../../../libs/awtsmoos-procedural/src/index.js';

/** B"H: Each symbolic mesh becomes one buffer, no repeated panic per frame. */
export function uploadCatalog(gl) {
  const out = {};
  for (const name of catalogNames()) out[name] = upload(gl, name);
  out.cube ||= upload(gl, 'cube');
  out.box = out.cube;
  return out;
}

function upload(gl, name) {
  const data = meshToTriangles(catalogMesh(name));
  if (!data.length) throw Error('Empty procedural mesh: ' + name);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return { buffer, count: data.length / 6, name };
}
