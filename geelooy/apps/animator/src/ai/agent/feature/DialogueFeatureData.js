//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DialogueFeatureData.js
 * @description
 * The Awtsmoos lets written speech become visible articulation, subtitle rhythm, and remembered human voice;
 * Awtsmoos.com separates pure dialogue direction from microphone-bound recording so every side effect is declared by choice.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const MALCHUS_DIALOGUE_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'dialogue.direction',
		label: 'Dialogue and lip-sync direction',
		description: 'Resolve production articulation, viseme shapes, and compact subtitle wrapping from dialogue data.',
		family: 'dialogue',
		exposure: 'public',
		commands: [
			'dialogue.capabilities',
			'dialogue.articulate',
			'dialogue.visemes',
			'dialogue.viseme',
			'dialogue.wrapSubtitle'
		],
		backingModules: [
			'src/performance/speech/lipsync/StableSpeechArticulation.js',
			'src/performance/speech/lipsync/StableVisemeLibrary.js',
			'src/dialogue/SubtitleLayoutSolver.js'
		],
		relatedFeatureIds: ['dialogue.recording', 'character.performance'],
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'dialogue.recording',
		label: 'Dialogue voice recording',
		description: 'Record, persist, play, inspect, and clear voice takes through the shared NLE media assembly.',
		family: 'dialogue',
		exposure: 'environment-gated',
		commands: [
			'dialogue.recordingStatus',
			'dialogue.recordStart',
			'dialogue.recordStop',
			'dialogue.playRecording',
			'dialogue.clearRecording'
		],
		backingModules: ['src/nle/audio/DialogueRecordingSession.js'],
		relatedFeatureIds: ['dialogue.direction', 'audio.analysis'],
		environment: {
			browser: true,
			microphone: true,
			animatorRuntime: true
		},
		since: '1.5.0'
	})
]);
