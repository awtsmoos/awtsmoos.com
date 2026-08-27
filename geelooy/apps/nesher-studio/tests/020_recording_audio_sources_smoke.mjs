/* B"H */
import assert from 'node:assert/strict';
import { collectRecordableAudioSources, describeAudioSources, hasRecordableAudio } from '../modules/recording/sourceAudio.js';

const liveTrack = { enabled:true, readyState:'live' };
const endedTrack = { enabled:true, readyState:'ended' };
const mutedTrack = { enabled:false, readyState:'live' };
const sources = [
  { id:'cam', name:'Webcam + Mic', stream:{ getAudioTracks:() => [liveTrack, mutedTrack] } },
  { id:'tab', name:'Chrome Tab + Audio', stream:{ getAudioTracks:() => [endedTrack] } },
  { id:'canvas', name:'Canvas' }
];
const collected = collectRecordableAudioSources(sources);
assert.equal(collected.length, 1);
assert.equal(collected[0].sourceName, 'Webcam + Mic');
assert.equal(hasRecordableAudio(sources), true);
assert.equal(hasRecordableAudio([{ stream:{ getAudioTracks:() => [endedTrack, mutedTrack] } }]), false);
assert.match(describeAudioSources(sources), /1 audio track from Webcam \+ Mic/);
console.log(JSON.stringify({ ok:true, audioSources:collected.length, description:describeAudioSources(sources) }));
