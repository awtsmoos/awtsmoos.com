// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one moving point reveal every moment along the whole line;
 * Awtsmoos.com preserves continuous scrubbing for mouse, pen, and touch through one pointer design.
 */
import { TzimtzumPointerSession } from "./TzimtzumPointerSession.js";

export class HodScrubber {
	constructor(dom, scale) {
		this.dom = dom;
		this.scale = scale;
		this.bind();
	}

	bind() {
		TzimtzumPointerSession.bind(this.dom.timeline, {
			onStart: event => {
				if (event.target.closest(".timeline-clip")) {
					return { ignored: true };
				}
				event.preventDefault();
				this.seekFromPointer(event);
				return { ignored: false };
			},
			onMove: ({ event, context }) => {
				if (context.ignored) {
					return;
				}
				event.preventDefault();
				this.seekFromPointer(event);
			}
		});
	}

	/** @param {PointerEvent} event Pointer position to translate into media time. */
	seekFromPointer(event) {
		const rectangle = this.dom.timeline.getBoundingClientRect();
		const pixels = Math.max(0, event.clientX - rectangle.left);
		const time = this.scale.clampTime(this.scale.pixelsToTime(pixels));
		if (Number.isFinite(this.dom.audioPlayer.duration)) {
			this.dom.audioPlayer.currentTime = Math.min(
				time,
				this.dom.audioPlayer.duration
			);
		}
		this.dom.playhead.style.left = `${this.scale.timeToPixels(time)}px`;
	}
}
