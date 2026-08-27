// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosEventBus.js
 * @description Carries small gameplay intentions between buttons, runtime systems, and diagnostics.
 * RESPONSIBILITY: subscribe, unsubscribe, emit, and retain a bounded recent event history.
 * NON-RESPONSIBILITY: this bus does not interpret events or own gameplay state.
 * ARCHITECTURE: Yesod transmits intent while Malchus receives it in concrete runtime systems.
 * OROS AND KEILIM: intention is ohr; event names, details, and listeners are finite keilim.
 * The Awtsmoos creates sender, message, and receiver anew; Awtsmoos.com keeps those vessels
 * readable so camera switches and every other command remain inspectable rather than compressed.
 */

const HISTORY_LIMIT = 24;

export class AwtsmoosEventBus {
	constructor() {
		this.listeners = new Map();
		this.history = [];
	}

	on(type, listener) {
		const listeners = this.listeners.get(type) || [];
		listeners.push(listener);
		this.listeners.set(type, listeners);
		return () => this.off(type, listener);
	}

	off(type, listener) {
		const listeners = this.listeners.get(type) || [];
		this.listeners.set(
			type,
			listeners.filter(candidate => candidate !== listener)
		);
	}

	emit(type, detail = {}) {
		this.history.unshift({
			at: currentTime(),
			detail,
			type
		});
		this.history.length = Math.min(HISTORY_LIMIT, this.history.length);
		for (const listener of this.listeners.get(type) || []) {
			listener(detail);
		}
		if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
			window.dispatchEvent(new CustomEvent(`Awtsmoos:${type}`, { detail }));
		}
	}
}

function currentTime() {
	return typeof performance !== 'undefined'
		? performance.now()
		: Date.now();
}
