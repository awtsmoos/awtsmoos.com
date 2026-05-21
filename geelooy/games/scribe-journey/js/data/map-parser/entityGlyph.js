// B"H
// js/data/map-parser/entityGlyph.js

/**
 * Chapter 1: The glyph is the tiny letter where the Awtsmoos lets identity burn.
 * It is not decoration. It is not a costume. It is the hidden name by which the
 * world recognizes one door, one soul, one barrel, one letter, one dangerous road.
 *
 * @param {object} entityData Entity definition from a raw map module.
 * @returns {string|null} Stable Unicode identity glyph, or null for non-placed data.
 */
export function getEntityGlyph(entityData) {
    if (!entityData || typeof entityData !== 'object') return null;
    return entityData.uu || entityData.glyph || entityData.emoji || null;
}

/**
 * Chapter 1 continued: the visible form may be a mask, but the inner glyph is law.
 * This lets future mobile renderers show compact sprites without corrupting logic.
 *
 * @param {object} entityData Entity definition from a raw or parsed map.
 * @returns {string|null} Visual glyph preferred by the renderer.
 */
export function getEntityVisual(entityData) {
    if (!entityData || typeof entityData !== 'object') return null;
    return entityData.visual || entityData.emoji || entityData.glyph || entityData.uu || null;
}
