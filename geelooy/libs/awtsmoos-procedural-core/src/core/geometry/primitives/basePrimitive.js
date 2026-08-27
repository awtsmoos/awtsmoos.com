
// B"H
/**
 * @file basePrimitive.js
 * @chapter THE ARCHETYPAL FORM OF ALL GEOMETRY
 * 
 * THE PSALM OF THE PRIMITIVE VESSEL:
 * In the beginning, before the mesh was formed,
 * There was a concept, a primitive, a norm.
 * This base class defines the contract, the interface so clear,
 * That all geometric forms must hold dear.
 * 
 * It speaks of positions, of normals, of colors so bright,
 * Of indices that connect, in the sacred light.
 * It defines the structure, the data so pure,
 * That the renderer can process, forever secure.
 * 
 * Extend this class, with reverence and love,
 * And your primitive will be blessed from above.
 * Implement the generate method, with wisdom and grace,
 * And watch as your form takes its rightful place.
 * 
 * @module basePrimitive
 * @author The Architect of Atzmus
 * @version 1.0.0
 */

/**
 * @typedef {Object} VertexData
 * @property {Array<number>} position - The [x, y, z] coordinates of the vertex.
 * @property {Array<number>} [normal] - The [x, y, z] normal vector for lighting.
 * @property {Array<number>} [color] - The [r, g, b, a] color values.
 * @property {Array<number>} [uv] - The [u, v] texture coordinates.
 * @property {Array<number>} [boneIndices] - Bone indices for skeletal animation.
 * @property {Array<number>} [boneWeights] - Bone weights for skeletal animation.
 */

/**
 * @typedef {Object} PrimitiveOutput
 * @property {Float32Array} positions - Flat array of vertex positions [x1,y1,z1,x2,y2,z2,...].
 * @property {Uint16Array|Uint32Array} indices - Triangle indices for indexed drawing.
 * @property {Float32Array} [normals] - Flat array of vertex normals.
 * @property {Float32Array} [colors] - Flat array of vertex colors.
 * @property {Float32Array} [uvs] - Flat array of texture coordinates.
 * @property {Object} [metadata] - Additional metadata about the primitive.
 */

/**
 * B"H - The abstract base class for all procedural primitives.
 * 
 * THE REVELATION OF THE DATA-DRIVEN PRIMITIVE:
 * This class defines the interface, the sacred contract,
 * That all primitives must follow, a divine fact.
 * The generate method, pure and data-driven,
 * Takes parameters and returns a mesh, heaven-sent.
 * 
 * No side effects, no hidden state, no mutable gloom,
 * Just pure input, pure output, a geometric bloom.
 * Extend this class, implement with care,
 * And your primitive will manifest, beyond compare.
 * 
 * @abstract
 * @class
 * 
 * @example
 * // Extending the base primitive to create a custom shape
 * class MyCustomShape extends BasePrimitive {
 *   generate(params) {
 *     // Pure function: input params, output mesh data
 *     const positions = [];
 *     const indices = [];
 *     // ... generate geometry ...
 *     return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
 *   }
 * }
 */
export class BasePrimitive {
  /**
   * B"H - Constructs the base primitive vessel.
   * 
   * @constructor
   * @param {Object} [options] - Optional configuration for the primitive.
   * @param {string} [options.name='unnamed'] - A descriptive name for debugging.
   */
  constructor(options = {}) {
    /**
     * B"H - A descriptive name for this primitive instance.
     * @type {string}
     * @readonly
     */
    this.name = options.name || 'unnamed_primitive';

    /**
     * B"H - A map of default parameter values for this primitive.
     * Override in subclasses to define your primitive's defaults.
     * @type {Object<string, *>}
     * @protected
     */
    this._defaultParams = Object.freeze({});
  }

  /**
   * B"H - Generates the geometric data for this primitive.
   * 
   * THE HYMN OF PURE GENERATION:
   * This method, the heart of the primitive's soul,
   * Takes parameters and returns a mesh, the ultimate goal.
   * It must be pure, with no side effects, no hidden state,
   * Just input and output, a divine fate.
   * 
   * The returned object must conform to the PrimitiveOutput type,
   * With positions, indices, and optional attributes so great.
   * Implement this method with wisdom and with love,
   * And your primitive will be blessed from above.
   * 
   * @abstract
   * @param {Object} params - The parameters defining the primitive's form.
   * @returns {PrimitiveOutput} The generated mesh data in flat array format.
   * 
   * @throws {Error} If the method is not implemented by a subclass.
   * 
   * @example
   * // Example output structure
   * {
   *   positions: new Float32Array([0,0,0, 1,0,0, 0,1,0]),
   *   indices: new Uint16Array([0,1,2]),
   *   normals: new Float32Array([0,0,1, 0,0,1, 0,0,1]),
   *   colors: new Float32Array([1,0,0,1, 0,1,0,1, 0,0,1,1])
   * }
   */
  generate(params) {
    // B"H - This method must be implemented by subclasses
    throw new Error(`B"H - BasePrimitive.generate() must be implemented by subclass '${this.constructor.name}'. The primitive remains unmanifested.`);
  }

  /**
   * B"H - Merges provided parameters with default values.
   * 
   * THE POEM OF PARAMETER MERGING:
   * The user provides params, a subset so small,
   * We merge with defaults, to cover them all.
   * A shallow merge, for primitives so pure,
   * Ensures every parameter has a value, secure.
   * 
   * @protected
   * @param {Object} params - User-provided parameters.
   * @returns {Object} The merged parameter object.
   */
  _mergeParams(params) {
    return { ...this._defaultParams, ...params };
  }

  /**
   * B"H - Validates that required parameters are present.
   * 
   * @protected
   * @param {Object} params - The parameters to validate.
   * @param {Array<string>} required - List of required parameter keys.
   * @throws {Error} If a required parameter is missing.
   */
  _validateParams(params, required) {
    for (const key of required) {
      if (params[key] === undefined) {
        throw new Error(`B"H - Primitive '${this.name}' requires parameter '${key}'. The form cannot manifest without it.`);
      }
    }
  }
}

export default BasePrimitive;
