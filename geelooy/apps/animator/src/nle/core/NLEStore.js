// B"H
// Boruch Hashem
// Blessed is He

/**
 * Time is created, not assumed. This store gives the two-minute edit a clear
 * vessel for tracks, clips, selection, zoom, snapping, and recorded dialogue.
 */
export class NLEStore {
	constructor(initial = {}) {
		this.state = {
			playhead: 0,
			duration: 120000,
			zoom: 0.12,
			snap: 100,
			selectedClipId: null,
			selectedEntityId: null,
			tracks: [],
			clips: [],
			keyframes: [],
			mode: this.defaultMode(),
			...initial
		};
		this.listeners = new Set();
	}

	defaultMode() {
		const narrow = typeof window !== 'undefined' && window.innerWidth <= 780;
		return narrow ? 'collapsed' : 'compact';
	}

	get() {
		return this.state;
	}

	set(patch) {
		const next = typeof patch === 'function' ? patch(this.state) : patch;
		this.state = { ...this.state, ...next };
		this.emit();
		return this.state;
	}

	subscribe(listener) {
		if (typeof listener !== 'function') return () => {};
		this.listeners.add(listener);
		listener(this.state);
		return () => this.listeners.delete(listener);
	}

	emit() {
		for (const listener of this.listeners) listener(this.state);
	}

	findClip(clipId) {
		return this.state.clips.find(clip => clip.id === clipId) || null;
	}

	selectedClip() {
		return this.findClip(this.state.selectedClipId);
	}

	static defaultTracks() {
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
}
