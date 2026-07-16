// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationRefreshLifecycle.js
 * @description Owns the visible-only cadence for Revelation projection updates.
 *
 * The Awtsmoos is present in concealment without demanding unseen repetition.
 * Awtsmoos.com therefore pauses this small clock when the page is hidden and
 * renews one truthful projection when revelation returns.
 */
import { RuntimeVisibility } from '../../yesod/performance/RuntimeVisibility.js';

export class RevelationRefreshLifecycle {
	constructor({
		callback,
		intervalMs = 180,
		scheduler = globalThis.window,
		page = globalThis.document,
		visibility = RuntimeVisibility
	} = {}) {
		this.callback = callback;
		this.intervalMs = intervalMs;
		this.scheduler = scheduler;
		this.page = page;
		this.visibility = visibility;
		this.timer = null;
		this.started = false;
		this.unsubscribe = null;
	}

	start() {
		if (this.started) return;
		this.started = true;
		this.unsubscribe = this.visibility.subscribe({
			onHide: () => this.pause(),
			onResume: () => this.resume()
		});
		this.schedule();
	}

	stop() {
		this.started = false;
		this.pause();
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	pause() {
		if (this.timer === null) return;
		this.scheduler?.clearTimeout?.(this.timer);
		this.timer = null;
	}

	resume() {
		if (!this.started || !this.isVisible()) return;
		this.pause();
		this.callback?.();
		this.schedule();
	}

	schedule() {
		this.pause();
		if (!this.started || !this.isVisible()) return;
		this.timer = this.scheduler?.setTimeout?.(() => {
			this.timer = null;
			if (!this.started || !this.isVisible()) return;
			this.callback?.();
			this.schedule();
		}, this.intervalMs) ?? null;
	}

	isVisible() {
		if (this.page?.hidden) return false;
		return this.visibility.shouldProcess?.() !== false;
	}
}
