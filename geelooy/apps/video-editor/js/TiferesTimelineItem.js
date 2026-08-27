// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins boundary and beauty in each editable clip;
 * Awtsmoos.com lets a timeline spark move, stretch, split, and remain a living vessel.
 */
import { TzimtzumPointerSession } from "./TzimtzumPointerSession.js";
import { TiferesClipElement } from "./TiferesClipElement.js";

export class TiferesTimelineItem {
	constructor({ dom, state, scale, url, type, start = 0, duration = 5 }) {
		this.dom = dom;
		this.state = state;
		this.scale = scale;
		this.url = url;
		this.type = type;
		this.start = start;
		this.duration = duration;
		this.element = TiferesClipElement.create(url, type);
		this.bindInteractions();
		this.dom.timeline.append(this.element);
		this.state.addItem(this);
		this.syncGeometry();
	}

	bindInteractions() {
		this.element.addEventListener("click", () => this.state.select(this));
		this.element.addEventListener("keydown", event => this.handleKeyboard(event));
		TzimtzumPointerSession.bind(this.element, {
			onStart: event => {
				if (event.target.closest(".resize-handle")) {
					return { ignored: true };
				}
				event.preventDefault();
				this.state.select(this);
				return { start: this.start };
			},
			onMove: ({ deltaX, context }) => {
				if (context.ignored) {
					return;
				}
				this.start = this.scale.clampTime(
					context.start + this.scale.pixelsToTime(deltaX)
				);
				this.syncGeometry();
				this.scale.syncWidth();
			}
		});
		this.bindResize(this.element.querySelector(".resize-left"), "left");
		this.bindResize(this.element.querySelector(".resize-right"), "right");
	}

	bindResize(handle, edge) {
		TzimtzumPointerSession.bind(handle, {
			onStart: event => {
				event.preventDefault();
				event.stopPropagation();
				this.state.select(this);
				return { start: this.start, duration: this.duration };
			},
			onMove: ({ deltaX, context }) => {
				const delta = this.scale.pixelsToTime(deltaX);
				if (edge === "left") {
					this.resizeLeft(context, delta);
				} else {
					this.resizeRight(context, delta);
				}
				this.syncGeometry();
				this.scale.syncWidth();
			}
		});
	}

	resizeLeft(context, delta) {
		const end = context.start + context.duration;
		this.start = Math.max(0, Math.min(end - 0.25, context.start + delta));
		this.duration = end - this.start;
	}

	resizeRight(context, delta) {
		this.duration = Math.max(0.25, context.duration + delta);
	}

	handleKeyboard(event) {
		if (!["ArrowLeft", "ArrowRight"].includes(event.key)) {
			return;
		}
		event.preventDefault();
		const direction = event.key === "ArrowLeft" ? -1 : 1;
		this.start = this.scale.clampTime(this.start + direction);
		this.state.select(this);
		this.syncGeometry();
		this.scale.syncWidth();
	}

	syncGeometry() {
		this.element.style.left = `${this.scale.timeToPixels(this.start)}px`;
		this.element.style.width = `${Math.max(24, this.scale.timeToPixels(this.duration))}px`;
	}

	splitAt(time) {
		const end = this.start + this.duration;
		if (time <= this.start || time >= end) {
			return null;
		}
		const next = {
			url: this.url,
			type: this.type,
			start: time,
			duration: end - time
		};
		this.duration = time - this.start;
		this.syncGeometry();
		return next;
	}
}
