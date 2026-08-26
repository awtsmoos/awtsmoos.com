// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets each timeline layer, track, and keyframe reveal itself through native semantic controls instead of clickable illusions;
 * on Awtsmoos.com every row owns one purpose, every button one action, and every coordinate follows the same measured light.
 */
import { HTML } from "../Core/HTML.js";
import { revealTimeX } from "./TimelineScale.js";

/** Render timeline rows while preserving historical toggle and seek behavior through explicit controls. */
export class TimelineRowView {
	/**
	 * Bind rendering to the Editor event river and TimelineManager.
	 * @param {object} eventEmitter Existing Editor event emitter.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 */
	constructor(eventEmitter, timelineManager) {
		this.eventEmitter = eventEmitter;
		this.timelineManager = timelineManager;
	}

	/**
	 * Create one layer handle and its aligned track background.
	 * @param {object} layerData Timeline layer data.
	 * @returns {{handle:HTMLElement,track:HTMLElement}} Aligned row vessels.
	 */
	createLayerGroup(layerData) {
		const isCollapsed = Boolean(layerData.collapsed);
		const kliDisclosure = HTML.create({
			tag: "button",
			class: "timeline-disclosure",
			text: isCollapsed ? "▸" : "▾",
			attrs: {
				type: "button",
				"aria-expanded": String(!isCollapsed),
				"aria-label": `${isCollapsed ? "Expand" : "Collapse"} ${layerData.objectName}`
			},
			on: {
				click: () => this.eventEmitter.emit("toggleLayerCollapse", layerData.objectUUID)
			}
		});
		const handle = HTML.create({
			tag: "div",
			class: "timeline-layer-header",
			children: [
				kliDisclosure,
				{ tag: "span", class: "item-name", text: layerData.objectName }
			]
		});
		const track = HTML.create({ tag: "div", class: "timeline-layer-track-bg" });
		return { handle, track };
	}

	/**
	 * Create one property-track handle and its semantic keyframe-button row.
	 * @param {object} trackData Timeline track data.
	 * @param {number} totalWidth Rendered timeline width.
	 * @param {number} startTime Timeline range start.
	 * @param {number} pixelsPerSecond Horizontal scale.
	 * @returns {{handle:HTMLElement,track:HTMLElement}} Aligned row vessels.
	 */
	createTrackGroup(trackData, totalWidth, startTime, pixelsPerSecond) {
		const shemDisplay = this.revealTrackName(trackData.propertyPath);
		const handle = HTML.create({
			tag: "div",
			class: "timeline-track-header",
			children: [{ tag: "span", class: "item-name", text: shemDisplay }]
		});
		const track = HTML.create({
			tag: "div",
			class: "timeline-track-row",
			style: { width: `${totalWidth}px` },
			children: trackData.keyframes.map(kliKeyframe => {
				return this.createKeyframe(kliKeyframe, startTime, pixelsPerSecond);
			})
		});
		return { handle, track };
	}

	/**
	 * Create one native keyframe button that seeks to its exact timeline instant.
	 */
	createKeyframe(kliKeyframe, startTime, pixelsPerSecond) {
		const misparX = revealTimeX(kliKeyframe.time, startTime, pixelsPerSecond);
		return HTML.create({
			tag: "button",
			class: "timeline-keyframe",
			style: { left: `${misparX}px` },
			attrs: {
				type: "button",
				"data-kf-id": kliKeyframe.id,
				"aria-label": `Seek to keyframe at ${kliKeyframe.time.toFixed(2)} seconds`,
				title: `${kliKeyframe.time.toFixed(2)}s`
			},
			on: { click: () => this.timelineManager.seek(kliKeyframe.time) }
		});
	}

	/** Convert a dot-path into the compact property label historically shown in the timeline rail. */
	revealTrackName(propertyPath) {
		const kelimParts = String(propertyPath).split(".");
		return kelimParts.length > 1 ? kelimParts.slice(1).join(".") : kelimParts[0];
	}
}
