/**
 * B"H
 * @file bufferGeometry.js
 * @description
 * Converts Awtsmoos procedural render data into THREE.BufferGeometry.
 */

/**
 * Reads a render-data attribute by common names.
 *
 * @param {Object} data
 * Render data returned by the procedural core.
 *
 * @param {string[]} names
 * Candidate attribute names.
 *
 * @returns {Array|TypedArray|null}
 * Attribute values or null.
 */
function readAny(data, names) {
  for (const name of names) {
    if (data && data[name]) return data[name];
  }

  return null;
}

/**
 * Attaches a typed BufferAttribute to a geometry when data exists.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {any} geometry
 * THREE.BufferGeometry.
 *
 * @param {string} name
 * Attribute name.
 *
 * @param {Array|TypedArray|null} values
 * Raw values.
 *
 * @param {number} itemSize
 * Item size.
 *
 * @returns {void}
 * Mutates geometry.
 */
function setAttribute(THREE, geometry, name, values, itemSize) {
  if (!values || values.length === 0) return;

  const typed = values instanceof Float32Array ? values : new Float32Array(values);
  geometry.setAttribute(name, new THREE.BufferAttribute(typed, itemSize));
}

/**
 * Creates a THREE.BufferGeometry from Awtsmoos render data.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} renderData
 * Data from generateProceduralGeometry or meshToRenderData.
 *
 * @param {Object} [options={}]
 * Conversion options.
 *
 * @param {boolean} [options.computeNormalsIfMissing=true]
 * Compute normals when no normal attribute exists.
 *
 * @returns {any}
 * THREE.BufferGeometry.
 */
export function createAwtsmoosThreeBufferGeometry(THREE, renderData, options = {}) {
  if (!THREE || !THREE.BufferGeometry || !THREE.BufferAttribute) {
    throw new Error("B\"H | THREE namespace with BufferGeometry and BufferAttribute is required");
  }

  if (!renderData || typeof renderData !== "object") {
    throw new Error("B\"H | renderData object is required");
  }

  const geometry = new THREE.BufferGeometry();
  const positions = readAny(renderData, ["positions", "position", "vertices"]);
  const normals = readAny(renderData, ["normals", "normal"]);
  const uvs = readAny(renderData, ["uvs", "uv"]);
  const colors = readAny(renderData, ["colors", "color"]);
  const indices = readAny(renderData, ["indices", "index", "triangles"]);

  setAttribute(THREE, geometry, "position", positions, 3);
  setAttribute(THREE, geometry, "normal", normals, 3);
  setAttribute(THREE, geometry, "uv", uvs, 2);

  if (colors) {
    const itemSize = colors.length % 4 === 0 ? 4 : 3;
    setAttribute(THREE, geometry, "color", colors, itemSize);
  }

  if (indices && indices.length) {
    let maxIndex = 0;
    for (let i = 0; i < indices.length; i++) maxIndex = Math.max(maxIndex, indices[i]);
    const typed = indices instanceof Uint16Array || indices instanceof Uint32Array
      ? indices
      : maxIndex > 65535
        ? new Uint32Array(indices)
        : new Uint16Array(indices);
    geometry.setIndex(new THREE.BufferAttribute(typed, 1));
  }

  if (!geometry.getAttribute("normal") && options.computeNormalsIfMissing !== false) {
    geometry.computeVertexNormals();
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

export default createAwtsmoosThreeBufferGeometry;
