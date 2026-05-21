// B"H
// js/data/map_parser.js

import { ParsedEntityIndex } from './map-parser/ParsedEntityIndex.js';
import { resolvePlacement } from './map-parser/placementResolver.js';

/**
 * Chapter 1: The parser crosses the burning bridge from coordinate exile into
 * glyph identity. The raw scroll may still carry old costumes, but the playable
 * world receives level id -> unique Unicode glyph -> entity logic.
 *
 * @param {Record<string, object>} rawMaps Human-authored raw maps.
 * @returns {Record<string, object>} Parsed maps with identity indexes.
 */
export function parseAllMaps(rawMaps) {
    const parsedMaps = {};

    for (const mapId in rawMaps) {
        parsedMaps[mapId] = parseSingleMap(mapId, rawMaps[mapId]);
    }

    return parsedMaps;
}

/**
 * Produces a stable Private Use identity for legacy entities that were authored
 * before every soul received its own uu. The value is scoped by level and entity
 * order, so gameplay never needs to infer logic from matching shared visuals.
 *
 * @param {number} index Entity order inside the level.
 * @returns {string} Stable private Unicode identity glyph.
 */
function makeFallbackUu(index) {
    return String.fromCodePoint(0xF3000 + index);
}

/**
 * @param {string} mapId Stable level id.
 * @param {object} rawMap Raw map definition.
 * @returns {object} Parsed map.
 */
function parseSingleMap(mapId, rawMap) {
    const grid = rawMap.baseLayerString
        .trim()
        .split('\n')
        .map(row => Array.from(row.trim()));

    const index = new ParsedEntityIndex(mapId);
    const diagnostics = { ambiguousPlacements: [], missingPlacements: [] };
    const newMap = {
        ...rawMap,
        baseLayer: grid,
        overlayLayer: grid.map(row => row.map(() => null)),
        interactables: {},
        entityByGlyph: index.entityByGlyph,
        entityById: index.entityById,
        entityDiagnostics: diagnostics
    };

    let entityOrder = 0;
    for (const entityKey in rawMap.interactables || {}) {
        const entityData = rawMap.interactables[entityKey];
        const placement = resolvePlacement(grid, entityData);
        const fallbackUu = entityData.uu || makeFallbackUu(entityOrder++);
        const placed = placement && placement.x >= 0
            ? { ...entityData, uu: fallbackUu, visual: entityData.visual || entityData.emoji || entityData.glyph || fallbackUu, x: placement.x, y: placement.y }
            : { ...entityData, uu: fallbackUu, visual: entityData.visual || entityData.emoji || entityData.glyph || fallbackUu };

        if (placement && placement.x >= 0 && grid[placement.y] && grid[placement.y][placement.x] !== undefined) {
            grid[placement.y][placement.x] = fallbackUu;
        }

        const entity = index.add(entityKey, placed);

        if (placement?.ambiguous) diagnostics.ambiguousPlacements.push({ id: entity.id, glyph: entity.glyph });
        if (placement?.missing) diagnostics.missingPlacements.push({ id: entity.id, glyph: entity.glyph });
        if (Number.isInteger(entity.x) && Number.isInteger(entity.y)) {
            newMap.interactables[`${entity.x},${entity.y}`] = entity;
        }
    }

    newMap.entityIndex = index.toJSON();
    return newMap;
}
