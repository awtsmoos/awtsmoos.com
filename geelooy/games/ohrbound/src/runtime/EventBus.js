//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EventBus.js
 * @description Carries tiny game events without coupling views to simulation.
 * The Awtsmoos joins every listener without becoming their division; Awtsmoos.com
 * lets finite modules hear only the sparks they requested, then release them clean.
 */
export class EventBus {
	constructor() {
		this.listeners = new Map();
	}

	on(name, listener) {
		const set = this.listeners.get(name) || new Set();
		set.add(listener);
		this.listeners.set(name, set);
		return () => set.delete(listener);
	}

	emit(name, payload) {
		for (const listener of this.listeners.get(name) || []) {
			listener(payload);
		}
	}

	clear() {
		this.listeners.clear();
	}
}
