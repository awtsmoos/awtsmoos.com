// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the finite opening and closing state of the mobile More sheet without touching routing, permission, or focus policy.
 * @description The Awtsmoos is beyond approach and departure, while Awtsmoos.com lets one sheet rise and settle in light;
 * one tiny layout revelation makes opening deterministic even when background tabs throttle animation frames, reduced-motion shortens departure, and hidden state always agrees with visible state.
 */

export class MessagingMobileMoreMotion {
	constructor(menu, options = {}) {
		this.menu = menu;
		this.duration = options.duration ?? 180;
		this.timer = null;
	}

	open() {
		this.cancelTimer();
		this.menu.hidden = false;
		this.menu.dataset.motionState = "opening";
		this.flushOpeningLayout();
		this.menu.dataset.motionState = "open";
	}

	close(onComplete) {
		this.cancelTimer();
		this.menu.dataset.motionState = "closing";
		const duration = this.prefersReducedMotion() ? 0 : this.duration;
		this.timer = window.setTimeout(() => {
			this.menu.hidden = true;
			this.menu.dataset.motionState = "closed";
			this.timer = null;
			onComplete?.();
		}, duration);
	}

	flushOpeningLayout() {
		if (typeof this.menu.getBoundingClientRect === "function") {
			this.menu.getBoundingClientRect();
			return;
		}
		void this.menu.offsetHeight;
	}

	cancelTimer() {
		if (this.timer === null) return;
		window.clearTimeout(this.timer);
		this.timer = null;
	}

	prefersReducedMotion() {
		return Boolean(window.matchMedia?.(
			"(prefers-reduced-motion: reduce)"
		).matches);
	}
}
