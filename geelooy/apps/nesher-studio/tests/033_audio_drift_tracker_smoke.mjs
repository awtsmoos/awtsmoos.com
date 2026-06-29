import assert from 'node:assert/strict';
import { createAudioDriftTracker, addAudioDriftSample, audioDriftSummary } from '../modules/audio/sync/audioDriftTracker.js';
const tracker = createAudioDriftTracker();
addAudioDriftSample(tracker, { audioTimestamp:101000, videoTimestamp:100000 });
addAudioDriftSample(tracker, { audioTimestamp:102000, videoTimestamp:100000 });
assert.equal(audioDriftSummary(tracker).averageUs, 1500);
console.log('B"H audio drift tracker smoke passed');
