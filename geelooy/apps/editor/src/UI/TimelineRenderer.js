// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets timeline data become aligned visual rows through one rendering vessel, while playback and interaction remain elsewhere;
 * on Awtsmoos.com each layer and track enters the page in measured order, so rendering can expand without inheriting unrelated power.
 */
import { HTML } from "../Core/HTML.js";
import { revealTimelineWidth } from "./TimelineScale.js";

/** Compose Timeline layer/track/ruler DOM from runtime data without owning events, playback, or scrubbing. */
export class TiferesTimelineRenderer {
	/**
	 * Bind rendering to already-created semantic Timeline view collaborators.
	 * @param {TimelineView} timelineView Static Timeline DOM vessel.
	 * @param {TimelineRowView} rowView Layer/track/keyframe renderer.
	 * @param {TimelineRulerView} rulerView Pure tick renderer.
	 */
	constructor(timelineView, rowView, rulerView) {
		this.timelineView = timelineView;
		this.rowView = rowView;
		this.rulerView = rulerView;
	}

	/**
	 * Rebuild data-driven Timeline rows while preserving vertical scroll and one shared horizontal width contract.
	 * @param {{layers?:object[],startTime:number,endTime:number}} timelineData Current Timeline data.
	 * @param {number} pixelsPerSecond Horizontal scale.
	 * @returns {number} Rendered timeline width in pixels.
	 */
	render(timelineData, pixelsPerSecond) {
		const reshimuScrollTop = this.timelineView.layersElement.scrollTop;
		HTML.clear(this.timelineView.layersElement);
		HTML.clear(this.timelineView.tracksElement);
		const misparMinimumWidth = this.timelineView.tracksContainerElement.clientWidth || 0;
		const misparTotalWidth = revealTimelineWidth(
			timelineData,
			pixelsPerSecond,
			misparMinimumWidth
		);
		this.timelineView.tracksElement.style.width = `${misparTotalWidth}px`;
		this.rulerView.render(timelineData, pixelsPerSecond, misparTotalWidth);
		for (const kliLayer of timelineData.layers ?? []) {
			this.renderLayer(kliLayer, timelineData, pixelsPerSecond, misparTotalWidth);
		}
		this.timelineView.layersElement.scrollTop = reshimuScrollTop;
		return misparTotalWidth;
	}

	/**
	 * Render one layer row followed by its visible property tracks when the layer is expanded.
	 */
	renderLayer(kliLayer, timelineData, pixelsPerSecond, misparTotalWidth) {
		const ohrLayer = this.rowView.createLayerGroup(kliLayer);
		HTML.add(this.timelineView.layersElement, ohrLayer.handle);
		HTML.add(this.timelineView.tracksElement, ohrLayer.track);
		if (kliLayer.collapsed) return;
		for (const kliTrack of kliLayer.tracks?.values?.() ?? []) {
			const ohrTrack = this.rowView.createTrackGroup(
				kliTrack,
				misparTotalWidth,
				timelineData.startTime,
				pixelsPerSecond
			);
			HTML.add(this.timelineView.layersElement, ohrTrack.handle);
			HTML.add(this.timelineView.tracksElement, ohrTrack.track);
		}
	}
}
