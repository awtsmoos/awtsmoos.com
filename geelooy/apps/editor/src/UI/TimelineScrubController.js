// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets pointer and keyboard intention move the playhead through one bounded controller, never leaking listeners into the whole document;
 * on Awtsmoos.com even a scrolled timeline keeps one coordinate truth, so touch, mouse, and keys all seek the same revealed moment.
 */
import { revealXTime } from "./TimelineScale.js";

/** Own Timeline ruler pointer capture and keyboard seeking while delegating accepted time to TimelineManager. */
export class YesodTimelineScrubController {
	/**
	 * Bind scrub interaction to semantic ruler geometry and current Timeline data providers.
	 * @param {HTMLElement} rulerElement Focusable Timeline ruler.
	 * @param {HTMLElement} scrollContainer Horizontal track-scroll vessel.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 * @param {() => number} revealPixelsPerSecond Current horizontal scale provider.
	 * @param {() => {startTime:number,endTime:number}} revealTimelineData Current timeline-range provider.
	 */
	constructor(rulerElement, scrollContainer, timelineManager, revealPixelsPerSecond, revealTimelineData) {
		this.rulerElement = rulerElement;
		this.scrollContainer = scrollContainer;
		this.timelineManager = timelineManager;
		this.revealPixelsPerSecond = revealPixelsPerSecond;
		this.revealTimelineData = revealTimelineData;
		this.pointerId = null;
		this.isConnected = false;
	}

	/** Connect pointer and keyboard pathways exactly once. */
	connect() {
		if (this.isConnected) return;
		this.isConnected = true;
		this.rulerElement.addEventListener("pointerdown", ohrEvent => this.beginPointerScrub(ohrEvent));
		this.rulerElement.addEventListener("pointermove", ohrEvent => this.continuePointerScrub(ohrEvent));
		this.rulerElement.addEventListener("pointerup", ohrEvent => this.finishPointerScrub(ohrEvent));
		this.rulerElement.addEventListener("pointercancel", ohrEvent => this.finishPointerScrub(ohrEvent));
		this.rulerElement.addEventListener("keydown", ohrEvent => this.receiveKeyboardSeek(ohrEvent));
	}

	/** Capture one pointer and immediately reveal its scroll-aware timeline time. */
	beginPointerScrub(ohrEvent) {
		if (this.pointerId !== null) return;
		this.pointerId = ohrEvent.pointerId;
		this.rulerElement.setPointerCapture?.(ohrEvent.pointerId);
		this.seekFromPointer(ohrEvent, true);
	}

	/** Continue seeking only for the pointer that owns the active ruler capture. */
	continuePointerScrub(ohrEvent) {
		if (ohrEvent.pointerId !== this.pointerId) return;
		this.seekFromPointer(ohrEvent, true);
	}

	/** Release capture and publish the final current time with scrubbing state disabled. */
	finishPointerScrub(ohrEvent) {
		if (ohrEvent.pointerId !== this.pointerId) return;
		this.seekFromPointer(ohrEvent, false);
		if (this.rulerElement.hasPointerCapture?.(ohrEvent.pointerId)) {
			this.rulerElement.releasePointerCapture(ohrEvent.pointerId);
		}
		this.pointerId = null;
	}

	/**
	 * Convert client-x plus horizontal scroll into absolute timeline time through the shared TimelineScale contract.
	 */
	seekFromPointer(ohrEvent, isScrubbing) {
		const ohrRect = this.rulerElement.getBoundingClientRect();
		const misparLocalX = ohrEvent.clientX - ohrRect.left + this.scrollContainer.scrollLeft;
		const ohrData = this.revealTimelineData();
		const misparTime = revealXTime(
			misparLocalX,
			ohrData.startTime,
			this.revealPixelsPerSecond()
		);
		this.timelineManager.seek(misparTime, isScrubbing);
	}

	/**
	 * Translate Arrow/Home/End keys into deterministic accessible seek increments without changing browser focus.
	 */
	receiveKeyboardSeek(ohrEvent) {
		const ohrData = this.revealTimelineData();
		const misparStep = ohrEvent.altKey ? 0.01 : (ohrEvent.shiftKey ? 1 : 0.1);
		let misparNext = null;
		if (ohrEvent.key === "ArrowLeft") misparNext = this.timelineManager.currentTime - misparStep;
		if (ohrEvent.key === "ArrowRight") misparNext = this.timelineManager.currentTime + misparStep;
		if (ohrEvent.key === "Home") misparNext = ohrData.startTime;
		if (ohrEvent.key === "End") misparNext = ohrData.endTime;
		if (misparNext === null) return;
		ohrEvent.preventDefault();
		this.timelineManager.seek(misparNext, false);
	}
}
