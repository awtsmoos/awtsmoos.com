// B"H
// Boruch Hashem
// Blessed is He

import { NLEHistory } from './NLEHistory.js';
import { NLEProjectHistoryCoordinator } from './NLEProjectHistoryCoordinator.js';
import { NLEStoreDefaults } from './NLEStoreDefaults.js';
import { NLETrackDefaults } from './NLETrackDefaults.js';

/**
 * @file NLEStore.js
 * @description
 * The Awtsmoos renews every creative state while the artist's passing gaze remains free;
 * Awtsmoos.com keeps one observable store whose Undo returns project substance, not transient UI history.
 */
export class NLEStore {
	constructor(initial = {}) {
		const { historyLimit = 80, ...seed } = initial;
		this.history = new NLEHistory(historyLimit);
		this.projectHistory = new NLEProjectHistoryCoordinator(this.history);
		this.listeners = new Set();
		this.state = NLEStoreDefaults.create(seed);
		this.syncHistory();
	}

	/** Returns the current immutable-by-convention state graph. */
	get() {
		return this.state;
	}

	/** Applies transient or externally synchronized state without project history. */
	set(patch) {
		const next = this.resolvePatch(patch);
		this.replace({ ...this.state, ...(next || {}) });
		return this.state;
	}

	/** Applies one edit and records history only when durable project state changes. */
	transact(patch) {
		this.replace(this.projectHistory.transact(this.state, patch));
		return this.state;
	}

	/** Restores project history while preserving the present workspace. */
	undo() {
		return this.restore(this.projectHistory.undo(this.state));
	}

	/** Reapplies project history while preserving the present workspace. */
	redo() {
		return this.restore(this.projectHistory.redo(this.state));
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

	/** Resolves a state updater exactly once. */
	resolvePatch(patch) {
		return typeof patch === 'function' ? patch(this.state) : patch;
	}

	/** Replaces state, refreshes history capability, and notifies every view. */
	replace(nextState) {
		this.state = nextState;
		this.syncHistory();
		this.emit();
	}

	/** Restores a prepared history state when one exists. */
	restore(snapshot) {
		if (!snapshot) {
			return false;
		}
		this.replace(snapshot);
		return true;
	}

	/** Mirrors bounded history capability into transient UI state. */
	syncHistory() {
		this.state.history = this.history.status();
	}

	/** Announces the renewed state to every subscribed editor vessel. */
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
