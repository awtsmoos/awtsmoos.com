// B"H
import assert from 'node:assert/strict';
import { FoodShapeLibrary } from '../../src/objects/art/FoodShapeLibrary.js';
import { ContactShadowSystem } from '../../src/objects/art/ContactShadowSystem.js';
assert.equal(FoodShapeLibrary.style('apple').fill, '#df3e35');
assert.ok(ContactShadowSystem.for({ id: 'a', x: 1, y: 2, size: 10 }).radiusX > 0);
console.log('B"H object art smoke passed');
