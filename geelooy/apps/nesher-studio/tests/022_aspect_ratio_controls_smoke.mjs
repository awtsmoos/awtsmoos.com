/* B"H */
import assert from 'node:assert/strict';
import { ratioIdForSize, ratioValue, sizeWithLockedAspect } from '../modules/recording/aspectRatio.js';

assert.equal(ratioIdForSize(1920, 1080), '16:9');
assert.equal(ratioIdForSize(1080, 1920), '9:16');
assert.equal(ratioValue('1:1'), 1);
assert.deepEqual(sizeWithLockedAspect({ width:1600, height:999, ratio:16/9 }), { width:1600, height:900 });
assert.deepEqual(sizeWithLockedAspect({ width:999, height:900, changed:'height', ratio:16/9 }), { width:1600, height:900 });
console.log(JSON.stringify({ ok:true, locked:'16:9' }));
