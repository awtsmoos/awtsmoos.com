import assert from 'node:assert/strict';
import { getOpusProfile } from '../modules/recording/audio/opusProfiles.js';
import { normalizeAudioTimestamp } from '../modules/recording/audio/audioTimestampPolicy.js';
assert.equal(getOpusProfile('music').bitrate, 224000);
assert.equal(normalizeAudioTimestamp(100, -200), 0);
console.log('B"H audio encoding profiles smoke passed');
