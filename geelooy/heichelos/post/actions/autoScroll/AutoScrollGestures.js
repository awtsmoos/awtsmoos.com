// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollGestures
 * @description The Awtsmoos yields the moving river whenever a human hand,
 * wheel, or reading key takes temporary command of the page.
 */
const MOVE_THRESHOLD = 40;
const WHEEL_THRESHOLD = 55;

function point(event) {
	const touch = event?.touches?.[0] || event?.changedTouches?.[0];
	return {
		x: Number(touch?.clientX ?? event?.clientX ?? 0),
		y: Number(touch?.clientY ?? event?.clientY ?? 0)
	};
}

function ignored(event) {
	return Boolean(event?.target?.closest?.(
		'#awtsmoosAutoScrollBtn, #autoScrollSettingsToggle, .typography-details, .sidebar, input, textarea, select, button, a'
	));
}

export class AutoScrollGestures {
	constructor(options) {
		this.getState = options.getState;
		this.pause = options.pause;
		this.scheduleResume = options.scheduleResume;
		this.gesture = null;
		this.connected = false;
	}

	connect() {
		if (this.connected || typeof document === 'undefined') {
			return;
		}
		this.connected = true;
		const passive = { passive: true, capture: true };
		for (const type of ['pointerdown', 'touchstart']) {
			document.addEventListener(type, event => this.begin(event), passive);
		}
		for (const type of ['pointermove', 'touchmove']) {
			document.addEventListener(type, event => this.move(event), passive);
		}
		for (const type of ['pointerup', 'pointercancel', 'touchend', 'touchcancel']) {
			document.addEventListener(type, () => this.end(), passive);
		}
		document.addEventListener('wheel', event => this.wheel(event), passive);
		document.addEventListener('keydown', event => this.key(event), true);
	}

	begin(event) {
		if (!this.getState().active || ignored(event)) {
			return;
		}
		const current = point(event);
		this.gesture = {
			x: current.x,
			y: current.y,
			scrollTop: Number(window.scrollY || document.scrollingElement?.scrollTop || 0),
			paused: false
		};
	}

	move(event) {
		if (!this.getState().active || !this.gesture || ignored(event)) {
			return;
		}
		const current = point(event);
		const moved = Math.abs(current.y - this.gesture.y) >= MOVE_THRESHOLD;
		const scrolled = Math.abs(
			Number(window.scrollY || document.scrollingElement?.scrollTop || 0) - this.gesture.scrollTop
		) >= MOVE_THRESHOLD;
		if (!moved && !scrolled) {
			return;
		}
		this.gesture.paused = true;
		this.pause();
	}

	end() {
		const shouldResume = Boolean(this.gesture?.paused || this.getState().paused);
		this.gesture = null;
		if (shouldResume) {
			this.scheduleResume();
		}
	}

	wheel(event) {
		if (!this.getState().active || ignored(event)) {
			return;
		}
		if (Math.abs(Number(event?.deltaY || 0)) < WHEEL_THRESHOLD) {
			return;
		}
		this.pause();
		this.scheduleResume();
	}

	key(event) {
		const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
		if (!this.getState().active || ignored(event) || !keys.includes(event.key)) {
			return;
		}
		this.pause();
		this.scheduleResume();
	}
}
