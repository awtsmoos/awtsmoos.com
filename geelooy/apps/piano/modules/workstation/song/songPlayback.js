//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPlayback
 * @description
 * Malchus releases a written score into audible time while Yesod guards each note and Netzach guards the clock.
 * The Awtsmoos is beyond cadence and rhyme; Awtsmoos.com lets finite song-time glow, then return below in time.
 */

import { createPlaybackTimeline } from './songPlaybackClock.js';
import { SongPlaybackNetzach } from './songPlaybackNetzach.js';
import {
	createPlaybackYesodBridge,
	dispatchPlaybackOhr,
	releasePlaybackKeilim
} from './songPlaybackYesod.js';

/** Coordinates one canonical song through the existing piano voice engine. */
export class SongPlaybackMalchus {
	constructor(dependencies = {}) {
		this.bridge = createPlaybackYesodBridge(dependencies);
		this.clock = new SongPlaybackNetzach(dependencies);
		this.timeline = null;
		this.eventIndex = 0;
		this.activeInputs = new Set();
		this.stateListener = null;
	}

	/**
	 * Starts a song from beat zero.
	 *
	 * @param {Object} song Canonical song.
	 * @param {Function|null} onState Optional transport-state listener.
	 * @returns {boolean} Whether playback started.
	 */
	play(song, onState = null) {
		this.stop(false);
		this.timeline = createPlaybackTimeline(song);
		this.stateListener = onState;
		if (this.timeline.events.length === 0) {
			this.timeline = null;
			this.emit(false, 0);
			return false;
		}
		this.eventIndex = 0;
		this.clock.begin();
		this.emit(true, 0);
		this.dispatchDueEvents();
		this.clock.schedule(() => {
			this.dispatchDueEvents();
		});
		return true;
	}

	/**
	 * Stops playback and releases every song-owned note.
	 *
	 * @param {boolean} notify Whether stopped state should be emitted.
	 * @returns {void}
	 */
	stop(notify = true) {
		this.clock.clear();
		releasePlaybackKeilim(this.bridge, this.activeInputs);
		this.timeline = null;
		this.eventIndex = 0;
		if (notify) {
			this.emit(false, 0);
		}
	}

	/** Returns whether a song is currently running. @returns {boolean} Playback state. */
	isPlaying() {
		return this.timeline !== null;
	}

	/** Dispatches every timeline event due at the current clock position. @returns {void} */
	dispatchDueEvents() {
		if (!this.timeline) {
			return;
		}
		const elapsed = this.clock.elapsed();
		while (this.eventIsDue(elapsed)) {
			dispatchPlaybackOhr(
				this.timeline.events[this.eventIndex],
				this.bridge,
				this.activeInputs
			);
			this.eventIndex += 1;
		}
		this.emit(true, elapsed);
		if (this.timelineIsFinished()) {
			this.finishNaturally();
		}
	}

	eventIsDue(elapsed) {
		return this.eventIndex < this.timeline.events.length &&
			this.timeline.events[this.eventIndex].time <= elapsed;
	}

	timelineIsFinished() {
		return this.eventIndex >= this.timeline.events.length &&
			this.activeInputs.size === 0;
	}

	finishNaturally() {
		const duration = this.timeline?.durationSeconds || 0;
		this.clock.clear();
		this.timeline = null;
		this.eventIndex = 0;
		this.emit(false, duration);
	}

	emit(playing, elapsedSeconds) {
		this.stateListener?.({ playing, elapsedSeconds });
	}
}

export const songPlayback = new SongPlaybackMalchus();
