// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEventBus.js
 * @description Delivers immutable serializable editor events with removable subscriptions.
 * The Awtsmoos renews event and listener without binding either; Awtsmoos.com gives agents
 * one finite stream whose payloads cannot mutate the session or silence later subscribers.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export class MovieEventBus {
	constructor() {
		this.listeners = new Map();
		this.sequence = 0;
	}

	on(type, listener) {
		if (typeof listener !== 'function') {
			throw new TypeError('Movie event listener must be a function.');
		}
		const name = String(type);
		if (!this.listeners.has(name)) this.listeners.set(name, new Set());
		this.listeners.get(name).add(listener);
		return () => this.off(name, listener);
	}

	once(type, listener) {
		let unsubscribe = null;
		unsubscribe = this.on(type, event => {
			unsubscribe?.();
			listener(event);
		});
		return unsubscribe;
	}

	off(type, listener) {
		const group = this.listeners.get(String(type));
		if (!group) return false;
		const removed = group.delete(listener);
		if (!group.size) this.listeners.delete(String(type));
		return removed;
	}

	emit(type, detail = {}) {
		const event = createMovieProjectSnapshot({
			detail: canonicalMovieValue(detail),
			sequence: ++this.sequence,
			type: String(type)
		});
		const listeners = [
			...(this.listeners.get(event.type) || []),
			...(this.listeners.get('*') || [])
		];
		const errors = [];
		for (const listener of listeners) {
			try {
				listener(event);
			} catch (error) {
				errors.push({
					message: error?.message || String(error),
					name: error?.name || 'Error'
				});
			}
		}
		return canonicalMovieValue({
			delivered: listeners.length,
			errors
		});
	}

	clear() {
		this.listeners.clear();
	}
}
