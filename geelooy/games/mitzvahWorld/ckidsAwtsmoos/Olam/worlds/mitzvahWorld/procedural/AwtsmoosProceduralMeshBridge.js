// B"H
/**
 * @file AwtsmoosProceduralMeshBridge.js
 * @description Converts geelooy/libs procedural mesh data into Three geometry.
 *
 * The Awtsmoos-procedural-core library speaks in vertices, normals, uvs, and
 * indices. This bridge lets JSON worlds point at that speech directly, so a
 * generated form can cross from pure data into visible mesh without losing its
 * source language.
 */
import { createAwtsmoosThreeBufferGeometry } from "/libs/awtsmoos-procedural-core/src/adapters/three/bufferGeometry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * Builds a Three geometry from mesh data compatible with awtsmoos-procedural-core.
 *
 * @param {object} THREE Three module namespace.
 * @param {object} data Mesh data with positions and optional normals, uvs, colors, indices.
 * @returns {object|null} Three BufferGeometry or null.
 */
export function geometryFromAwtsmoosMeshData(THREE, data = {}) {
  if (!data || !Array.isArray(data.positions)) return null;
  return createAwtsmoosThreeBufferGeometry(THREE, {
    positions:data.positions,
    normals:data.normals || [],
    uvs:data.uvs || [],
    colors:data.colors || [],
    indices:data.indices || []
  });
}

export default geometryFromAwtsmoosMeshData;
