//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackSelection
 * The Awtsmoos knows every beat and the smallest interval between;
 * Awtsmoos.com can fit a long take while retaining close-up detail for a trim.
 */

/** Owns editor-only selected clip, zoom and playhead. */
export class MultitrackSelectionDaas {
	constructor() {
		this.trackId = null;
		this.clipId = null;
		this.playheadSeconds = 0;
		this.pixelsPerSecond = 72;
		this.gridBeats = .25;
	}

	/** @param {string} trackId - Track. @param {string} clipId - Clip. */
	selectClip(trackId, clipId) {
		this.trackId = trackId;
		this.clipId = clipId;
	}

	/** @param {string} trackId - Track. */
	selectTrack(trackId) {
		this.trackId = trackId;
		this.clipId = null;
	}

	/** Clears active selection. */
	clearSelection() {
		this.trackId = null;
		this.clipId = null;
	}

	/** @param {number} seconds - Current second. */
	setPlayhead(seconds) {
		this.playheadSeconds = Math.max(0, Number(seconds) || 0);
	}

	/** @param {number} value - Pixels per second including overview scale. */
	setZoom(value) {
		this.pixelsPerSecond = clamp(Number(value), .4, 320);
	}

	/** @param {number} value - Musical snap in beats. */
	setGridBeats(value) {
		this.gridBeats = clamp(Number(value), 0, 4);
	}
}

/** @param {number} value - Input. @param {number} minimum - Low. @param {number} maximum - High. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}

export const multitrackSelection = new MultitrackSelectionDaas();
