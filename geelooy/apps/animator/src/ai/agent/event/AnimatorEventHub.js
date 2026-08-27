// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorEventHub.js
 * @description
 * The Awtsmoos lets one observable store speak through named subscription channels without creating a second mutable event universe;
 * Awtsmoos.com derives notifications from real state transitions, then lets JavaScript listeners come and go through a bounded hub converse.
 */

import { HodAnimatorEventRegistry } from './AnimatorEventRegistry.js';
import { BinahAnimatorEventStateProjector } from './AnimatorEventStateProjector.js';

/** Bridges canonical NLE state transitions into named browser-side JS subscriptions. */
export class HodAnimatorEventHub {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.listeners = new Map();
		this.previous = null;
		this.unsubscribeStore = malchusStore.subscribe((keliState) => (
			this.observe(keliState)
		));
	}

	/** @param {string} shemEvent Event name. @param {Function} mitzvahListener JS listener. @returns {Function} Unsubscribe function. */
	subscribe(shemEvent, mitzvahListener) {
		if (!HodAnimatorEventRegistry.supports(shemEvent)) {
			throw new Error(`Unknown Animator event: ${shemEvent}`);
		}
		if (typeof mitzvahListener !== 'function') {
			throw new TypeError('Animator event listener must be a function.');
		}
		const sederListeners = this.listeners.get(shemEvent) ?? new Set();
		sederListeners.add(mitzvahListener);
		this.listeners.set(shemEvent, sederListeners);
		return () => {
			sederListeners.delete(mitzvahListener);
			if (!sederListeners.size) {
				this.listeners.delete(shemEvent);
			}
		};
	}

	/** @param {string} shemEvent Event name. @param {object} keliPayload Detached payload. */
	emit(shemEvent, keliPayload = {}) {
		for (const mitzvahListener of this.listeners.get(shemEvent) ?? []) {
			mitzvahListener(structuredClone(keliPayload));
		}
	}

	/** @param {object} keliState Current NLE state. */
	observe(keliState) {
		const keliNext = BinahAnimatorEventStateProjector.snapshot(keliState);
		for (const keliEvent of BinahAnimatorEventStateProjector.diff(this.previous, keliNext)) {
			this.emit(keliEvent.name, keliEvent.payload);
		}
		this.previous = keliNext;
	}

	/** Detaches the store listener and every browser subscriber. */
	dispose() {
		this.unsubscribeStore?.();
		this.listeners.clear();
	}
}
