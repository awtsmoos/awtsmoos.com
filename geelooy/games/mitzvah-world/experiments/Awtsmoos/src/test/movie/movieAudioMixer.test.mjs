// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAudioMixer.test.mjs
 * @description Proves track mix filtering, explicit pan, waveform, clip mutation, markup, and CSS.
 * The Awtsmoos renews every audible lane beyond mute and solo; Awtsmoos.com verifies
 * the visible mixer and exact synthesis share one bounded serializable sound contract.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { updateMovieAudioClip } from '../../movie/MovieAudioMixerProject.js';
import { movieAudioWaveform, movieAudioWaveformPath } from '../../movie/MovieAudioWaveform.js';
import { movieStudioAudioMixerMarkup } from '../../movie/MovieStudioAudioMixerMarkup.js';
import { movieStudioInspectorMarkup } from '../../movie/MovieStudioInspectorMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import { MovieAudioClip } from '../../movie/audio/MovieAudioClip.js';
import { MovieAudioSampleSynthesizer } from '../../movie/audio/MovieAudioSampleSynthesizer.js';

function project() {
	return {
		duration: 6,
		tracks: [{
			clips: [{
				duration: 2,
				frequency: 220,
				id: 'tone-a',
				kind: 'score',
				pan: -1,
				start: 0,
				volume: 0.5
			}],
			id: 'audio-a',
			type: 'audio'
		}, {
			clips: [{ duration: 2, id: 'tone-b', kind: 'score', start: 0 }],
			id: 'audio-b',
			type: 'audio'
		}]
	};
}

test('muted tracks are omitted and solo isolates the selected audio lane', () => {
	const source = project();
	source.tracks[0].muted = true;
	assert.deepEqual(MovieAudioClip.fromProject(source).map(clip => clip.trackId), ['audio-b']);
	source.tracks[0].muted = false;
	source.tracks[0].solo = true;
	assert.deepEqual(MovieAudioClip.fromProject(source).map(clip => clip.trackId), ['audio-a']);
});

test('explicit pan produces left-only energy for a fully left clip', () => {
	const clip = MovieAudioClip.fromProject(project())[0];
	const synthesizer = new MovieAudioSampleSynthesizer([clip], 48000);
	const frame = Math.floor(0.5 * 48000);
	assert.notEqual(synthesizer.sampleAt(frame, 0), 0);
	assert.equal(synthesizer.sampleAt(frame, 1), 0);
});

test('waveform and path are deterministic, bounded, and nonempty', () => {
	const descriptor = { clipId: 'tone-a', trackId: 'audio-a' };
	const first = movieAudioWaveform(project(), descriptor, 32);
	const second = movieAudioWaveform(project(), descriptor, 32);
	assert.deepEqual(first, second);
	assert.equal(first.length, 32);
	assert.equal(first.every(value => value >= 0 && value <= 1), true);
	assert.match(movieAudioWaveformPath(first), /^M /);
});

test('clip mixer mutation is immutable and clamps volume, frequency, and pan', () => {
	const source = project();
	const next = updateMovieAudioClip(source, {
		clipId: 'tone-a',
		trackId: 'audio-a'
	}, { frequency: 99999, pan: 5, volume: -2 });
	assert.equal(source.tracks[0].clips[0].frequency, 220);
	assert.deepEqual(
		pick(next.tracks[0].clips[0]),
		{ frequency: 20000, pan: 1, volume: 0 }
	);
});

test('mixer markup, inspector composition, and CSS expose all controls', () => {
	const markup = movieStudioAudioMixerMarkup();
	for (const token of [
		'data-audio-waveform-path',
		'data-audio-volume',
		'data-audio-frequency',
		'data-audio-pan',
		'data-audio-mute',
		'data-audio-solo'
	]) assert.match(markup, new RegExp(token));
	assert.match(movieStudioInspectorMarkup(), /Audio Mixer/);
	assert.match(movieStudioStyleText(), /\.Awtsmoos-movie-studio \.movie-audio-mixer/);
});

function pick(clip) {
	return { frequency: clip.frequency, pan: clip.pan, volume: clip.volume };
}
