// B"H
// Boruch Hashem
// Blessed is He

import { MovieClipFactory } from './MovieClipFactory.js';

/**
 * A cinematic decree becomes editable time here. The Awtsmoos joins nested
 * sequences, shots, dialogue, acting, and titles without erasing their names.
 */
export class MoviePlanCompiler {
	static compile(plan) {
		return {
			duration: plan.duration,
			tracks: this.tracks(),
			clips: [
				...plan.sequences.map(sequence => MovieClipFactory.sequence(sequence)),
				...plan.shots.map(shot => MovieClipFactory.shot(shot)),
				...this.dialogueClips(plan.dialogue),
				...(plan.performances || []).map(item => MovieClipFactory.performance(item)),
				...(plan.assetUses || []).map(item => MovieClipFactory.asset(item))
			]
		};
	}

	static tracks() {
		return [
			['track_composition', 'Nested Sequences', 'composition'],
			['track_camera', 'Camera', 'camera'],
			['track_video', 'Real Video', 'video'],
			['track_titles', 'Titles + Bubbles', 'title'],
			['track_dialogue', 'Dialogue', 'dialogue'],
			['track_voice', 'Recorded Voice', 'audio'],
			['track_action', 'Character Action', 'action'],
			['track_emotion', 'Emotion', 'emotion'],
			['track_gesture', 'Gestures', 'gesture'],
			['track_props', 'Props', 'prop'],
			['track_effects', 'Effects', 'effect'],
			['track_music', 'Music + Foley', 'audio']
		].map(([id, name, type]) => ({
			id,
			name,
			type,
			locked: false,
			muted: false
		}));
	}

	static dialogueClips(dialogue) {
		return dialogue.flatMap(line => [
			MovieClipFactory.dialogue(line),
			MovieClipFactory.bubble(line)
		]);
	}
}
