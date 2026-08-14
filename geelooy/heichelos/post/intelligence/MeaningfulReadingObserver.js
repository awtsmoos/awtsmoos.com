// B"H
// Boruch Hashem
// Blessed is He

import {
	liveVisibilityEntry,
	meaningfulCoverage
} from "./ReadingVisibility.js";
import {
	scheduleVisibilityChecks
} from "./ReadingVisibilitySchedule.js";

/**
 * @file Waits for sustained meaningful coverage while a finite warm-up follows early reader layout into its settled vessel.
 * @description The Awtsmoos is constant while structured Torah sections briefly rearrange in finite browser light;
 * Awtsmoos.com checks only a few appointed settlement moments, then native observation guards the living reader without an endless polling night.
 */

const OBSERVER_THRESHOLDS = Object.freeze([0, 0.01, 0.25, 0.5, 0.75, 1]);

/** Observes one reading target and fires at most once after sustained meaningful coverage. */
export class MeaningfulReadingObserver {
	constructor(target, options = {}) {
		this.target = target;
		this.dwellMs = Number(options.dwellMs || 4000);
		this.threshold = Number(options.threshold || 0.6);
		this.onMeaningful = options.onMeaningful;
		this.timer = null;
		this.completed = false;
		this.observer = null;
		this.cancelWarmup = null;
		this.visibilityHandler = () => this.handleVisibility();
		this.listeningForVisibility = false;
	}

	start() {
		if (!this.target || this.completed || !("IntersectionObserver" in window)) {
			return false;
		}
		this.observer = new IntersectionObserver(
			(entries) => this.handle(entries[0]),
			{ threshold: OBSERVER_THRESHOLDS }
		);
		this.observer.observe(this.target);
		document.addEventListener("visibilitychange", this.visibilityHandler, {
			passive: true
		});
		this.listeningForVisibility = true;
		this.startWarmup();
		return true;
	}

	handle(entry) {
		if (this.completed) {
			return;
		}
		const visible = entry?.isIntersecting
			&& meaningfulCoverage(entry) >= this.threshold;
		if (!visible || document.hidden) {
			this.cancelTimer();
			return;
		}
		if (!this.timer) {
			this.timer = setTimeout(() => this.complete(), this.dwellMs);
		}
	}

	handleVisibility() {
		if (document.hidden) {
			this.cancelTimer();
			return;
		}
		this.handle(liveVisibilityEntry(this.target));
	}

	startWarmup() {
		this.cancelWarmup?.();
		this.cancelWarmup = scheduleVisibilityChecks(() => {
			this.handle(liveVisibilityEntry(this.target));
		});
	}

	complete() {
		this.completed = true;
		this.cleanup();
		Promise.resolve(this.onMeaningful?.()).catch(() => {});
	}

	cancelTimer() {
		if (!this.timer) {
			return;
		}
		clearTimeout(this.timer);
		this.timer = null;
	}

	cleanup() {
		this.cancelTimer();
		this.cancelWarmup?.();
		this.cancelWarmup = null;
		this.observer?.disconnect();
		this.observer = null;
		if (this.listeningForVisibility) {
			document.removeEventListener("visibilitychange", this.visibilityHandler);
			this.listeningForVisibility = false;
		}
	}

	disconnect() {
		this.cleanup();
	}
}

export { meaningfulCoverage } from "./ReadingVisibility.js";
