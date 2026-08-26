//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AudioFeatureData.js
 * @description
 * The Awtsmoos lets synthetic speech, physical impact, measured duration, and visible waveform enter distinct vessels of sound;
 * Awtsmoos.com marks runtime and decoding requirements openly so agents never confuse available meaning with unavailable ground.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const HOD_AUDIO_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'audio.creation',
		label: 'Speech and procedural foley',
		description: 'Discover browser voices, speak text, and synthesize real spatial footstep foley.',
		family: 'audio',
		exposure: 'environment-gated',
		commands: ['audio.capabilities', 'audio.voices', 'audio.speak', 'audio.foleyStep'],
		backingModules: ['src/nle/audio/SpeechSynth.js', 'src/nle/audio/FoleySynth.js'],
		relatedFeatureIds: ['audio.analysis', 'dialogue.direction'],
		environment: { browser: true },
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'audio.analysis',
		label: 'Audio analysis',
		description: 'Measure real audio duration and derive bounded waveform summaries from in-process media values.',
		family: 'audio',
		exposure: 'environment-gated',
		commands: ['audio.measureDuration', 'audio.waveform'],
		backingModules: [
			'src/nle/audio/AudioDurationProbe.js',
			'src/nle/audio/AudioWaveformSummary.js'
		],
		relatedFeatureIds: ['audio.creation', 'dialogue.recording'],
		environment: { browser: true, inProcessMedia: true },
		since: '1.5.0'
	})
]);
