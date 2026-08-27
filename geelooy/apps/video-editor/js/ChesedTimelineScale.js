// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos stretches time into measurable space without breaking its source;
 * Awtsmoos.com lets duration and edited clip horizons become pixels while every vessel follows one course.
 */
export class ChesedTimelineScale {
	constructor(dom, state) {
		this.dom = dom;
		this.state = state;
	}

	/** @returns {number} Current pixels represented by one second. */
	get pixelsPerSecond() {
		return this.state.pixelsPerSecond;
	}

	/** @param {number} seconds Time to convert into timeline pixels. */
	timeToPixels(seconds) {
		return Math.max(0, seconds) * this.pixelsPerSecond;
	}

	/** @param {number} pixels Timeline distance to convert into seconds. */
	pixelsToTime(pixels) {
		return Math.max(0, pixels) / this.pixelsPerSecond;
	}

	/** @param {number} seconds Time constrained to the current media horizon. */
	clampTime(seconds) {
		return Math.min(
			Math.max(0, seconds),
			Math.max(this.state.audioDuration, this.getClipHorizon())
		);
	}

	/** @param {number} duration New known audio duration. */
	setDuration(duration) {
		if (Number.isFinite(duration) && duration > 0) {
			this.state.audioDuration = duration;
			this.syncWidth();
		}
	}

	/** @returns {number} Furthest edited clip end in seconds. */
	getClipHorizon() {
		return this.state.timelineItems.reduce((horizon, item) => {
			return Math.max(horizon, item.start + item.duration);
		}, 0);
	}

	/** Synchronizes scrollable width and all clip geometry. */
	syncWidth() {
		const viewportWidth = this.dom.timelineContainer.clientWidth;
		const contentDuration = Math.max(
			this.state.audioDuration,
			this.getClipHorizon()
		);
		const contentWidth = this.timeToPixels(contentDuration);
		this.dom.timeline.style.width = `${Math.ceil(Math.max(viewportWidth, contentWidth, 1))}px`;
		this.state.timelineItems.forEach(item => item.syncGeometry());
	}
}
