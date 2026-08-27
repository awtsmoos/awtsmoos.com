// B"H
import assert from 'node:assert/strict';
import { HEALTHY_LUNCH_SCENE } from '../../src/data/scenes/healthyLunch/index.js';

assert.equal(HEALTHY_LUNCH_SCENE.scene.style, 'healthy_lunch_2d_production');
assert.equal(HEALTHY_LUNCH_SCENE.duration, 12000);
assert.ok(HEALTHY_LUNCH_SCENE.events.some(e => e.type === 'prop' && e.action === 'hop'));
assert.ok(HEALTHY_LUNCH_SCENE.events.some(e => e.type === 'character' && e.gesture === 'bite'));
assert.ok(Object.values(HEALTHY_LUNCH_SCENE.initialCharacters).every(c => c.position.y >= 185));
assert.ok(HEALTHY_LUNCH_SCENE.cameras.every(c => c.zoom <= 1.05));
console.log('B"H healthy lunch smoke passed');
