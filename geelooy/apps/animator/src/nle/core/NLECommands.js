// B"H
// Boruch Hashem
// Blessed is He

import { NLEClipCommands } from './NLEClipCommands.js';
import { NLETransformCommands } from './NLETransformCommands.js';

/**
 * This public facade names every professional edit in one familiar vocabulary.
 * The Awtsmoos renews the timeline; focused command vessels perform each deed.
 */
export class NLECommands {
	/** Adds one clip. */
	static addClip(store, clip) {
		return NLEClipCommands.add(store, clip);
	}

	/** Moves one clip. */
	static moveClip(store, id, start, trackId = null) {
		return NLEClipCommands.move(store, id, start, trackId);
	}

	/** Trims one clip. */
	static trimClip(store, id, duration) {
		return NLEClipCommands.trim(store, id, duration);
	}

	/** Splits one clip at the playhead or requested absolute time. */
	static splitClip(store, id, timeMs = store.get().playhead) {
		return NLEClipCommands.split(store, id, timeMs);
	}

	/** Duplicates one clip. */
	static duplicateClip(store, id, offset = null) {
		return NLEClipCommands.duplicate(store, id, offset);
	}

	/** Deletes one clip. */
	static deleteClip(store, id) {
		return NLEClipCommands.remove(store, id);
	}

	/** Ripple-deletes one clip. */
	static rippleDelete(store, id) {
		return NLEClipCommands.rippleRemove(store, id);
	}

	/** Updates one transform channel. */
	static updateTransform(store, id, property, value) {
		return NLETransformCommands.update(store, id, property, value);
	}

	/** Adds one transform keyframe. */
	static addTransformKeyframe(store, id, time = store.get().playhead) {
		return NLETransformCommands.addKeyframe(store, id, time);
	}

	/** Sets transient playhead time without adding undo noise. */
	static scrub(store, milliseconds) {
		store.set((state) => ({
			playhead: Math.max(0, Math.min(state.duration, Number(milliseconds) || 0))
		}));
	}

	/** Selects one clip without creating a history step. */
	static selectClip(store, id) {
		store.set({ selectedClipId: id });
	}

	/** Selects one scene entity without creating a history step. */
	static selectEntity(store, id) {
		store.set({ selectedEntityId: id });
	}

	/** Toggles a track's muted or locked state. */
	static toggleTrack(store, id, property) {
		if (!['muted', 'locked'].includes(property)) {
			return;
		}
		store.transact((state) => ({
			tracks: state.tracks.map((track) => track.id === id
				? { ...track, [property]: !track[property] }
				: track)
		}));
	}
}
