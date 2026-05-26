// B"H
/**
 * @file NeutralGltfLoader.js
 * @description
 * Chapter 5: The loader removes the royal garment and counts the bones of
 * form. It parses GLTF JSON and GLB containers into serializable descriptors
 * for future plain-WebGL compilation while current browser rendering may still
 * delegate visual realization to Three.js.
 */

const GLB_MAGIC = 0x46546c67;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;

function asUint8Array(source) {
  if (source instanceof Uint8Array) return source;
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  if (ArrayBuffer.isView(source)) return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  throw new Error('Neutral GLB parser expected ArrayBuffer or Uint8Array.');
}

function decodeUtf8(bytes) {
  return new TextDecoder('utf-8').decode(bytes).replace(/\u0000+$/g, '').trim();
}

/**
 * Parses a GLTF JSON string or object into neutral procedural descriptors.
 * @param {string|object} source GLTF JSON text or parsed object.
 * @returns {object} serializable neutral GLTF descriptor.
 */
export function parseNeutralGltf(source) {
  const gltf = typeof source === 'string' ? JSON.parse(source) : source;
  const scenes = (gltf.scenes || []).map((scene, index) => ({
    index,
    name: scene.name || `scene_${index}`,
    nodes: [...(scene.nodes || [])]
  }));
  const nodes = (gltf.nodes || []).map((node, index) => ({
    index,
    name: node.name || `node_${index}`,
    mesh: node.mesh ?? null,
    skin: node.skin ?? null,
    camera: node.camera ?? null,
    children: [...(node.children || [])],
    matrix: node.matrix ? [...node.matrix] : null,
    translation: node.translation ? [...node.translation] : [0, 0, 0],
    rotation: node.rotation ? [...node.rotation] : [0, 0, 0, 1],
    scale: node.scale ? [...node.scale] : [1, 1, 1]
  }));
  const meshes = (gltf.meshes || []).map((mesh, index) => ({
    index,
    name: mesh.name || `mesh_${index}`,
    primitives: (mesh.primitives || []).map((primitive, primitiveIndex) => ({
      primitiveIndex,
      mode: primitive.mode ?? 4,
      attributes: { ...(primitive.attributes || {}) },
      indices: primitive.indices ?? null,
      material: primitive.material ?? null
    }))
  }));
  const materials = (gltf.materials || []).map((material, index) => ({
    index,
    name: material.name || `material_${index}`,
    pbrMetallicRoughness: material.pbrMetallicRoughness || {},
    normalTexture: material.normalTexture || null,
    occlusionTexture: material.occlusionTexture || null,
    emissiveTexture: material.emissiveTexture || null,
    emissiveFactor: material.emissiveFactor || [0, 0, 0],
    alphaMode: material.alphaMode || 'OPAQUE',
    doubleSided: Boolean(material.doubleSided)
  }));
  return {
    kind: 'neutralGltf',
    rendererNeutral: true,
    asset: gltf.asset || {},
    defaultScene: gltf.scene ?? 0,
    scenes,
    nodes,
    meshes,
    materials,
    skins: (gltf.skins || []).map((skin, index) => ({ index, name: skin.name || `skin_${index}`, joints: [...(skin.joints || [])], inverseBindMatrices: skin.inverseBindMatrices ?? null })),
    animations: (gltf.animations || []).map((animation, index) => ({ index, name: animation.name || `animation_${index}`, channels: animation.channels?.length || 0, samplers: animation.samplers?.length || 0 })),
    textures: (gltf.textures || []).map((texture, index) => ({ index, ...texture })),
    images: (gltf.images || []).map((image, index) => ({ index, name: image.name || `image_${index}`, uri: image.uri || null, mimeType: image.mimeType || null, bufferView: image.bufferView ?? null })),
    buffers: (gltf.buffers || []).map((buffer, index) => ({ index, uri: buffer.uri || null, byteLength: buffer.byteLength || 0 })),
    bufferViews: (gltf.bufferViews || []).map((view, index) => ({ index, ...view })),
    accessors: (gltf.accessors || []).map((accessor, index) => ({ index, ...accessor })),
    raw: gltf
  };
}

/**
 * Parses a binary GLB container and returns its neutral descriptor plus chunks.
 * @param {ArrayBuffer|Uint8Array|DataView} source GLB bytes.
 * @returns {object} neutral GLB descriptor.
 */
export function parseNeutralGlb(source) {
  const bytes = asUint8Array(source);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 12) throw new Error('GLB is too small to contain a header.');
  const magic = view.getUint32(0, true);
  const version = view.getUint32(4, true);
  const length = view.getUint32(8, true);
  if (magic !== GLB_MAGIC) throw new Error(`Invalid GLB magic: 0x${magic.toString(16)}`);
  if (version !== 2) throw new Error(`Unsupported GLB version: ${version}`);
  if (length > view.byteLength) throw new Error(`GLB length ${length} exceeds provided bytes ${view.byteLength}.`);

  let offset = 12;
  let jsonText = null;
  let binBytes = null;
  const chunks = [];

  while (offset + 8 <= length) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + chunkLength;
    if (end > length) throw new Error('GLB chunk length exceeds container length.');
    const chunkBytes = bytes.slice(start, end);
    chunks.push({ type: chunkType, length: chunkLength });
    if (chunkType === GLB_JSON_CHUNK) jsonText = decodeUtf8(chunkBytes);
    if (chunkType === GLB_BIN_CHUNK) binBytes = chunkBytes;
    offset = end;
  }

  if (!jsonText) throw new Error('GLB did not contain a JSON chunk.');
  const descriptor = parseNeutralGltf(jsonText);
  descriptor.kind = 'neutralGlb';
  descriptor.glb = { version, length, chunks, binByteLength: binBytes?.byteLength || 0 };
  return descriptor;
}

/**
 * Loads GLTF JSON or GLB through an injected fetcher, keeping tests and workers pure.
 * @param {string} url URL or virtual path.
 * @param {Function} fetcher fetch-compatible function.
 * @returns {Promise<object>} neutral GLTF/GLB descriptor.
 */
export async function loadNeutralGltf(url, fetcher = globalThis.fetch) {
  if (typeof fetcher !== 'function') throw new Error('Neutral GLTF loader requires a fetcher for URL loading.');
  const response = await fetcher(url);
  if (/\.glb(?:$|[?#])/i.test(url)) {
    const arrayBuffer = await response.arrayBuffer();
    const descriptor = parseNeutralGlb(arrayBuffer);
    descriptor.source = url;
    return descriptor;
  }
  const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(await response.json());
  const descriptor = parseNeutralGltf(text);
  descriptor.source = url;
  return descriptor;
}
