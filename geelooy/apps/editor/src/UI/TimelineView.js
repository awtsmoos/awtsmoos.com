// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives the Timeline one stable semantic skeleton before data, motion, or history enter the scene;
 * on Awtsmoos.com each visible vessel has one name and one role, so future tools may grow without rebuilding the whole machine.
 */
import { HTML } from "../Core/HTML.js";

/** Build and expose the Timeline panel's static semantic DOM without owning runtime behavior. */
export class TimelineView {
	/**
	 * Build the timeline controls and scrolling content inside the supplied BasePanel content vessel.
	 * @param {HTMLElement} kliRoot BasePanel content element.
	 */
	constructor(kliRoot) {
		this.kliRoot = kliRoot;
		this.buildControls();
		this.buildContent();
		this.mount();
	}

	/** Create the play control and polite current-time display. */
	buildControls() {
		this.playButton = HTML.create({
			tag: "button",
			id: "btn-play",
			text: "▶ Play",
			attrs: {
				type: "button",
				"aria-label": "Play timeline",
				"aria-pressed": "false"
			}
		});
		this.timeDisplayElement = HTML.create({
			tag: "span",
			class: "time-display",
			text: "0.00s",
			attrs: { "aria-live": "polite", "aria-atomic": "true" }
		});
		this.controlsElement = HTML.create({
			tag: "div",
			class: "timeline-controls",
			children: [this.playButton, this.timeDisplayElement]
		});
	}

	/** Create the layer rail, semantic ruler, tracks surface, and noninteractive timeline cursor. */
	buildContent() {
		this.layersElement = HTML.create({
			tag: "div",
			class: "timeline-layers",
			attrs: { "aria-label": "Timeline layers" }
		});
		this.rulerMarksElement = HTML.create({
			tag: "div",
			class: "timeline-ruler-marks",
			attrs: { "aria-hidden": "true" }
		});
		this.rulerElement = HTML.create({
			tag: "div",
			class: "timeline-ruler",
			attrs: {
				role: "slider",
				tabindex: "0",
				"aria-label": "Timeline playhead",
				"aria-orientation": "horizontal"
			},
			children: [this.rulerMarksElement]
		});
		this.tracksElement = HTML.create({ tag: "div", class: "timeline-tracks" });
		this.cursorElement = HTML.create({
			tag: "div",
			class: "timeline-cursor",
			attrs: { "aria-hidden": "true" }
		});
		this.tracksContainerElement = HTML.create({
			tag: "div",
			class: "timeline-tracks-container",
			children: [this.rulerElement, this.tracksElement, this.cursorElement]
		});
		this.contentArea = HTML.create({
			tag: "div",
			class: "timeline-content",
			children: [this.layersElement, this.tracksContainerElement]
		});
	}

	/** Replace panel content with the complete static Timeline vessel. */
	mount() {
		HTML.clear(this.kliRoot);
		HTML.add(this.kliRoot, [this.controlsElement, this.contentArea]);
	}
}
