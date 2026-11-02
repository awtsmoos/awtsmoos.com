//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackSelection
 * @description
 * Daas knows which finite lane, clip, playhead, zoom, and beat grid the musician means while the Awtsmoos remains beyond selection.
 * Awtsmoos.com permits an extremely wide Fit range without abandoning a safe finite scale, so long songs and tiny edits can both find their revelation.
 */

import {
	MAX_MULTITRACK_ZOOM,
	MIN_MULTITRACK_ZOOM
} from './multitrackTimelineMath.js';

/** Owns editor-only multitrack selection and viewport state. */
export class MultitrackSelectionDaas {
	constructor() {
		this.trackId = null;
		this.clipId = null;
		this.playheadSeconds = 0;
		this.pixelsPerSecond = 72;
		this.gridBeats = 0.25;
	}

	selectClip(trackId, clipId) {
		this.trackId = trackId;
		this.clipId = clipId;
	}

	selectTrack(trackId) {
		this.trackId = trackId;
		this.clipId = null;
	}

	clearSelection() {
		this.trackId = null;
		this.clipId = null;
	}

	setPlayhead(seconds) {
		this.playheadSeconds = Math.max(0, Number(seconds) || 0);
	}

	setZoom(value) {
		this.pixelsPerSecond = clamp(
			Number(value),
			MIN_MULTITRACK_ZOOM,
			MAX_MULTITRACK_ZOOM
		);
	}

	setGridBeats(value) {
		this.gridBeats = clamp(Number(value), 0, 4);
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(maximum, Number.isFinite(value) ? value : minimum)
	);
}

export const multitrackSelection = new MultitrackSelectionDaas();
