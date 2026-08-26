// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets playback truth become visible without asking the Timeline panel façade to own presentation details;
 * on Awtsmoos.com the cursor, time label, play control, and slider accessibility move together in one measured rhyme.
 */
import { revealTimeX } from "./TimelineScale.js";

/** Present current-time and playback state through the already-built semantic Timeline view. */
export class MalchusTimelinePanelPresenter {
	/**
	 * Bind presentation to Timeline DOM, ruler accessibility, and the stable manager façade.
	 * @param {TimelineView} timelineView Static Timeline DOM vessel.
	 * @param {TimelineRulerView} rulerView Ruler accessibility presenter.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 * @param {() => object} revealTimelineData Current Timeline data provider.
	 * @param {() => number} revealPixelsPerSecond Current horizontal scale provider.
	 */
	constructor(timelineView, rulerView, timelineManager, revealTimelineData, revealPixelsPerSecond) {
		this.timelineView = timelineView;
		this.rulerView = rulerView;
		this.timelineManager = timelineManager;
		this.revealTimelineData = revealTimelineData;
		this.revealPixelsPerSecond = revealPixelsPerSecond;
	}

	/**
	 * Move the cursor, update the live time label, and synchronize slider ARIA truth from one canonical instant.
	 * @param {number} [currentTime=this.timelineManager.currentTime] Timeline instant in seconds.
	 */
	revealCurrentTime(currentTime = this.timelineManager.currentTime) {
		const ohrData = this.revealTimelineData();
		const misparX = revealTimeX(
			currentTime,
			ohrData.startTime,
			this.revealPixelsPerSecond()
		);
		this.timelineView.cursorElement.style.left = `${misparX}px`;
		this.timelineView.timeDisplayElement.textContent = `${currentTime.toFixed(2)}s`;
		this.rulerView.syncAccessibility(currentTime, ohrData);
	}

	/**
	 * Synchronize play-button text, accessible label, and pressed truth from the canonical playback state.
	 * @param {boolean} [isPlaying=this.timelineManager.isPlaying] Current playback truth.
	 */
	revealPlayback(isPlaying = this.timelineManager.isPlaying) {
		this.timelineView.playButton.textContent = isPlaying ? "❚❚ Pause" : "▶ Play";
		this.timelineView.playButton.setAttribute("aria-label", isPlaying ? "Pause timeline" : "Play timeline");
		this.timelineView.playButton.setAttribute("aria-pressed", String(isPlaying));
	}
}
