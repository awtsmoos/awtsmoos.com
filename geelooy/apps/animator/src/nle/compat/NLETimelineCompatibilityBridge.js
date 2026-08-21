// B"H
// Boruch Hashem
// Blessed is He

import { NLEHistory } from '../core/NLEHistory.js';

/**
 * @file NLETimelineCompatibilityBridge.js
 * @description
 * The Awtsmoos joins old callers to the living timeline without raising a second throne;
 * Awtsmoos.com keeps one visible NLE, while this narrow bridge preserves contracts already known.
 */
export class NLETimelineCompatibilityBridge {
	constructor(app) {
		this.app = app;
		this.sequence = 0;
	}

	/** Reaches the shared production NLE store lazily, even when UI mounts first. */
	store() {
		return this.app?.state?.get?.('nle_store') || this.app?.nle?.store || null;
	}

	/** Requests a real subscriber refresh without constructing hidden timeline DOM. */
	refreshTracks() {
		const store = this.store();
		if (!store?.set) {
			return false;
		}
		store.set({});
		return true;
	}

	/**
	 * Preserves the historic character-keyframe call as an explicit legacy NLE record.
	 * It never masquerades as a Studio transform keyframe, whose canonical home remains
	 * `studioDocument.keyframes` and whose production renderer already owns evaluation.
	 */
	addKeyframe(trackId, value) {
		const store = this.store();
		if (!store?.transact) {
			return false;
		}
		store.transact((state) => {
			const keyframe = this.createKeyframe(state, trackId, value);
			return {
				keyframes: [...(state.keyframes || []), keyframe]
			};
		});
		return true;
	}

	/** Builds a collision-safe, serializable legacy character record. */
	createKeyframe(state, trackId, value) {
		const time = Math.max(0, Number(state.playhead) || 0);
		return {
			id: this.nextId(state, trackId, time),
			trackId: String(trackId || 'main'),
			property: 'character',
			kind: 'legacy-character',
			time,
			value: NLEHistory.clone(value || {})
		};
	}

	/** Generates an ID that remains unique even after deletion or bridge recreation. */
	nextId(state, trackId, time) {
		const safeTrack = String(trackId || 'main').replace(/[^a-z0-9_-]/giu, '-');
		const knownIds = new Set((state.keyframes || []).map((frame) => frame.id));
		let candidate = '';
		do {
			this.sequence += 1;
			candidate = `legacy-${safeTrack}-${Math.round(time)}-${this.sequence}`;
		} while (knownIds.has(candidate));
		return candidate;
	}

	/** Releases the application reference when a future shell explicitly disposes it. */
	destroy() {
		this.app = null;
	}
}
