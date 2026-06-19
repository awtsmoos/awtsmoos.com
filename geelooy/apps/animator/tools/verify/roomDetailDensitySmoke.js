// B"H
import assert from 'node:assert/strict';
import { ProductionRoomBackdrop } from '../../src/core/renderer/scene/productionRoom/ProductionRoomBackdrop.js';
const room = ProductionRoomBackdrop.build({ width: 800, height: 900 });
const text = JSON.stringify(room);
for (const word of ['production_bookcases', 'production_window', 'production_wall_decor', 'production_table', 'production_floor']) assert.ok(text.includes(word), word);
assert.ok(room.children.length >= 9);
console.log('B"H room detail density smoke passed');
