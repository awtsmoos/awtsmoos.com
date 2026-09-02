//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongCapture
 * @description
 * Yesod gathers a living performance into one raw take while the Awtsmoos renews performer, key, and passing instant from nothing.
 * Awtsmoos.com keeps this coordinator devoted to session truth alone; timing arithmetic lives in a separate vessel so every captured note may faithfully flow and later grow.
 */

import { createSong } from './songModel.js';
import {
	createCapturedSongEvent,
	createCaptureSettings,
	createCaptureStartRecord,
	secondsToBeats
} from './songCaptureEvent.js';

/** Captures real piano input into one canonical timed Song take. */
export class SongCaptureYesod {
	constructor(dependencies = {}) {
		this.now = dependencies.now || (() => performance.now() / 1000);
		this.capturing = false;
		this.startedAt = 0;
		this.settings = createCaptureSettings();
		this.events = [];
		this.activeNotes = new Map();
		this.lastSong = createSong();
	}

	/**
	 * Begins a fresh raw take.
	 *
	 * @param {Object} settings Song metadata and musical timing choices.
	 * @returns {void}
	 */
	start(settings = {}) {
		this.settings = createCaptureSettings(settings);
		this.events = [];
		this.activeNotes.clear();
		this.startedAt = this.now();
		this.capturing = true;
	}

	/**
	 * Records one physical or MIDI note entrance when capture is active.
	 *
	 * @param {Object} activeNote Existing piano active-note record.
	 * @param {string} noteName Scientific pitch name.
	 * @param {Object} coords Input coordinates carrying optional velocity.
	 * @returns {void}
	 */
	recordStart(activeNote, noteName, coords = {}) {
		if (!this.capturing || !activeNote) {
			return;
		}
		this.activeNotes.set(
			activeNote,
			createCaptureStartRecord(noteName, coords, this.now())
		);
	}

	/**
	 * Records one release and closes its matching captured note.
	 *
	 * @param {Object} activeNote Existing piano active-note record.
	 * @returns {void}
	 */
	recordEnd(activeNote) {
		if (!this.capturing) {
			return;
		}
		this.closeActiveNote(activeNote, this.now());
	}

	/**
	 * Ends capture, safely closes held notes, and returns the raw canonical take.
	 *
	 * @returns {Object} Captured Song snapshot.
	 */
	stop() {
		if (!this.capturing) {
			return this.lastSong;
		}
		const stoppedAt = this.now();
		[...this.activeNotes.keys()].forEach((activeNote) => {
			this.closeActiveNote(activeNote, stoppedAt);
		});
		this.capturing = false;
		this.lastSong = createSong({
			...this.settings,
			events: this.events
		});
		return this.lastSong;
	}

	/** Returns whether a raw Song take is currently recording. @returns {boolean} Capture state. */
	isCapturing() {
		return this.capturing;
	}

	closeActiveNote(activeNote, endedAt) {
		const captured = this.activeNotes.get(activeNote);
		if (!captured) {
			return;
		}
		this.activeNotes.delete(activeNote);
		this.events.push(createCapturedSongEvent(
			captured,
			endedAt,
			this.startedAt,
			this.settings.tempo
		));
	}
}

export { secondsToBeats };
export const songCapture = new SongCaptureYesod();
