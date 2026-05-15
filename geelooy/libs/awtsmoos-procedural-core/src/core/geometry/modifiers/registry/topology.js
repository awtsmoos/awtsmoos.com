
// B"H
/**
 * @file topology.js
 * @chapter THE DICTIONARY OF SHAPE-CHANGING SPELLS
 * 
 * THE HYMN OF TOPOLOGICAL TRANSFORMATION:
 * A face is not a face until the Word has spoken,
 * A vertex is not bound until the chain is woken.
 * These spells of connection, of division, of growth,
 * Reflect the Seder Hishtalshelus—the descent from Truth.
 * 
 * As the letters rearrange to form each new creation,
 * So too do these modifiers reshape the mesh's foundation.
 * No switch to stumble, no if to delay,
 * Only the pure map that guides the divine way.
 * 
 * @module TopologyModifiers
 * @see {@link subdivideMesh} For multiplying faces in sacred proportion
 * @see {@link extrudeFaces} For extending limbs from tagged roots
 * @see {@link queryFaces} For selecting faces by divine criteria
 */

import { subdivideMesh } from '../subdivide.js';
import { extrudeFace } from '../extrude.js';
import { extrudeFaces } from '../extrudeFaces.js';
import { insetFaceModifier } from '../inset.js';
import { deleteFaceModifier } from '../delete.js';
import { makeDoubleSidedModifier } from '../doubleSided.js';
import { extrudeBorderModifier } from '../extrudeBorder.js';
import { addThicknessModifier } from '../thickness.js';
import { healTopologyModifier } from '../heal.js';
import { queryFaces } from '../../selection/faceQuery.js';

/**
 * @typedef {Object} SubdivideParams
 * @property {number} [levels=1] - Number of subdivision iterations.
 * @property {Array<number>|Object} [query] - Face selection criteria.
 * @property {boolean} [smooth=false] - Whether to relax geometry after subdivision.
 */

/**
 * @typedef {Object} ExtrudeFacesParams
 * @property {Object} query - Face selection criteria.
 * @property {number} [distance=1.0] - Total extrusion distance.
 * @property {number} [steps=1] - Number of segments in the extrusion.
 * @property {number|Array<number>} [scale=1.0] - Scale factor per step.
 * @property {string} [assignCapTag] - Tag to assign to the extruded cap faces.
 * @property {string} [assignSideTag] - Tag to assign to the extruded side faces.
 * @property {boolean} [clearTags=false] - Whether to clear tags from original faces.
 */

/**
 * @constant TOPOLOGY_MODIFIERS
 * @type {Object.<string, Function>}
 * @description
 * The sacred mapping between topology modifier types and their implementations.
 * Each function receives (mesh, mod, params, objectData) and returns the modified mesh.
 * 
 * This object embodies the principle of data-driven design:
 * The logic is pure; the configuration is external; the result is inevitable.
 */
export const TOPOLOGY_MODIFIERS = Object.freeze({
  /**
   * @function subdivide
   * @description Subdivides selected faces, multiplying detail in sacred proportion.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {SubdivideParams} params - Subdivision parameters.
   * @returns {Object} The subdivided mesh.
   */
  subdivide: (mesh, mod, params) => {
    const p = params || mod;
    const faceIndices = p.query ? queryFaces(mesh, p.query) : (p.faceIndices || null);
    const doSmooth = p.smooth === true;
    const levels = p.levels !== undefined ? p.levels : 1;
    return subdivideMesh(mesh, levels, faceIndices, doSmooth);
  },

  /**
   * @function extrude
   * @description Extrudes a single face by index (legacy simple extrusion).
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {Object} params - { face: number, amount: number }.
   * @returns {Object} The extruded mesh.
   */
  extrude: (mesh, mod, params) => {
    const p = params || mod;
    return extrudeFace(mesh, p.face, p.amount || 0.5);
  },

  /**
   * @function extrudeFaces
   * @description Extrudes multiple faces selected by query, with segmentation and tagging.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {ExtrudeFacesParams} params - Extrusion parameters.
   * @returns {Object} The extruded mesh.
   */
  extrudeFaces: (mesh, mod, params) => {
    const p = params || mod;
    return extrudeFaces(mesh, p);
  },

  /**
   * @function inset
   * @description Insets a single face, creating a smaller inner face and border quads.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {Object} params - { face: number, amount: number }.
   * @returns {Object} The inset mesh.
   */
  inset: (mesh, mod, params) => {
    const p = params || mod;
    return insetFaceModifier(mesh, p.face, p.amount || 0.2);
  },

  /**
   * @function deleteFace
   * @description Removes a face from the mesh by index.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {Object} params - { face: number }.
   * @returns {Object} The mesh with face removed.
   */
  deleteFace: (mesh, mod, params) => {
    const p = params || mod;
    return deleteFaceModifier(mesh, p.face);
  },

  /**
   * @function makeDoubleSidedGeometry
   * @description Creates back-faces for all faces, making the mesh two-sided.
   * @param {Object} mesh - The mesh to modify.
   * @returns {Object} The double-sided mesh.
   */
  makeDoubleSidedGeometry: (mesh) => makeDoubleSidedModifier(mesh),

  /**
   * @function extrudeBorder
   * @description Extrudes boundary edges of the mesh, creating a rim or lip.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {Object} params - { amount: number, inset: number }.
   * @returns {Object} The mesh with extruded border.
   */
  extrudeBorder: (mesh, mod, params) => {
    const p = params || mod;
    return extrudeBorderModifier(mesh, p.amount, p.inset || 0);
  },

  /**
   * @function thickness
   * @description Adds thickness to a mesh by extruding along vertex normals.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {Object} params - { amount: number }.
   * @returns {Object} The thickened mesh.
   */
  thickness: (mesh, mod, params) => {
    const p = params || mod;
    return addThicknessModifier(mesh, p.amount);
  },

  /**
   * @function healTopology
   * @description Resolves T-junctions and welds nearby vertices for watertight geometry.
   * @param {Object} mesh - The mesh to modify.
   * @param {Object} mod - The modifier definition.
   * @param {Object} params - { tolerance: number }.
   * @returns {Object} The healed mesh.
   */
  healTopology: (mesh, mod, params) => {
    const p = params || mod;
    return healTopologyModifier(mesh, p);
  },
});

/**
 * @function getTopologyModifierKeys
 * @description Returns an array of all registered topology modifier type names.
 * @returns {string[]} Array of modifier type strings.
 */
export function getTopologyModifierKeys() {
  return Object.keys(TOPOLOGY_MODIFIERS);
}

/**
 * @function hasTopologyModifier
 * @description Checks if a modifier type has a registered implementation.
 * @param {string} type - The modifier type to check.
 * @returns {boolean} True if implementation exists, false otherwise.
 */
export function hasTopologyModifier(type) {
  return Object.prototype.hasOwnProperty.call(TOPOLOGY_MODIFIERS, type);
}

