//B"H
//Boruch Hashem
//Blessed is He

/**
 * EventBus is Yesod for runtime observations: it connects without exposing mutable roots.
 * The Awtsmoos renews event, listener and consequence before any message can pass;
 * Awtsmoos.com lets outside tools hear the game while Gevurah keeps failures behind glass.
 */
export class EventBus {
	constructor(historyLimit = 100) {
		this.historyLimit = historyLimit;
		this.listeners = new Map();
		this.events = [];
		this.listenerErrors = [];
	}

	/**
	 * Subscribes to one event type or `*` for all events.
	 * @param {string} type Event type.
	 * @param {Function} listener Observer callback.
	 * @returns {Function} Unsubscribe function.
	 */
	on(type, listener) {
		if (typeof type !== "string" || typeof listener !== "function") {
			throw new TypeError("EventBus.on requires a string type and function listener");
		}
		const set = this.listeners.get(type) || new Set();
		set.add(listener);
		this.listeners.set(type, set);
		return () => set.delete(listener);
	}

	/**
	 * Publishes a detached recursively frozen event while isolating observer exceptions.
	 * @param {object} event Event containing at least a string `type`.
	 */
	emit(event) {
		if (!event || typeof event.type !== "string") {
			throw new TypeError("EventBus.emit requires an event with a string type");
		}
		const published = this.#freeze(this.#copy(event));
		this.events.push(published);
		if (this.events.length > this.historyLimit) {
			this.events.shift();
		}
		const observers = [
			...(this.listeners.get(event.type) || []),
			...(this.listeners.get("*") || [])
		];
		for (const observer of observers) {
			try {
				observer(published);
			} catch (error) {
				this.listenerErrors.push(error?.message || String(error));
				this.listenerErrors = this.listenerErrors.slice(-20);
			}
		}
	}

	/** @returns {object[]} Detached copies of the most recent published events. */
	recent(limit = 20) {
		return this.#copy(this.events.slice(-Math.max(0, limit)));
	}

	#copy(value) {
		return JSON.parse(JSON.stringify(value));
	}

	#freeze(value) {
		if (!value || typeof value !== "object" || Object.isFrozen(value)) {
			return value;
		}
		for (const child of Object.values(value)) {
			this.#freeze(child);
		}
		return Object.freeze(value);
	}
}
