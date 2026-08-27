import assert from 'node:assert/strict';
import { analyzeAudioFeatures, band } from '../modules/visualizer/audioFeatures.js';

const runtime = { prevBass:0, beatEnergy:0 };
const quiet = Float32Array.from({ length:64 }, (_, i) => i < 14 ? .1 : .05);
const loud = Float32Array.from({ length:64 }, (_, i) => i < 14 ? .9 : .2);
const first = analyzeAudioFeatures(quiet, runtime);
const second = analyzeAudioFeatures(loud, runtime);
assert.ok(first.level > 0);
assert.ok(second.bass > first.bass);
assert.equal(second.beat, true);
assert.equal(band({ features:second }, 'bass'), second.bass);
assert.equal(band({ level:.33 }, 'missing'), .33);
console.log('B"H visualizer audio features smoke passed');
