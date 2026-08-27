
// B"H
/**
 * @file modifierRouter.js
 * @chapter THE CENTRAL CONDUIT OF TRANSFORMATIVE POWER
 * 
 * THE HYMN OF THE MODIFIER EVALUATOR:
 * A modifier arrives, a JSON decree,
 * "Transform this mesh," says the Will, "as I see."
 * The router receives it, with reverence and care,
 * And begins the process of making it fair.
 * 
 * First, resolve the parameters, which may be nested deep,
 * With variables referenced, promises to keep.
 * Then, look up the handler in the sacred registry,
 * A pure map of functions, a divine mystery.
 * 
 * If the handler exists, invoke it with grace,
 * Passing the mesh, the mod, the params, the context's embrace.
 * If not, log a warning, but let the mesh survive,
 * For the Awtsmoos's creation must always thrive.
 * 
 * This router, a testament to modular design,
 * Reflects the Infinite, in every single line.
 * 
 * @module modifierRouter
 * @author The Conduit of Atzmus
 * @version 1.0.0
 */

import { MODIFIER_REGISTRY } from '../registry/modifierRegistry.js';

/**
 * @typedef {Object} ModifierDefinition
 * @property {string} type - The type of modifier to apply (e.g., 'subdivide').
 * @property {Object} [params] - Parameters for the modifier, possibly with variable references.
 * @property {Object} [mod] - The full modifier object for legacy compatibility.
 */

/**
 * @typedef {Object} ModifierContext
 * @property {Object} objectData - Contextual data about the object being modified.
 * @property {Function} get - Retrieve a variable from the evaluation context.
 * @property {Function} set - Set a variable in the evaluation context.
 */

/**
 * B"H - Resolves parameters that may contain variable references.
 * 
 * THE POEM OF VARIABLE RESOLUTION:
 * A parameter may be a number, a string, or a map,
 * Or it may be a reference, a variable's lap.
 * If it has a 'var' key, we look up its value,
 * From the context of evaluation, a divine jewel.
 * 
 * We recurse through arrays, through objects so deep,
 * Resolving each reference, a promise to keep.
 * Until all is resolved, pure data so clean,
 * Ready for the modifier, a transformation serene.
 * 
 * @param {*} params - The parameters to resolve, possibly with { var: 'name' } references.
 * @param {ModifierContext} context - The evaluation context for variable lookup.
 * @returns {*} The fully resolved parameters.
 * 
 * @private
 */
function _resolveParams(params, context) {
  // B"H - Base cases: primitives pass through unchanged
  if (params === null || params === undefined) return params;
  if (typeof params !== 'object') return params;

  // B"H - Handle arrays recursively
  if (Array.isArray(params)) {
    return params.map(item => _resolveParams(item, context));
  }

  // B"H - Handle variable references: { var: 'name' } or { var: 'name.property' }
  if (params.var && typeof params.var === 'string') {
    return context.get(params.var);
  }

  // B"H - Recursively resolve object properties
  const resolved = {};
  for (const [key, value] of Object.entries(params)) {
    resolved[key] = _resolveParams(value, context);
  }
  return resolved;
}

/**
 * B"H - Applies a single modifier to a mesh using the registry pattern.
 * 
 * THE REVELATION OF THE PURE LOOKUP:
 * No switch statement here, no branching of will,
 * Just a simple map lookup, the logic to fulfill.
 * We get the handler by the modifier's type,
 * And if it exists, we invoke, with divine light.
 * 
 * The parameters are resolved, the context is passed,
 * And the mesh is transformed, forever to last.
 * If the handler is missing, we log with a sigh,
 * But return the mesh unchanged, lest the creation die.
 * 
 * @param {Object} mesh - The structured mesh to modify.
 * @param {ModifierDefinition} mod - The modifier definition object.
 * @param {ModifierContext} context - The evaluation context for variables and object data.
 * @returns {Object} The modified mesh.
 * 
 * @example
 * const modifier = {
 *   type: 'subdivide',
 *   params: { levels: 2, query: { tag: 'face_group' } }
 * };
 * const newMesh = applySingleModifier(mesh, modifier, context);
 */
export function applySingleModifier(mesh, mod, context) {
  // B"H - Guard against null or undefined modifier
  if (!mod || !mod.type) {
    console.warn('B"H - ModifierRouter: Received null or undefined modifier. The mesh remains unchanged.');
    return mesh;
  }

  try {
    // B"H - Resolve parameters that may contain variable references
    const resolvedParams = _resolveParams(mod.params, context);

    // B"H - Look up the handler in the pure registry map
    const handler = MODIFIER_REGISTRY[mod.type];

    if (handler) {
      // B"H - Invoke the handler with the resolved parameters and context
      return handler(mesh, mod, resolvedParams, context.objectData);
    } else {
      // B"H - Handler not found: log a warning but preserve the mesh
      console.warn(`B"H - ModifierRouter: Unknown modifier type '${mod.type}'. Check the registry or your spelling.`);
      return mesh;
    }
  } catch (error) {
    // B"H - Error handling: log the error but return the original mesh to prevent total failure
    console.error(`B"H - ModifierRouter: Critical error applying '${mod.type}':`, error);
    return mesh;
  }
}

export default { applySingleModifier };
