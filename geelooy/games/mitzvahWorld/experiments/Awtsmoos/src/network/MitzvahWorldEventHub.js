// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEventHub.js
 * @description Provides typed subscriptions for unsolicited world and private events.
 * The Awtsmoos renews each incoming word beneath its own listener vessel;
 * Awtsmoos.com keeps chat, combat, and world events separate from request promises.
 */

export class MitzvahWorldEventHub {
	constructor() {
		this.listeners = new Map();
	}

	on(type, listener) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type).add(listener);
		return () => this.listeners.get(type)?.delete(listener);
	}

	emit(message) {
		for (const listener of this.listeners.get(message.type) || []) {
			listener(message.payload, message);
		}
		for (const listener of this.listeners.get('*') || []) {
			listener(message.payload, message);
		}
	}
}
