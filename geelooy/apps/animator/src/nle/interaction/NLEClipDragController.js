// B"H
// Boruch Hashem
// Blessed is He

import { NLECommands } from '../core/NLECommands.js';

/**
 * The hand grasps a clip without mutating project time on every pixel. The
 * Awtsmoos renews the gesture; one snapped command enters history at release.
 */
export class NLEClipDragController {
	constructor(store) {
		this.store = store;
		this.active = null;
		this.moveListener = (event) => this.move(event);
		this.endListener = (event) => this.end(event);
	}

	/** Begins one pointer drag from a declarative timeline event. */
	start(event) {
		const element = event.currentTarget?.closest?.('.aw-nle-clip');
		const clipId = element?.dataset?.clipId;
		const clip = this.store.findClip(clipId);
		if (!element || !clip || event.button > 0) {
			return;
		}
		event.preventDefault();
		NLECommands.selectClip(this.store, clipId);
		this.active = {
			element,
			clipId,
			startX: event.clientX,
			originalStart: clip.start,
			nextStart: clip.start,
			pixelsPerMs: this.pixelsPerMs(),
			pointerId: event.pointerId
		};
		element.setPointerCapture?.(event.pointerId);
		document.addEventListener('pointermove', this.moveListener);
		document.addEventListener('pointerup', this.endListener, { once: true });
		document.addEventListener('pointercancel', this.endListener, { once: true });
	}

	/** Previews movement in the DOM while project state remains untouched. */
	move(event) {
		if (!this.active) {
			return;
		}
		const deltaPixels = event.clientX - this.active.startX;
		const deltaTime = deltaPixels / Math.max(0.0001, this.active.pixelsPerMs);
		this.active.nextStart = this.snap(this.active.originalStart + deltaTime);
		const visualDelta = (this.active.nextStart - this.active.originalStart)
			* this.active.pixelsPerMs;
		this.active.element.style.transform = `translateX(${visualDelta}px)`;
	}

	/** Commits exactly one history entry after the pointer is released. */
	end() {
		if (!this.active) {
			return;
		}
		const active = this.active;
		active.element.style.transform = '';
		active.element.releasePointerCapture?.(active.pointerId);
		document.removeEventListener('pointermove', this.moveListener);
		document.removeEventListener('pointerup', this.endListener);
		document.removeEventListener('pointercancel', this.endListener);
		this.active = null;
		if (active.nextStart !== active.originalStart) {
			NLECommands.moveClip(this.store, active.clipId, active.nextStart);
		}
	}

	/** Cancels any active drag during editor unmount. */
	cancel() {
		if (this.active) {
			this.active.nextStart = this.active.originalStart;
		}
		this.end();
	}

	pixelsPerMs() {
		return 0.06 * (this.store.get().zoom || 0.12);
	}

	snap(timeMs) {
		const interval = Math.max(1, Number(this.store.get().snap) || 1);
		return Math.max(0, Math.round(timeMs / interval) * interval);
	}
}
