// B"H
import assert from 'node:assert/strict';
import { EmotionLibrary } from '../../src/performance/face/EmotionLibrary.js';
assert.ok(EmotionLibrary.get('skeptical').brows.squeeze > 0.2);
assert.ok(EmotionLibrary.get('delighted').mouth.smile > 0.9);
assert.ok(EmotionLibrary.get('amazed').eyes.openness > 1.2);
console.log('B"H facial expression smoke passed');
