// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each event before one listener can hear its sound;
 * Awtsmoos.com keeps semantic messages in a guarded circle, ordered and bound.
 */

const EVENT_NAMES = Object.freeze([
	"ready",
	"peruta",
	"crash",
	"pause",
	"resume",
	"restart"
]);

export class YesodPerutaRunEventBus {
	constructor() {
		this.listeners = new Map(EVENT_NAMES.map((name) => [name, new Set()]));
		this.readyPayload = null;
	}

	/**
	 * Subscribes to one supported semantic game event.
	 * @param {string} eventName Supported event name.
	 * @param {Function} listener Callback receiving an immutable payload.
	 * @returns {Function} Idempotent unsubscribe function.
	 */
	on(eventName, listener) {
		this.assertEvent(eventName);
		if (typeof listener !== "function") {
			throw new TypeError("Peruta Run event listener must be a function.");
		}
		const listeners = this.listeners.get(eventName);
		listeners.add(listener);
		if (eventName === "ready" && this.readyPayload) {
			queueMicrotask(() => this.invoke(listener, this.readyPayload));
		}
		return () => listeners.delete(listener);
	}

	/** @param {string} eventName Event name. @param {object} payload Immutable semantic payload. */
	emit(eventName, payload = {}) {
		this.assertEvent(eventName);
		const frozenPayload = Object.freeze({ ...payload });
		if (eventName === "ready") this.readyPayload = frozenPayload;
		for (const listener of this.listeners.get(eventName)) {
			this.invoke(listener, frozenPayload);
		}
	}

	/** @param {string} eventName Candidate supported event name. */
	assertEvent(eventName) {
		if (!this.listeners.has(eventName)) {
			throw new RangeError(`Unsupported Peruta Run event: ${eventName}`);
		}
	}

	/** @param {Function} listener Listener protected from breaking the game. @param {object} payload Event payload. */
	invoke(listener, payload) {
		try {
			listener(payload);
		} catch (error) {
			console.error("Peruta Run event listener failed", error);
		}
	}
}

export const PERUTA_RUN_EVENTS = EVENT_NAMES;
