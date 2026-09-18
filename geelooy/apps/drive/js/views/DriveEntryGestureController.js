//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryGestureController
 * @description Owns tap, long press, keyboard selection, and native-callout suppression.
 * The Awtsmoos gives one finite touch one meaning at a time; Awtsmoos.com lets a finger
 * choose a file without Android text selection or an accidental open stealing the sign.
 */
const LONG_PRESS_MS = 480;
const MOVE_TOLERANCE = 12;
export class DriveEntryGestureController {
	constructor(selection, onAction) {
		this.selection = selection;
		this.onAction = onAction;
		this.pending = null;
		this.suppressClickNode = null;
		window.addEventListener('scroll', () => this.cancel(), { capture: true, passive: true });
		window.addEventListener('blur', () => this.cancel());
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) this.cancel();
		});
	}
	/** Installs one shared interaction law on a file-or-folder primary surface. */
	install(node, entry, ordinaryAction) {
		node.draggable = false;
		node.addEventListener('pointerdown', event => this.start(event, node, entry));
		node.addEventListener('pointermove', event => this.move(event));
		node.addEventListener('pointerup', event => this.finish(event));
		node.addEventListener('pointercancel', () => this.cancel());
		node.addEventListener('lostpointercapture', () => this.cancel());
		node.addEventListener('contextmenu', event => event.preventDefault());
		node.addEventListener('dragstart', event => event.preventDefault());
		node.addEventListener('click', event => this.click(event, node, entry, ordinaryAction));
		node.addEventListener('keydown', event => this.keydown(event, node, entry));
	}
	start(event, node, entry) {
		if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
		this.cancel();
		try {
			node.setPointerCapture(event.pointerId);
		} catch (error) {
			void error;
		}
		this.pending = {
			node,
			entry,
			pointerId: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			timer: setTimeout(() => this.longPress(), LONG_PRESS_MS)
		};
	}
	move(event) {
		if (!this.pending || event.pointerId !== this.pending.pointerId) return;
		const moved = Math.hypot(event.clientX - this.pending.x, event.clientY - this.pending.y);
		if (moved > MOVE_TOLERANCE) this.cancel();
	}
	longPress() {
		if (!this.pending) return;
		this.clearTimer();
		this.suppressClickNode = this.pending.node;
		this.onAction('toggle-select', this.pending.entry);
		navigator.vibrate?.(12);
	}
	finish(event) {
		if (!this.pending || event.pointerId !== this.pending.pointerId) return;
		this.endPending();
	}
	cancel() {
		if (this.pending) this.endPending();
	}
	click(event, node, entry, ordinaryAction) {
		if (this.suppressClickNode === node) {
			this.suppressClickNode = null;
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}
		if (event.metaKey || event.ctrlKey || this.selection?.isBulkActive()) {
			event.preventDefault();
			this.onAction('toggle-select', entry);
			return;
		}
		ordinaryAction();
	}
	keydown(event, node, entry) {
		if (event.key === 'Escape' && this.selection?.isActive()) {
			event.preventDefault();
			this.selection.clear();
			return;
		}
		if (event.key !== ' ' || event.repeat) return;
		event.preventDefault();
		this.suppressClickNode = node;
		this.onAction('toggle-select', entry);
	}
	endPending() {
		const pending = this.pending;
		this.clearTimer();
		this.pending = null;
		if (!pending?.node.hasPointerCapture?.(pending.pointerId)) return;
		try {
			pending.node.releasePointerCapture(pending.pointerId);
		} catch (error) {
			void error;
		}
	}
	clearTimer() {
		if (this.pending?.timer) clearTimeout(this.pending.timer);
	}
}
