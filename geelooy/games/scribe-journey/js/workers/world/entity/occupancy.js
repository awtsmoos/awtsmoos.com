// B"H
// js/workers/world/entity/occupancy.js

/**
 * Chapter 1: The map tile is not a guessable coordinate contract anymore. The
 * player faces a tile, reads the inner Unicode identity written there, and only
 * then resolves the entity from the level's glyph registry.
 *
 * @param {object} map Parsed map with entityByGlyph registry.
 * @param {number} x Target tile x.
 * @param {number} y Target tile y.
 * @returns {object|null} Entity occupying the requested tile.
 */
export function getEntityAt(map, x, y) {
    const tile = map?.baseLayer?.[y]?.[x];
    if (!tile) return null;
    return map?.entityByGlyph?.[tile] || null;
}

/**
 * Clears a resolved entity from the visible map by its own Unicode identity, not
 * by matching a costume emoji.
 *
 * @param {object} map Parsed map.
 * @param {object} entity Entity returned from getEntityAt.
 */
export function clearEntityTile(map, entity) {
    if (!entity || !Number.isInteger(entity.x) || !Number.isInteger(entity.y)) return;
    if (map?.baseLayer?.[entity.y]?.[entity.x] === entity.uu) {
        map.baseLayer[entity.y][entity.x] = '⬜';
    }
    if (map?.entityByGlyph?.[entity.uu]) delete map.entityByGlyph[entity.uu];
    if (map?.entityById?.[entity.id]) delete map.entityById[entity.id];
}

/**
 * @param {object|null} entity Parsed entity at the target tile.
 * @returns {boolean} True when walking into the tile should be blocked.
 */
export function blocksMovement(entity) {
    if (!entity) return false;
    if (entity.walkable === true) return false;
    return ['npc', 'door', 'shop', 'barrel', 'letter'].includes(entity.type) || Boolean(entity.shop);
}
