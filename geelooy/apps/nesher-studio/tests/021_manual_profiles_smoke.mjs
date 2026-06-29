/* B"H */
import assert from 'node:assert/strict';
import { DEFAULT_PROFILE_ID, bitrateForProfile, getRecordingProfile, MANUAL_RECORDING_PROFILES } from '../modules/recording/manualRecordingProfile.js';

const speed = getRecordingProfile(DEFAULT_PROFILE_ID);
const quality = getRecordingProfile('quality-vp9');
assert.equal(speed.codec, 'vp8');
assert.equal(speed.muxCodec, 'V_VP8');
assert.ok(quality.bitrateScale > speed.bitrateScale);
assert.ok(bitrateForProfile({ width:1280, height:720, fps:30 }, speed) >= 900000);
assert.equal(MANUAL_RECORDING_PROFILES.length, 3);
console.log(JSON.stringify({ ok:true, defaultProfile:DEFAULT_PROFILE_ID, profiles:MANUAL_RECORDING_PROFILES.length }));
