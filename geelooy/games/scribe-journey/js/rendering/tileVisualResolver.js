// B"H
// js/rendering/tileVisualResolver.js

/**
 * Chapter 1: The map may carry secret Unicode crowns, but the eye receives the
 * friendly garment. The Awtsmoos lets identity and appearance unite without
 * confusing one for the other.
 *
 * @param {object} map Parsed map with optional entityByGlyph registry.
 * @param {string|null} tile Raw tile or unique entity glyph from a layer.
 * @returns {string|null} Display glyph for canvas rendering.
 */
export function resolveTileVisual(map, tile) {
    if (!tile) return tile;
    const entity = map?.entityByGlyph?.[tile];
    if (!entity) return tile;
    return entity.visual || entity.emoji || entity.glyph || tile;
}
