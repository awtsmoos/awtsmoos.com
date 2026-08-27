// B"H
import assert from 'node:assert/strict';
import { FoodKitchenBackdrop } from '../../src/core/renderer/scene/FoodKitchenBackdrop.js';
import { FoodPropRenderer } from '../../src/core/renderer/props/FoodPropRenderer.js';
import { ShotCompositionGuard } from '../../src/core/renderer/camera/ShotCompositionGuard.js';

assert.equal(typeof FoodKitchenBackdrop.render, 'function');
assert.equal(typeof FoodPropRenderer.draw, 'function');
assert.equal(ShotCompositionGuard.apply({ zoom: 3 }).zoom, 1.05);
console.log('B"H render module smoke passed');
