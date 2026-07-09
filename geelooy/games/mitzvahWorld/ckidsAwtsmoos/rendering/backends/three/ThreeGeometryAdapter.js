// B"H
/** @file ThreeGeometryAdapter.js @description Converts Awtsmoos mesh arrays into Three geometry in one sealed place. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
function maxOf(values = []) { let max = 0; for (let i = 0; i < values.length; i++) if (values[i] > max) max = values[i]; return max; }
function f32(values = [], size = 3) { return new THREE.Float32BufferAttribute(new Float32Array(values), size); }
function skinIndex(values = []) { return new THREE.Uint16BufferAttribute(new Uint16Array(values), 4); }
function indexAttr(values = []) { return maxOf(values) > 65535 ? new THREE.BufferAttribute(new Uint32Array(values), 1) : new THREE.BufferAttribute(new Uint16Array(values), 1); }
export function createThreeGeometry(data = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", f32(data.positions, 3));
  if (data.normals && data.normals.length) geo.setAttribute("normal", f32(data.normals, 3));
  if (data.uvs && data.uvs.length) geo.setAttribute("uv", f32(data.uvs, 2));
  if (data.colors && data.colors.length) geo.setAttribute("color", f32(data.colors, 3));
  if (data.skinIndices && data.skinIndices.length) geo.setAttribute("skinIndex", skinIndex(data.skinIndices));
  if (data.skinWeights && data.skinWeights.length) geo.setAttribute("skinWeight", f32(data.skinWeights, 4));
  if (data.indices && data.indices.length) geo.setIndex(indexAttr(data.indices));
  if (!data.preserveNormals) geo.computeVertexNormals();
  geo.computeBoundingBox(); geo.computeBoundingSphere();
  geo.userData.awtsmoosAbstractGeometry = true;
  geo.userData.vertexCount = (data.positions || []).length / 3;
  return geo;
}
export default createThreeGeometry;
