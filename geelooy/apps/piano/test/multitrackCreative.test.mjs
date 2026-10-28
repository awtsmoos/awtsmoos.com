//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CreativeMultitrackRegression
 * The Awtsmoos keeps each original voice beneath a changing hue;
 * Awtsmoos.com tests the duplicates and the levels they renew.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MultitrackStudioDaas } from '../modules/workstation/song/multitrack/multitrackState.js';
import { multitrackAudioStore } from '../modules/workstation/song/multitrack/multitrackAudioStore.js';
import { createMultitrackClip, createMultitrackTrack } from '../modules/workstation/song/multitrack/multitrackProject.js';
import {
	duplicateMultitrackTrack,
	normalizeMultitrackTrack,
	setMultitrackTrackColor
} from '../modules/workstation/song/multitrack/multitrackTrackCreativeActions.js';
import { createMultitrackToneNode } from '../modules/workstation/song/multitrack/multitrackTrackTone.js';

/** @returns {Object} Isolated editor session with a partially trimmed buffer. */
function makeSession() {
	const session = new MultitrackStudioDaas();
	const samples = Float32Array.from([0.9, -0.4, 0.2, -0.25, 0, 0]);
	multitrackAudioStore.buffers.set('test-region', {
		sampleRate: 2,
		length: samples.length,
		numberOfChannels: 1,
		getChannelData: () => samples
	});
	const clip = createMultitrackClip({
		bufferId: 'test-region',
		timelineStart: 1,
		sourceOffset: 1,
		duration: 2,
		gain: 1
	});
	const track = createMultitrackTrack({ name: 'Recorded Violin', clips: [clip] });
	session.setProject({ ...session.project, tracks: [track] });
	return { session, track, clip };
}

/** @returns {void} Copies clip and track IDs, never their audio samples. */
test('duplicate track preserves source but assigns independent IDs', () => {
	const { session, track, clip } = makeSession();
	const copy = duplicateMultitrackTrack(session, track.id);
	assert.equal(session.project.tracks.length, 2);
	assert.equal(copy.clips.length, 1);
	assert.notEqual(copy.id, track.id);
	assert.notEqual(copy.clips[0].id, clip.id);
	assert.equal(copy.clips[0].bufferId, clip.bufferId);
	assert.equal(copy.clips[0].sourceOffset, clip.sourceOffset);
	assert.equal(session.selection.trackId, copy.id);
});

/** @returns {void} Ignores loud samples outside the visible split region. */
test('normalization reads audible clip region without changing source audio', () => {
	const { session, track } = makeSession();
	const originalSample = multitrackAudioStore.getBuffer('test-region').getChannelData(0)[0];
	const gain = normalizeMultitrackTrack(session, track.id);
	assert.ok(Math.abs(gain - 2) < 0.00001);
	assert.equal(session.project.tracks[0].gain, 2);
	assert.equal(multitrackAudioStore.getBuffer('test-region').getChannelData(0)[0], originalSample);
	assert.ok(Math.abs(originalSample - 0.9) < 0.000001);
});

/** @returns {void} Changing audio color never changes stored clip notes. */
test('sound color can change and reset without transcribing recorded audio', () => {
	const { session, track } = makeSession();
	setMultitrackTrackColor(session, track.id, 'reed');
	assert.equal(session.project.tracks[0].instrumentColor, 'reed');
	assert.throws(() => setMultitrackTrackColor(session, track.id, 'unknown'));
	setMultitrackTrackColor(session, track.id, 'original');
	assert.equal(session.project.tracks[0].instrumentColor, 'original');
	const filter = { frequency: {}, Q: {}, gain: {} };
	const context = { createBiquadFilter: () => filter };
	assert.equal(createMultitrackToneNode(context, 'original'), null);
	assert.equal(createMultitrackToneNode(context, 'reed'), filter);
	assert.equal(filter.type, 'peaking');
});
