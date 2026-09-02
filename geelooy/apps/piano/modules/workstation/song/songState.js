//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongStudioState
 * @description
 * Malchus remembers what the editor is showing while Yesod preserves the untouched raw take beneath every derived arrangement.
 * The Awtsmoos is beyond original and remix; Awtsmoos.com keeps both vessels distinct so experimentation may fly while source-truth never dies.
 */

import { createSong } from './songModel.js';
import { serializeSong } from './songSerializer.js';

/** Owns Song Studio editor state while keeping the raw take recoverable. */
export class SongStudioStateMalchus {
	constructor() {
		this.rawSong = createSong({ title: 'Untitled Take' });
		this.currentSong = this.rawSong;
		this.editorText = serializeSong(this.currentSong);
		this.status = 'Ready · paste, upload, or record a performance.';
		this.tempo = 120;
		this.grid = 0.25;
		this.remixStyle = 'ratchet-drop';
		this.seed = 'awtsmoos';
		this.ratchet = defaultRatchetSettings();
	}

	/**
	 * Stores a song and optionally establishes it as the immutable raw take.
	 *
	 * @param {Object} song Canonical Song snapshot.
	 * @param {Object} options State update choices.
	 * @returns {Object} Stored current song.
	 */
	setSong(song, options = {}) {
		if (options.asRaw) {
			this.rawSong = song;
		}
		this.currentSong = song;
		this.tempo = song.tempo;
		this.grid = song.grid;
		this.editorText = serializeSong(song);
		return song;
	}

	/** Restores the last raw take after any derived normalization or remix. @returns {Object} Restored song. */
	restoreRaw() {
		return this.setSong(this.rawSong);
	}

	/** Updates editable source text without parsing it prematurely. @param {string} text Editor contents. @returns {void} */
	setEditorText(text) {
		this.editorText = String(text ?? '');
	}

	/** Updates the visible workstation status message. @param {string} message Status text. @returns {void} */
	setStatus(message) {
		this.status = String(message || 'Ready');
	}

	/** Returns remix options projected from current editor controls. @returns {Object} Remix options. */
	remixOptions() {
		return {
			style: this.remixStyle,
			seed: this.seed,
			sectionBars: 4,
			ratchet: { ...this.ratchet }
		};
	}
}

/** Creates safe expressive defaults for the shrinking-repeat editor. @returns {Object} Ratchet controls. */
export function defaultRatchetSettings() {
	return {
		preset: 'ratchet-rise',
		sliceStart: 0,
		sliceLength: 1,
		repetitions: 7,
		shortenRatio: 0.5,
		minimumSlice: 1 / 32,
		velocityRamp: 0.04,
		gate: 0.75,
		gapAfter: 0.25
	};
}

export const songStudioState = new SongStudioStateMalchus();
