/* B"H */
import assert from 'node:assert/strict';
import { HLS_EXPORTS, requireMediabunnyExports } from '../modules/mediabunny/guards.js';
import { createHlsState, healthFromHlsState } from '../modules/mediabunny/hlsState.js';
import { mediabunnyVersionHint } from '../modules/mediabunny/url.js';

const fake = Object.fromEntries(HLS_EXPORTS.map(name => [name, function Vessel(){}]));
assert.equal(requireMediabunnyExports(fake), true);
assert.throws(() => requireMediabunnyExports({ Output:true }), /mediabunny_missing/);
const state = createHlsState({ sessionId:'s1', targetDuration:2 });
state.frameIndex = 7; state.pieces.push({ path:'seg.ts', bytes:12 }); state.uploaded = 12;
assert.deepEqual(healthFromHlsState(state), { state:'Running', session:'s1', frames:7, segments:1, uploaded:12, errors:0 });
assert.equal(mediabunnyVersionHint(), '1.46.0');
console.log(JSON.stringify({ ok:true, exports:HLS_EXPORTS.length, version:mediabunnyVersionHint() }));
