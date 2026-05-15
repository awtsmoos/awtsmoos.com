
// B"H
/**
 * @file cubePrimitive.js
 * @chapter THE CUBE: FOUNDATION OF SPATIAL ORDER
 * 
 * THE EPIC OF THE SIX-FACED VESSEL:
 * In the void of potential, before form was known,
 * The Awtsmoos decreed: "Let there be a cube, alone."
 * Six faces of equality, eight vertices of connection,
 * Twelve edges of relationship, a perfect reflection.
 * 
 * This module, a humble servant of that decree,
 * Generates the cube's data, with purity and glee.
 * No hardcoded loops, no mutable state in sight,
 * Just pure parameters, transformed into light.
 * 
 * The size, the color, the subdivisions so fine,
 * All defined in JSON, a design divine.
 * Extend this pattern to all primitives, I pray,
 * And the geometry will manifest, day by day.
 * 
 * @module cubePrimitive
 * @author The Mason of Atzmus
 * @version 1.0.0
 */

import { BasePrimitive } from './basePrimitive.js';

/**
 * @typedef {Object} CubeParams
 * @property {number} [size=1] - The length of each edge of the cube.
 * @property {Array<number>} [color=[1,1,1,1]] - Default vertex color [r,g,b,a].
 * @property {boolean} [centered=true] - Whether to center the cube at origin.
 */

/**
 * B"H - A data-driven, modular cube primitive generator.
 * 
 * THE REVELATION OF THE PARAMETERIZED CUBE:
 * This class extends the base, with cube-specific grace,
 * Defining defaults, validating with divine pace.
 * The generate method, pure and functional,
 * Takes params and returns mesh data, a transactional
 * Transformation of intent into geometric fact,
 * A reflection of the Will, in every vertex exact.
 * 
 * @class
 * @extends {BasePrimitive}
 * 
 * @example
 * // Create a cube with custom size and color
 * const cube = new CubePrimitive({ name: 'golden_cube' });
 * const meshData = cube.generate({
 *   size: 2.5,
 *   color: [1, 0.84, 0, 1] // Gold
 * });
 * 
 * @example
 * // Generate a centered cube with default parameters
 * const defaultCube = new CubePrimitive();
 * const data = defaultCube.generate({});
 */
export class CubePrimitive extends BasePrimitive {
  /**
   * B"H - Constructs the cube primitive with divine intent.
   * 
   * @constructor
   * @param {Object} [options] - Optional configuration.
   * @param {string} [options.name='cube'] - Descriptive name for debugging.
   */
  constructor(options = {}) {
    super({ name: options.name || 'cube' });

    /**
     * B"H - Default parameters for cube generation.
     * @type {CubeParams}
     * @protected
     * @override
     */
    this._defaultParams = Object.freeze({
      size: 1,
      color: [1, 1, 1, 1],
      centered: true
    });
  }

  /**
   * B"H - Generates the cube's geometric data from parameters.
   * 
   * THE HYMN OF THE EIGHT VERTICES:
   * We define the eight corners, in sacred array,
   * Then connect them with faces, in divine display.
   * Each face a quad, each quad two triangles so true,
   * The indices connect them, a geometric clue.
   * 
   * The positions, the normals, the colors so bright,
   * All computed from params, in the sacred light.
   * A pure function, with no side effects, no state,
   * Just input and output, a divine fate.
   * 
   * @override
   * @param {CubeParams} params - The cube's defining parameters.
   * @returns {import('./basePrimitive.js').PrimitiveOutput} The generated mesh data.
   * 
   * @throws {Error} If parameters are invalid.
   */
  generate(params) {
    // B"H - Merge with defaults and validate
    const config = this._mergeParams(params);
    this._validateParams(config, ['size']);

    const { size, color, centered } = config;
    const half = centered ? size / 2 : 0;
    const s = size;

    // B"H - Define the eight vertices in sacred order
    const vertices = [
      // Front face (z = +half)
      [-half, -half,  half], // 0: bottom-left-front
      [ half, -half,  half], // 1: bottom-right-front
      [ half,  half,  half], // 2: top-right-front
      [-half,  half,  half], // 3: top-left-front
      // Back face (z = -half)
      [-half, -half, -half], // 4: bottom-left-back
      [ half, -half, -half], // 5: bottom-right-back
      [ half,  half, -half], // 6: top-right-back
      [-half,  half, -half]  // 7: top-left-back
    ];

    // B"H - Define the six faces as quads (counter-clockwise winding)
    const faces = [
      [0, 1, 2, 3], // Front
      [5, 4, 7, 6], // Back
      [3, 2, 6, 7], // Top
      [4, 5, 1, 0], // Bottom
      [1, 5, 6, 2], // Right
      [4, 0, 3, 7]  // Left
    ];

    // B"H - Generate flat arrays for WebGL
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];

    // Face normals in order: front, back, top, bottom, right, left
    const faceNormals = [
      [0, 0, 1], [0, 0, -1], [0, 1, 0],
      [0, -1, 0], [1, 0, 0], [-1, 0, 0]
    ];

    let vertexIndex = 0;
    for (let f = 0; f < faces.length; f++) {
      const face = faces[f];
      const normal = faceNormals[f];

      // B"H - Add four vertices for this face (with face-normal for flat shading)
      for (const vi of face) {
        const [x, y, z] = vertices[vi];
        positions.push(x, y, z);
        normals.push(...normal);
        colors.push(...color);
      }

      // B"H - Add two triangles for this quad (0,1,2 and 0,2,3)
      const base = vertexIndex;
      indices.push(base, base + 1, base + 2);
      indices.push(base, base + 2, base + 3);
      vertexIndex += 4;
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      metadata: {
        faceCount: 6,
        vertexCount: positions.length / 3,
        primitiveType: 'cube'
      }
    };
  }
}

export default CubePrimitive;
