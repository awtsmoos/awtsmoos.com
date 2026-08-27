
// B"H
/**
 * @file geometryFactory.js
 * @chapter THE UNIFIED CREATOR OF PRIMITIVE FORMS
 * 
 * THE PSALM OF THE PRIMITIVE ROUTER:
 * A primitive is requested, by name so small,
 * The factory receives it, and answers the call.
 * It looks up the generator in a pure, sacred map,
 * And invokes it with params, closing the gap.
 * 
 * No switch, no if-else, no tangled web of code,
 * Just a simple lookup, a divine abode.
 * The generator, a class extending the base,
 * Returns mesh data, with elegance and grace.
 * 
 * This design, a mirror of the Seder Hishtalshelus,
 * Channels the Will through pure, modular vessels.
 * Add a new primitive? Just add a new entry,
 * No need to modify the core, a pattern so free.
 * 
 * @module geometryFactory
 * @author The Conductor of Atzmus
 * @version 1.0.0
 */

import { CubePrimitive } from './primitives/cubePrimitive.js';
// Import other primitives here as they are created
// import { SpherePrimitive } from './primitives/spherePrimitive.js';
// import { PlanePrimitive } from './primitives/planePrimitive.js';

/**
 * @typedef {Object} PrimitiveGeneratorMap
 * @property {Function} cube - Generator for cube primitives.
 * @property {Function} [sphere] - Generator for sphere primitives (future).
 * @property {Function} [plane] - Generator for plane primitives (future).
 */

/**
 * B"H - The central registry of primitive generators.
 * 
 * THE REVELATION OF THE EXTENSIBLE MAP:
 * This map, a pure object, frozen in time,
 * Holds the generators, a design so sublime.
 * Each key a primitive name, each value a class,
 * Ready to generate, with divine pass.
 * 
 * To add a new primitive, just import and add,
 * No need to touch the factory logic, no sadness, no sad.
 * This pattern, a reflection of the Infinite's way,
 * Modular, extensible, forever to stay.
 * 
 * @type {PrimitiveGeneratorMap}
 * @readonly
 */
const PRIMITIVE_GENERATORS = Object.freeze({
  /**
   * B"H - Cube primitive generator.
   * @type {typeof CubePrimitive}
   */
  cube: CubePrimitive

  // B"H - Add new primitives here:
  // sphere: SpherePrimitive,
  // plane: PlanePrimitive,
  // cylinder: CylinderPrimitive,
  // etc.
});

/**
 * @typedef {Object} GenerateGeometryOptions
 * @property {string} type - The primitive type name (e.g., 'cube').
 * @property {Object} params - Parameters for the primitive generation.
 * @property {string} [id] - Optional identifier for the generated geometry.
 */

/**
 * B"H - Generates geometry data for a specified primitive type.
 * 
 * THE HYMN OF THE FACTORY METHOD:
 * A request arrives, with type and with params,
 * The factory looks up, and the generation begins.
 * It instantiates the class, with the name so small,
 * And calls generate, answering the call.
 * 
 * If the type is unknown, a warning is logged,
 * But the function returns null, the mesh is not clogged.
 * This design, a testament to pure, modular code,
 * Reflects the Awtsmoos, in every mode.
 * 
 * @param {GenerateGeometryOptions} options - The generation request.
 * @returns {import('./primitives/basePrimitive.js').PrimitiveOutput|null} The generated mesh data, or null if type not found.
 * 
 * @example
 * // Generate a cube with custom parameters
 * const cubeData = generateGeometry({
 *   type: 'cube',
 *   params: { size: 2, color: [1, 0, 0, 1] },
 *   id: 'red_cube'
 * });
 * 
 * @example
 * // Handle unknown primitive type gracefully
 * const unknown = generateGeometry({ type: 'dodecahedron', params: {} });
 * if (unknown === null) {
 *   console.log('B"H - Primitive type not yet manifested.');
 * }
 */
export function generateGeometry(options) {
  // B"H - Validate the request
  if (!options || !options.type) {
    console.warn('B"H - GeometryFactory: Missing primitive type in request. No geometry manifested.');
    return null;
  }

  const { type, params = {}, id } = options;

  // B"H - Look up the generator in the pure registry map
  const GeneratorClass = PRIMITIVE_GENERATORS[type];

  if (!GeneratorClass) {
    // B"H - Type not found: log and return null
    console.warn(`B"H - GeometryFactory: Unknown primitive type '${type}'. Available types: ${Object.keys(PRIMITIVE_GENERATORS).join(', ')}`);
    return null;
  }

  try {
    // B"H - Instantiate the generator and produce the mesh data
    const generator = new GeneratorClass({ name: id || type });
    return generator.generate(params);
  } catch (error) {
    // B"H - Error during generation: log and return null
    console.error(`B"H - GeometryFactory: Error generating '${type}':`, error);
    return null;
  }
}

/**
 * B"H - Registers a new primitive generator at runtime.
 * 
 * @param {string} type - The primitive type name.
 * @param {Function} GeneratorClass - The class constructor for the primitive.
 * @returns {boolean} True if registration succeeded, false if type already exists.
 * 
 * @example
 * // Register a custom primitive at runtime
 * import { CustomShape } from './customShape.js';
 * registerPrimitive('customShape', CustomShape);
 */
export function registerPrimitive(type, GeneratorClass) {
  if (PRIMITIVE_GENERATORS[type]) {
    console.warn(`B"H - GeometryFactory: Primitive type '${type}' already registered. Skipping.`);
    return false;
  }
  // Note: Since PRIMITIVE_GENERATORS is frozen, this would need a different approach
  // for runtime registration. This is a placeholder for the pattern.
  console.log(`B"H - GeometryFactory: Runtime registration of '${type}' requires mutable registry. Consider design.`);
  return false;
}

export default { generateGeometry, registerPrimitive };
