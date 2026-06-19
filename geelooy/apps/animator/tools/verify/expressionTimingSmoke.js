// B"H
import assert from 'node:assert/strict';
import { ExpressionBlendEngine } from '../../src/performance/face/ExpressionBlendEngine.js';
import { ListenerReactionEngine } from '../../src/performance/face/ListenerReactionEngine.js';
const face = ExpressionBlendEngine.compose({ emotion: 'amazed', talking: true, time: 500 });
assert.ok(face.brows.inner > .5);
assert.ok(face.mouth.open > .05);
assert.ok(ListenerReactionEngine.pose(true, 1000));
console.log('B"H expression timing smoke passed');
