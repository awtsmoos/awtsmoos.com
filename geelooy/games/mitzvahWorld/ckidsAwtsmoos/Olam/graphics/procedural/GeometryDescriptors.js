// B"H
/**
 * @file GeometryDescriptors.js
 * @description
 * Chapter 6: Before WebGL receives triangles, meaning receives names. These
 * builders emit plain JSON geometry descriptors that can be interpreted by
 * Three today, raw WebGL tomorrow, and headless audits always.
 */

/**
 * Creates a renderer-neutral geometry descriptor.
 * @param {string} type geometry kind.
 * @param {object} params serializable parameters.
 * @returns {object} neutral geometry descriptor.
 */
export function geometryDescriptor(type, params = {}) {
  return { kind: 'geometry', rendererNeutral: true, type, params: { ...params } };
}

/**
 * Creates a renderer-neutral material descriptor.
 * @param {string} type material kind.
 * @param {object} params serializable material data.
 * @returns {object} neutral material descriptor.
 */
export function materialDescriptor(type = 'basic', params = {}) {
  return { kind: 'material', rendererNeutral: true, type, params: { ...params } };
}

/**
 * Creates a semantic renderable descriptor for future plain WebGL compilation.
 * @param {object} spec renderable fields.
 * @returns {object} renderable descriptor.
 */
export function renderableDescriptor(spec = {}) {
  return {
    kind: 'renderable',
    rendererNeutral: true,
    geometry: spec.geometry || null,
    material: spec.material || null,
    transform: spec.transform || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    collision: spec.collision || null,
    metadata: spec.metadata || {},
    renderHints: spec.renderHints || {},
    semanticAnchors: spec.semanticAnchors || []
  };
}

/**
 * Describes a box without allocating renderer memory.
 * @param {number} width width.
 * @param {number} height height.
 * @param {number} depth depth.
 * @returns {object} neutral box geometry.
 */
export function boxDescriptor(width = 1, height = 1, depth = 1) {
  return geometryDescriptor('box', { width, height, depth });
}

/**
 * Describes a sphere without binding to Three or WebGL.
 * @param {number} radius radius.
 * @param {number} widthSegments horizontal segments.
 * @param {number} heightSegments vertical segments.
 * @returns {object} neutral sphere geometry.
 */
export function sphereDescriptor(radius = 1, widthSegments = 16, heightSegments = 8) {
  return geometryDescriptor('sphere', { radius, widthSegments, heightSegments });
}
