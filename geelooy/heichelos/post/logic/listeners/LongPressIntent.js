// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LongPressIntent
 * @description The Awtsmoos separates a resting finger from a traveling one,
 * allowing native scroll to flow while one deliberate touch reveals actions.
 */
const DEFAULT_DELAY = 650;
const DEFAULT_MOVEMENT = 24;
const SYNTHETIC_CLICK_WINDOW = 850;

export class LongPressIntent {
	constructor(options = {}) {
		this.delay = options.delay ?? DEFAULT_DELAY;
		this.movement = options.movement ?? DEFAULT_MOVEMENT;
		this.onIntent = options.onIntent ?? (() => {});
		this.isBlocked = options.isBlocked ?? (() => false);
		this.active = null;
		this.timer = 0;
		this.suppressClickUntil = 0;
	}

	connect(root) {
		this.root = root;
		root.addEventListener('pointerdown', event => this.begin(event), { passive: true });
		root.addEventListener('pointermove', event => this.move(event), { passive: true });
		root.addEventListener('pointerup', event => this.finish(event), { passive: true });
		root.addEventListener('pointercancel', event => this.finish(event), { passive: true });
		root.addEventListener('lostpointercapture', () => this.cancel(), { passive: true });
		window.addEventListener('scroll', () => this.cancel(), { passive: true, capture: true });
		document.addEventListener('visibilitychange', () => this.cancel());
		return this;
	}

	begin(event) {
		if (this.active && event.pointerId !== this.active.id) {
			this.cancel();
			return false;
		}
		if (!this.canBegin(event)) {
			return false;
		}
		this.cancel();
		this.active = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			scrollX: window.scrollX,
			scrollY: window.scrollY,
			event
		};
		this.timer = window.setTimeout(() => this.fire(), this.delay);
		return true;
	}

	canBegin(event) {
		if (event.pointerType !== 'touch' || event.isPrimary === false || this.isBlocked()) {
			return false;
		}
		return !event.target.closest?.('a,button,input,textarea,select,[contenteditable="true"]');
	}

	move(event) {
		if (!this.active || event.pointerId !== this.active.id) {
			return false;
		}
		const distance = Math.hypot(
			event.clientX - this.active.x,
			event.clientY - this.active.y
		);
		const pageMoved = Math.abs(window.scrollY - this.active.scrollY) > 4
			|| Math.abs(window.scrollX - this.active.scrollX) > 4;
		if (distance < this.movement && !pageMoved) {
			return false;
		}
		this.cancel();
		return true;
	}

	finish(event) {
		if (!this.active || event.pointerId !== this.active.id) {
			return;
		}
		this.suppressClickUntil = performance.now() + SYNTHETIC_CLICK_WINDOW;
		this.cancel();
	}

	fire() {
		if (!this.active || this.isBlocked()) {
			this.cancel();
			return;
		}
		const intent = this.active;
		this.suppressClickUntil = performance.now() + SYNTHETIC_CLICK_WINDOW;
		window.clearTimeout(this.timer);
		this.timer = 0;
		this.active = null;
		this.onIntent(intent.x, intent.y, intent.event);
	}

	shouldIgnoreClick(event) {
		return performance.now() < this.suppressClickUntil
			|| Boolean(event.sourceCapabilities?.firesTouchEvents);
	}

	cancel() {
		window.clearTimeout(this.timer);
		this.timer = 0;
		this.active = null;
	}
}
