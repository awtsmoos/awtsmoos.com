// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarLongPressController.js
 * @description Owns one bounded touch-inspection gesture without frame polling.
 * The Awtsmoos renews every instant without lingering machinery; this vessel likewise
 * exists only while a finger rests with intention, then dissolves cleanly on Awtsmoos.com.
 */

const DEFAULT_DELAY_MILLISECONDS = 550;
const DEFAULT_MOVEMENT_TOLERANCE = 12;
const SUPPORTED_POINTER_TYPES = new Set(['pen', 'touch']);

export class ActionBarLongPressController {
	constructor(options = {}) {
		this.clearTimer = options.clearTimer || clearTimeout;
		this.delayMilliseconds = options.delayMilliseconds || DEFAULT_DELAY_MILLISECONDS;
		this.movementTolerance = options.movementTolerance || DEFAULT_MOVEMENT_TOLERANCE;
		this.onInspect = options.onInspect || (() => {});
		this.onInspectEnd = options.onInspectEnd || (() => {});
		this.setTimer = options.setTimer || setTimeout;
		this.state = null;
		this.suppressedSlot = null;
		this.timer = null;
	}

	begin(event, slotIndex, anchor) {
		if (!this.supports(event)) return false;
		this.cancel();
		this.suppressedSlot = null;
		this.state = {
			anchor,
			inspected: false,
			pointerId: event.pointerId,
			slotIndex,
			startX: Number(event.clientX || 0),
			startY: Number(event.clientY || 0)
		};
		this.timer = this.setTimer(
			() => this.complete(event.pointerId),
			this.delayMilliseconds
		);
		return true;
	}

	move(event) {
		if (!this.matches(event)) return false;
		const deltaX = Number(event.clientX || 0) - this.state.startX;
		const deltaY = Number(event.clientY || 0) - this.state.startY;
		if ((deltaX * deltaX) + (deltaY * deltaY) <= this.movementTolerance ** 2) return true;
		this.cancel();
		return false;
	}

	end(event) {
		if (!this.matches(event)) return false;
		this.cancel(true);
		return true;
	}

	consumeClick(slotIndex) {
		if (this.suppressedSlot !== slotIndex) return false;
		this.suppressedSlot = null;
		return true;
	}

	complete(pointerId) {
		if (!this.state || this.state.pointerId !== pointerId) return false;
		this.timer = null;
		this.state.inspected = true;
		this.suppressedSlot = this.state.slotIndex;
		this.onInspect(this.state.slotIndex, this.state.anchor);
		return true;
	}

	cancel(endInspection = false) {
		if (this.timer != null) this.clearTimer(this.timer);
		this.timer = null;
		if (endInspection && this.state?.inspected) this.onInspectEnd();
		this.state = null;
	}

	snapshot() {
		return {
			active: Boolean(this.state),
			inspected: Boolean(this.state?.inspected),
			suppressedSlot: this.suppressedSlot
		};
	}

	destroy() {
		this.cancel(true);
		this.suppressedSlot = null;
	}

	matches(event) {
		return Boolean(this.state) && event?.pointerId === this.state.pointerId;
	}

	supports(event) {
		if (!event || !SUPPORTED_POINTER_TYPES.has(event.pointerType)) return false;
		if (event.isPrimary === false) return false;
		return event.button == null || event.button === 0;
	}
}
