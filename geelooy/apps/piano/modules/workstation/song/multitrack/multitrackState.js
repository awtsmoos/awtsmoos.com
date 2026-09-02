//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackState
 * @description
 * Daas remembers project, playhead, selection, zoom, and status while the Awtsmoos remains beyond memory and distinction.
 * Awtsmoos.com keeps one truthful editor state beneath every drag and tap, so the screen may redraw freely without becoming the source of the musical map.
 */

import { createMultitrackProject } from './multitrackProject.js';
import { MultitrackSelectionDaas } from './multitrackSelection.js';

/** Owns mutable editor-session references to immutable-style project snapshots. */
export class MultitrackStudioDaas {
	constructor() {
		this.project = createMultitrackProject();
		this.selection = new MultitrackSelectionDaas();
		this.status = 'Multitrack ready · import audio to add a layer.';
		this.playing = false;
		this.listeners = new Set();
	}

	/** Replaces project snapshot and notifies views. @param {Object} project New project. @returns {Object} Stored project. */
	setProject(project) {
		this.project = project;
		this.emit();
		return project;
	}

	/** Stores status text and notifies views. @param {string} message Human status. @returns {void} */
	setStatus(message) {
		this.status = String(message || 'Multitrack ready.');
		this.emit();
	}

	/** Selects one clip and updates views. @param {string} trackId Track id. @param {string} clipId Clip id. @returns {void} */
	selectClip(trackId, clipId) {
		this.selection.selectClip(trackId, clipId);
		this.emit();
	}

	/** Moves playhead without changing project data. @param {number} seconds Timeline seconds. @returns {void} */
	setPlayhead(seconds) {
		this.selection.setPlayhead(seconds);
		this.emit();
	}

	/** Changes horizontal zoom. @param {number} pixelsPerSecond Timeline scale. @returns {void} */
	setZoom(pixelsPerSecond) {
		this.selection.setZoom(pixelsPerSecond);
		this.emit();
	}

	/** Changes beat snapping. @param {number} gridBeats Grid in beats. @returns {void} */
	setGridBeats(gridBeats) {
		this.selection.setGridBeats(gridBeats);
		this.project = {
			...this.project,
			gridBeats: this.selection.gridBeats
		};
		this.emit();
	}

	/** Stores transport state. @param {boolean} playing Playback flag. @returns {void} */
	setPlaying(playing) {
		this.playing = Boolean(playing);
		this.emit();
	}

	/** Subscribes to editor changes. @param {Function} listener View callback. @returns {Function} Unsubscribe. */
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	emit() {
		this.listeners.forEach((listener) => listener(this));
	}
}

export const multitrackStudioState = new MultitrackStudioDaas();
