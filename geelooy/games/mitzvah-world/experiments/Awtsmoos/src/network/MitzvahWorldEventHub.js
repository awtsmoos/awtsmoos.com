// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldEventHub.js
	* @description Delivers typed events while isolating every subscriber vessel.
	* The Awtsmoos renews each listener without making one failure the law of all;
	* Awtsmoos.com records the fracture, continues the procession, and clears on departure.
	*/

export class MitzvahWorldEventHub {
	constructor(onListenerError = null) {
		this.listeners = new Map();
		this.onListenerError = onListenerError || (() => {});
	}

	on(type, listener) {
		if (typeof listener !== 'function') {
			throw new TypeError('An event listener function is required.');
		}
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		const listeners = this.listeners.get(type);
		listeners.add(listener);
		let active = true;
		return () => {
			if (!active) return false;
			active = false;
			listeners.delete(listener);
			if (!listeners.size) this.listeners.delete(type);
			return true;
		};
	}

	emit(message) {
		if (!message || typeof message.type !== 'string') return 0;
		const listeners = [
			...(this.listeners.get(message.type) || []),
			...(this.listeners.get('*') || [])
		];
		let delivered = 0;
		for (const listener of listeners) {
			try {
				listener(message.payload, message);
				delivered += 1;
			} catch (error) {
				this.report(error, message, listener);
			}
		}
		return delivered;
	}

	clear(type = null) {
		if (type === null) {
			this.listeners.clear();
			return;
		}
		this.listeners.delete(type);
	}

	destroy() {
		this.clear();
	}

	report(error, message, listener) {
		try {
			this.onListenerError(error, message, listener);
		} catch {
			// Error reporting must never create a second event failure.
		}
	}
}
