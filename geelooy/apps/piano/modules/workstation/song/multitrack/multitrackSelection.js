//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackSelection
 * @description
 * Daas knows which finite lane and clip the musician means while the Awtsmoos is beyond selecting one thing from another.
 * Awtsmoos.com keeps playhead, zoom, snap, and selection in one small mind, so touch gestures may stay clear, kind, and aligned.
 */

/** Owns editor-only multitrack selection and viewport state. */
export class MultitrackSelectionDaas {
	constructor() {
		this.trackId = null;
		this.clipId = null;
		this.playheadSeconds = 0;
		this.pixelsPerSecond = 72;
		this.gridBeats = 0.25;
	}

	/** Selects one clip and owning track. @param {string} trackId Track id. @param {string} clipId Clip id. @returns {void} */
	selectClip(trackId, clipId) {
		this.trackId = trackId;
		this.clipId = clipId;
	}

	/** Selects a track while clearing clip selection. @param {string} trackId Track id. @returns {void} */
	selectTrack(trackId) {
		this.trackId = trackId;
		this.clipId = null;
	}

	/** Clears current track and clip selection. @returns {void} */
	clearSelection() {
		this.trackId = null;
		this.clipId = null;
	}

	/** Moves playhead to a nonnegative second position. @param {number} seconds Time. @returns {void} */
	setPlayhead(seconds) {
		this.playheadSeconds = Math.max(0, Number(seconds) || 0);
	}

	/** Sets timeline zoom in pixels per second. @param {number} value Scale. @returns {void} */
	setZoom(value) {
		this.pixelsPerSecond = clamp(Number(value), 24, 320);
	}

	/** Sets musical snapping in beats; zero disables. @param {number} value Beat grid. @returns {void} */
	setGridBeats(value) {
		this.gridBeats = clamp(Number(value), 0, 4);
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}

export const multitrackSelection = new MultitrackSelectionDaas();
