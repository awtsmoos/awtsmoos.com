// B"H
// Boruch Hashem
// Blessed is He

const TRACK_DEFINITIONS = Object.freeze([
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
]);

/**
 * The timeline lanes are vessels for created action, sound, image, and nested
 * composition. The Awtsmoos renews their contents while their identities persist.
 */
export class NLETrackDefaults {
	/** Returns fresh track objects so projects never share mutable lane state. */
	static create() {
		return TRACK_DEFINITIONS.map(([id, name, type]) => ({
			id,
			name,
			type,
			locked: false,
			muted: false
		}));
	}
}
