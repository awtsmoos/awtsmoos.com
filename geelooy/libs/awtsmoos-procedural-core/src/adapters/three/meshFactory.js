/**
 * B"H
 * @file meshFactory.js
 * @description
 * High-level Three.js adapter for procedural objects.
 */

import { generateProceduralGeometry } from "../../core/geometry/geometryGenerator.js";
import { createAwtsmoosThreeBufferGeometry } from "./bufferGeometry.js";
import { createAwtsmoosThreeMaterial } from "./materialFactory.js";

/**
 * Generates procedural render data and wraps it in a THREE.Mesh.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} config
 * Procedural mesh config.
 *
 * @param {string} config.primitive
 * Primitive name.
 *
 * @param {Object} [config.parameters]
 * Primitive parameters.
 *
 * @param {Array<Object>} [config.modifiers]
 * Modifier command list.
 *
 * @param {Object|any} [config.material]
 * Material config or existing material.
 *
 * @param {Object} [config.shader]
 * ShaderMaterial config shorthand.
 *
 * @param {string} [config.id]
 * Object id.
 *
 * @returns {any}
 * THREE.Mesh with generated geometry.
 */
export function createProceduralThreeMesh(THREE, config) {
  if (!config || !config.primitive) {
    throw new Error("B\"H | createProceduralThreeMesh requires config.primitive");
  }

  const renderData = generateProceduralGeometry(
    config.primitive,
    config.parameters || config.params || {},
    config.modifiers || [],
    { id: config.id || config.name || config.primitive, ...(config.objectData || {}) }
  );

  const geometry = createAwtsmoosThreeBufferGeometry(THREE, renderData, config.geometryOptions || {});
  const materialConfig = config.shader ? { shader: config.shader } : (config.material || {});
  const material = createAwtsmoosThreeMaterial(THREE, materialConfig);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = config.name || config.id || `awtsmoos_${config.primitive}`;
  mesh.userData.awtsmoosProcedural = true;
  mesh.userData.primitive = config.primitive;
  mesh.userData.modifierCount = Array.isArray(config.modifiers) ? config.modifiers.length : 0;

  if (Array.isArray(config.position)) mesh.position.set(...config.position);
  if (Array.isArray(config.rotation)) mesh.rotation.set(...config.rotation);
  if (Array.isArray(config.scale)) mesh.scale.set(...config.scale);
  else if (typeof config.scale === "number") mesh.scale.setScalar(config.scale);

  return mesh;
}

export default createProceduralThreeMesh;
