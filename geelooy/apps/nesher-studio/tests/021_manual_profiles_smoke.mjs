/* B"H */
import assert from 'node:assert/strict';
import { DEFAULT_PROFILE_ID, bitrateForProfile, getRecordingProfile, MANUAL_RECORDING_PROFILES } from '../modules/recording/manualRecordingProfile.js';

const speed = getRecordingProfile(DEFAULT_PROFILE_ID);
const balanced = getRecordingProfile('balanced-vp8');
const quality = getRecordingProfile('quality-vp9');
assert.equal(speed.codec, 'vp8');
assert.equal(speed.maxQueue, 1);
assert.ok(balanced.bitrateScale > speed.bitrateScale);
assert.ok(quality.bitrateScale > balanced.bitrateScale);
assert.ok(bitrateForProfile({ width:1280, height:720, fps:30 }, speed) >= 1200000);
assert.equal(MANUAL_RECORDING_PROFILES.length, 4);
console.log(JSON.stringify({ ok:true, defaultProfile:DEFAULT_PROFILE_ID, profiles:MANUAL_RECORDING_PROFILES.length }));
