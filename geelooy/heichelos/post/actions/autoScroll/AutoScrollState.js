// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollState
 * @description The Awtsmoos holds one semantic river truth: preference may be
 * remembered, while countdown, pause, rest, estimate, and motion stay transient.
 */
import {
	describeSemanticPace,
	normalizeSemanticPreferences
} from './SemanticPacePolicy.js';

function statusName(state) {
	if (!state.active) {
		return 'off';
	}
	if (state.countdown > 0) {
		return 'countdown';
	}
	if (state.paused) {
		return 'paused';
	}
	return state.boundaryReason ? 'resting' : 'scrolling';
}

export class AutoScrollState {
	constructor(preferences) {
		this.value = {
			active: false,
			paused: false,
			pauseReason: '',
			boundaryReason: '',
			countdown: 0,
			resumeTimer: 0,
			preferences: normalizeSemanticPreferences(preferences),
			metrics: null,
			pixelsPerSecond: 0,
			estimateSeconds: null,
			estimateText: 'Calculating…'
		};
	}

	update(patch, shouldEmit = true) {
		this.value = { ...this.value, ...patch };
		if (patch.preferences) {
			this.value.preferences = normalizeSemanticPreferences(patch.preferences);
		}
		if (shouldEmit) {
			this.emit();
		}
		return this.snapshot();
	}

	snapshot() {
		const pace = describeSemanticPace(
			this.value.preferences,
			this.value.pixelsPerSecond
		);
		return {
			active: this.value.active,
			paused: this.value.paused,
			pauseReason: this.value.pauseReason,
			boundaryReason: this.value.boundaryReason,
			countdown: this.value.countdown,
			status: statusName(this.value),
			metrics: this.value.metrics,
			pixelsPerSecond: this.value.pixelsPerSecond,
			estimateSeconds: this.value.estimateSeconds,
			estimateText: this.value.estimateText,
			...pace
		};
	}

	clearResumeTimer() {
		if (this.value.resumeTimer) {
			clearTimeout(this.value.resumeTimer);
		}
		this.value.resumeTimer = 0;
	}

	emit() {
		const detail = this.snapshot();
		const classes = globalThis.document?.body?.classList;
		classes?.toggle('awtsmoos-auto-scroll-active', detail.active);
		classes?.toggle('awtsmoos-auto-scroll-paused', detail.active && detail.paused);
		classes?.toggle('awtsmoos-auto-scroll-resting', detail.status === 'resting');
		classes?.toggle('awtsmoos-auto-scroll-countdown', detail.status === 'countdown');
		if (typeof globalThis.CustomEvent !== 'function') {
			return detail;
		}
		for (const name of ['awtsmoos:auto-scroll-state', 'awtsmoos:auto-scroll-speed']) {
			globalThis.window?.dispatchEvent?.(new CustomEvent(name, { detail }));
		}
		return detail;
	}
}
