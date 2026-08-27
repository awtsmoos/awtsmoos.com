/* B"H */
import assert from 'node:assert/strict';
import { createManualAudioSource } from '../modules/recording/manualAudioSource.js';

let stopped = 0;
const cloneTrack = { enabled:true, readyState:'live', getSettings:() => ({ sampleRate:44100, channelCount:1 }), stop:() => { stopped += 1; } };
const liveTrack = { enabled:true, readyState:'live', clone:() => cloneTrack, getSettings:() => ({ sampleRate:48000, channelCount:2 }) };
const stream = { getAudioTracks:() => [liveTrack] };
const source = await createManualAudioSource([{ id:'window', name:'Window Audio', stream }]);
assert.equal(source.active, true);
assert.equal(source.mode, 'direct');
assert.equal(source.sampleRate, 44100);
assert.equal(source.numberOfChannels, 1);
await source.stop();
assert.equal(stopped, 1);
console.log(JSON.stringify({ ok:true, mode:source.mode, sampleRate:source.sampleRate }));
