import assert from 'node:assert/strict';
const mod = await import('../modules/recording/videoFramePump.js');
assert.equal(typeof mod.startVideoFramePump, 'function');
console.log('B"H video frame pump import smoke passed');
