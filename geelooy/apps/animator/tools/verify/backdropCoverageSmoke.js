// B"H
import assert from 'node:assert/strict';
import { FoodKitchenBackdrop } from '../../src/core/renderer/scene/FoodKitchenBackdrop.js';
const calls = [];
const ctx = {
  fillStyle: '', strokeStyle: '', lineWidth: 0, font: '',
  createLinearGradient: () => ({ addColorStop() {} }),
  fillRect: (...args) => calls.push(['fillRect', ...args]), strokeRect: (...args) => calls.push(['strokeRect', ...args]),
  beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {}, ellipse() {}, fillText() {}
};
FoodKitchenBackdrop.render(ctx, {}, 700, 900, 1200);
assert.ok(calls.some(c => c[0] === 'fillRect' && c[2] < -1000));
assert.ok(calls.length > 20);
console.log('B"H backdrop coverage smoke passed');
