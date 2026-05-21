// B"H
// js/data/map-parser/placementResolver.js

import { getEntityGlyph } from './entityGlyph.js';

/**
 * Chapter 1: The old world grabbed the first matching mask and called it a soul.
 * This resolver refuses that exile. Explicit coordinates win; otherwise one exact
 * Unicode glyph may reveal one exact entity, never a swarm of guesses.
 *
 * @param {string[][]} grid Parsed visual grid.
 * @param {object} entityData Raw entity definition.
 * @returns {{x:number,y:number,ambiguous?:boolean,missing?:boolean}|null} Placement.
 */
export function resolvePlacement(grid, entityData) {
    if (Number.isInteger(entityData?.x) && Number.isInteger(entityData?.y)) {
        return { x: entityData.x, y: entityData.y };
    }

    const glyph = getEntityGlyph(entityData);
    if (!glyph) return null;

    const found = [];
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === glyph) found.push({ x, y });
        }
    }

    if (found.length === 1) return found[0];
    if (found.length > 1) return { ...found[0], ambiguous: true };
    return { x: -1, y: -1, missing: true };
}
