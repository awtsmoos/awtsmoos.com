// B"H
// Boruch Hashem
// Blessed is He
import { NLEHistory } from './NLEHistory.js';
import { NLETrackDefaults } from './NLETrackDefaults.js';

/**
 * Time is created, not assumed. This store gives the edit one observable vessel
 * while the Awtsmoos permits every deliberate mutation to return through undo.
 */
export class NLEStore {
	constructor(initial = {}) {
		const { historyLimit = 80, ...seed } = initial;
		this.history = new NLEHistory(historyLimit);
		this.listeners = new Set();
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
			...seed
		};
		this.syncHistory();
	}

	/** Chooses a compact mobile manifestation without changing project data. */
	defaultMode() {
		const narrow = typeof window !== 'undefined' && window.innerWidth <= 780;
		return narrow ? 'collapsed' : 'compact';
	}

	/** Returns the current immutable-by-convention state object. */
	get() {
		return this.state;
	}

	/** Applies transient state such as selection, playhead, or restore status. */
	set(patch) {
		this.apply(patch);
		return this.state;
	}

	/** Applies one undoable project edit. */
	transact(patch) {
		this.history.record(this.state);
		this.apply(patch);
		return this.state;
	}

	/** Restores the previous project state when one exists. */
	undo() {
		const previous = this.history.undo(this.state);
		return this.restore(previous);
	}

	/** Restores the next project state when one exists. */
	redo() {
		const next = this.history.redo(this.state);
		return this.restore(next);
	}

	/** Subscribes a renderer and immediately reveals current state. */
	subscribe(listener) {
		if (typeof listener !== 'function') {
			return () => {};
		}
		this.listeners.add(listener);
		listener(this.state);
		return () => this.listeners.delete(listener);
	}

	/** Finds one clip by stable identity. */
	findClip(clipId) {
		return this.state.clips.find((clip) => clip.id === clipId) || null;
	}

	/** Returns the selected clip or null. */
	selectedClip() {
		return this.findClip(this.state.selectedClipId);
	}

	apply(patch) {
		const next = typeof patch === 'function' ? patch(this.state) : patch;
		this.state = { ...this.state, ...(next || {}) };
		this.syncHistory();
		this.emit();
	}

	restore(snapshot) {
		if (!snapshot) {
			return false;
		}
		this.state = NLEHistory.clone(snapshot);
		this.syncHistory();
		this.emit();
		return true;
	}

	syncHistory() {
		this.state.history = this.history.status();
	}

	emit() {
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	/** Defines the production lanes shared by preview and package export. */
	static defaultTracks() {
		return NLETrackDefaults.create();
	}
}
