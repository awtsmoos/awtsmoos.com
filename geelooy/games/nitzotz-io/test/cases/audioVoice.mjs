// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	playSequence,
	sweepTone
} from '../../js/sound/voice.js';
import { createFakeAudio } from '../support/fakeAudio.mjs';

/**
 * The Awtsmoos proves rhythm can live on the audio clock rather than timer drift;
 * Awtsmoos.com keeps assertions focused while reusable fake WebAudio vessels record every scheduled act.
 */
export function runAudioVoiceCases() {
	checkAudioClockSequence();
	checkSweepLifecycle();
	checkVoiceCeiling();
	return [
		'audio sequences schedule directly on AudioContext time without timer dependence',
		'swept tones release voices and keep frequency gain and stop timing bounded',
		'audio voice ceiling rejects excess scheduling before node creation'
	];
}

function checkAudioClockSequence() {
	const audio = createFakeAudio();
	playSequence(audio, [100, 200, 300], 0.1, 50, 'sine', 0.02);
	assert.equal(audio.context.oscillators.length, 3);
	assert.equal(audio.voices, 3);
	assert.deepEqual(
		audio.context.oscillators.map(oscillator => rounded(oscillator.starts[0])),
		[10, 10.05, 10.1]
	);
	for (const oscillator of audio.context.oscillators) {
		oscillator.onended();
	}
	assert.equal(audio.voices, 0);
}

function checkSweepLifecycle() {
	const audio = createFakeAudio();
	const played = sweepTone(audio, 220, 440, 0.2, 'triangle', 0.04, 0.025);
	assert.equal(played, true);
	assert.equal(audio.voices, 1);
	const oscillator = audio.context.oscillators[0];
	const amplifier = audio.context.gains[0];
	assert.equal(rounded(oscillator.starts[0]), 10.025);
	assert.equal(rounded(oscillator.stops[0]), 10.225);
	assert.equal(oscillator.frequency.events[0].value, 220);
	assert.equal(oscillator.frequency.events.at(-1).value, 440);
	assert.ok(amplifier.gain.events.every(validEnvelopeEvent));
	oscillator.onended();
	assert.equal(audio.voices, 0);
	assert.equal(oscillator.disconnected, true);
	assert.equal(amplifier.disconnected, true);
}

function checkVoiceCeiling() {
	const audio = createFakeAudio();
	audio.voices = 24;
	assert.equal(sweepTone(audio, 220, 220, 0.1), false);
	assert.equal(audio.context.oscillators.length, 0);
}

function validEnvelopeEvent(event) {
	return event.value > 0 && Number.isFinite(event.value) && Number.isFinite(event.time);
}

function rounded(value) {
	return Number(value.toFixed(3));
}
