// B"H
// tests/insight/openingVillageBehavior.mjs

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { attemptMove } from '../../js/workers/world/movement.js';

/**
 * Chapter 1: The ox cries beside Reuven, and the old false coordinate-shadow is
 * torn away. This test proves dialogue identity follows the unique glyph registry,
 * not the first matching face in the dust.
 */
function makeState(x, y) {
    return {
        currentMapId: 'malkuth_village',
        maps,
        bots: [],
        player: { x, y, targetX: x, targetY: y, startX: x, startY: y, pixelX: x * 32, pixelY: y * 32 }
    };
}

const village = maps.malkuth_village;
assert.equal(village.interactables['10,8'].id, 'reuven');
assert.equal(village.interactables['14,3'].id, 'village_pathfinder');
assert.notEqual(village.interactables['10,8'].id, village.interactables['14,3'].id);

const state = makeState(9, 8);
attemptMove(state, 'right');
assert.equal(state.player.x, 9);
assert.equal(state.player.targetX, 9);
assert.equal(state.player.isMoving, undefined);

console.log('opening village behavior ok');
