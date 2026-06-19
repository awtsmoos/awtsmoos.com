// B"H
/**
 * @file ProceduralWorldSchema.js
 * @description Data-only world grammar for instant environments.
 *
 * The Awtsmoos speaks one utterance and worlds unfold: a plaza, an arch, a
 * question above a teacher, a star-path in a cutscene. This file keeps that
 * utterance small and lawful. It does not render. It receives JSON, resolves
 * groups and array vows, and returns complete component records ready for the
 * Three vessel.
 */
const EMPTY = Object.freeze([]);

/**
 * Returns an array or a sealed empty list.
 *
 * @param {*} value Candidate list.
 * @returns {Array} The list when valid, otherwise an empty list.
 */
function list(value) { return Array.isArray(value) ? value : EMPTY; }

/**
 * Returns a plain object or a clear fallback.
 *
 * @param {*} value Candidate object.
 * @returns {object} Safe object.
 */
function object(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }

/**
 * Clones data through JSON-compatible structure.
 *
 * @param {*} value JSON-like input.
 * @returns {*} Deep clone.
 */
function clone(value) { return JSON.parse(JSON.stringify(value)); }

/**
 * Adds vectors in JSON array form.
 *
 * @param {number[]} a First vector.
 * @param {number[]} b Second vector.
 * @returns {number[]} Added vector.
 */
function add3(a = [0,0,0], b = [0,0,0]) {
  return [Number(a[0] || 0) + Number(b[0] || 0), Number(a[1] || 0) + Number(b[1] || 0), Number(a[2] || 0) + Number(b[2] || 0)];
}

/**
 * Expands one component, honoring nested groups and simple arrays.
 *
 * @param {object} component Component record.
 * @param {object} ctx Expansion context.
 * @returns {object[]} Expanded components.
 */
export function expandComponent(component = {}, ctx = {}) {
  const c = clone(component), inherited = list(ctx.position), base = list(c.position);
  if (inherited.length) c.position = add3(inherited, base.length ? base : [0,0,0]);
  if (c.type === "group") return list(c.children || c.components).flatMap(child => expandComponent(child, { position:c.position || [0,0,0] }));
  if (c.type === "array") {
    const count = Math.max(0, Math.floor(Number(c.count || c.params?.count || 0)));
    const offset = list(c.offset || c.params?.offset || [0,0,0]);
    return Array.from({ length:count }, (_, index) => expandComponent({ ...clone(c.component || {}), name:`${c.name || "array"}_${index}` }, { position:add3(c.position || [0,0,0], offset.map(v => Number(v || 0) * index)) })).flat();
  }
  return [c];
}

/**
 * Normalizes a procedural world JSON block into a GeometryEngine blueprint.
 *
 * @param {object} input Procedural world block.
 * @returns {object} Blueprint with variables, blueprints, components, and cutscenes.
 */
export function normalizeProceduralWorld(input = {}) {
  const world = object(input);
  const components = list(world.components || world.shapes || world.environment).flatMap(c => expandComponent(c));
  return {
    id:world.id || "awtsmoos_procedural_world",
    title:world.title || "Awtsmoos Procedural World",
    variables:object(world.variables),
    blueprints:object(world.blueprints),
    components,
    cutscenes:list(world.cutscenes),
    ui:object(world.ui),
    gameplay:object(world.gameplay)
  };
}

export default normalizeProceduralWorld;
