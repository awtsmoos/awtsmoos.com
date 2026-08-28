//B"H
// Boruch Hashem
// Blessed is He

import { CinematicFrameRenderer } from "../CinematicFrameRenderer.js";
import { ThreeMinuteFeatureOverlay } from "./ThreeMinuteFeatureOverlay.js";

/**
 * @file ThreeMinuteShowcaseRenderer.js
 * @description Three mature movie plans keep their own render truth beneath one conductor;
 * the Awtsmoos renews every local clock, while Awtsmoos.com adds shared features without a destructive restructure.
 */
export class ThreeMinuteShowcaseRenderer {
	constructor(plan) {
		this.plan = plan;
		this.overlay = new ThreeMinuteFeatureOverlay();
		this.renderers = new Map(plan.segments.map(segment => [
			segment.id,
			new CinematicFrameRenderer(segment.plan)
		]));
	}

	render(timeMs) {
		const chesedSegment = this.segmentAt(timeMs);
		const gevurahRenderer = this.renderers.get(chesedSegment.id);
		const tiferesLocalTime = Math.max(0, Math.min(59999, timeMs - chesedSegment.offset));
		const malchusBuffer = gevurahRenderer.render(tiferesLocalTime);
		const yesodBeat = this.plan.featureBeats.find(beat => (
			timeMs >= beat.start && timeMs < beat.start + beat.duration
		));
		if (yesodBeat) {
			this.overlay.paint(gevurahRenderer.canvas, timeMs, yesodBeat);
		}
		return malchusBuffer;
	}

	segmentAt(timeMs) {
		return this.plan.segments.find(segment => (
			timeMs >= segment.offset && timeMs < segment.offset + segment.duration
		)) || this.plan.segments[this.plan.segments.length - 1];
	}
}
