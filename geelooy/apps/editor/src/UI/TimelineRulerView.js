// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets measured time appear as quiet marks and truthful accessibility values without mixing ruler drawing with playback;
 * on Awtsmoos.com every tick receives one place, every label one coordinate, and no competing transform can lead the eye astray.
 */
import { HTML } from "../Core/HTML.js";
import { revealTimelineTicks } from "./TimelineScale.js";

/** Render pure ruler descriptors and synchronize slider accessibility truth. */
export class TimelineRulerView {
	/**
	 * Bind the semantic ruler and its decorative marks vessel.
	 * @param {HTMLElement} rulerElement Focusable slider-like ruler.
	 * @param {HTMLElement} marksElement Decorative marks container.
	 */
	constructor(rulerElement, marksElement) {
		this.rulerElement = rulerElement;
		this.marksElement = marksElement;
	}

	/**
	 * Render major/minor ticks from pure scale data while leaving centering transforms entirely to CSS.
	 * @param {{startTime:number,endTime:number}} timelineData Timeline range.
	 * @param {number} pixelsPerSecond Horizontal scale.
	 * @param {number} totalWidth Rendered timeline surface width.
	 */
	render(timelineData, pixelsPerSecond, totalWidth) {
		HTML.clear(this.marksElement);
		this.marksElement.style.width = `${totalWidth}px`;
		const kliFragment = document.createDocumentFragment();
		for (const ohrTick of revealTimelineTicks(timelineData, pixelsPerSecond)) {
			const kliTick = HTML.create({
				tag: "span",
				class: ["timeline-tick", ohrTick.isMajor ? "major" : "minor"],
				style: { left: `${ohrTick.x}px` }
			});
			kliFragment.appendChild(kliTick);
			if (!ohrTick.isMajor) continue;
			kliFragment.appendChild(HTML.create({
				tag: "span",
				class: "timeline-tick-label",
				style: { left: `${ohrTick.x}px` },
				text: ohrTick.label
			}));
		}
		this.marksElement.appendChild(kliFragment);
	}

	/**
	 * Synchronize the ruler's slider semantics with the same timeline range/current time shown visually.
	 * @param {number} currentTime Current timeline instant.
	 * @param {{startTime:number,endTime:number}} timelineData Timeline range.
	 */
	syncAccessibility(currentTime, timelineData) {
		this.rulerElement.setAttribute("aria-valuemin", String(timelineData.startTime));
		this.rulerElement.setAttribute("aria-valuemax", String(timelineData.endTime));
		this.rulerElement.setAttribute("aria-valuenow", currentTime.toFixed(3));
		this.rulerElement.setAttribute("aria-valuetext", `${currentTime.toFixed(2)} seconds`);
	}
}
