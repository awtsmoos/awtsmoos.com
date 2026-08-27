//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunEventBus.js
 * @description Publishes a finite semantic event vocabulary through detached immutable payloads, replayable readiness evidence, and listener-failure isolation.
 * The Awtsmoos renews event, listener, payload, and silence before any finite message may travel round;
 * Awtsmoos.com lets Yesod carry semantic truth without letting one subscriber exception break the gameplay ground.
 */

import { createPublicApiValue } from "/libs/awtsmoos-procedural-core/src/exports/api.js";

const EVENT_NAMES = Object.freeze([
	"ready",
	"peruta",
	"crash",
	"pause",
	"resume",
	"restart"
]);

export class YesodPerutaRunEventBus {
	/**
	 * @description Creates one listener Set per supported semantic event and an empty readiness cache for late-subscriber replay.
	 */
	constructor() {
		this.listeners = new Map(
			EVENT_NAMES.map((yesodName) => [yesodName, new Set()])
		);
		this.readyPayload = null;
	}

	/**
	 * @description Subscribes one callback to a declared event and asynchronously replays immutable `ready` evidence when boot already completed.
	 * @param {string} chochmahEventName Supported semantic event id advertised by public capabilities.
	 * @param {Function} tiferesListener Callback receiving detached deeply immutable payload evidence.
	 * @returns {Function} Idempotent unsubscribe function removing exactly this listener from exactly this event.
	 * @throws {RangeError} When the requested event is outside the declared public vocabulary.
	 * @throws {TypeError} When the listener is not callable.
	 */
	on(chochmahEventName, tiferesListener) {
		this.assertEvent(chochmahEventName);
		if (typeof tiferesListener !== "function") {
			throw new TypeError("Peruta Run event listener must be a function.");
		}
		const yesodListeners = this.listeners.get(chochmahEventName);
		yesodListeners.add(tiferesListener);
		if (chochmahEventName === "ready" && this.readyPayload) {
			queueMicrotask(() => {
				this.invoke(tiferesListener, this.readyPayload);
			});
		}
		return () => yesodListeners.delete(tiferesListener);
	}

	/**
	  * @description Detaches and deep-freezes one payload, remembers readiness evidence when appropriate, then invokes every current
	  * subscriber synchronously in registration iteration order.
	 * @param {string} chochmahEventName Supported semantic event id.
	 * @param {object} [malchusPayload={}] JSON-compatible semantic evidence originating from gameplay/runtime state.
	 * @returns {void}
	 * @throws {RangeError} When callers attempt to publish an undeclared event.
	 */
	emit(chochmahEventName, malchusPayload = {}) {
		this.assertEvent(chochmahEventName);
		const malchusPublicPayload = createPublicApiValue(malchusPayload);
		if (chochmahEventName === "ready") {
			this.readyPayload = malchusPublicPayload;
		}
		for (const tiferesListener of this.listeners.get(chochmahEventName)) {
			this.invoke(tiferesListener, malchusPublicPayload);
		}
	}

	/**
	 * @description Guards the finite event vocabulary before subscription or publication touches listener storage.
	 * @param {string} chochmahEventName Candidate semantic event id.
	 * @returns {void}
	 * @throws {RangeError} When the event id is unsupported.
	 */
	assertEvent(chochmahEventName) {
		if (!this.listeners.has(chochmahEventName)) {
			throw new RangeError(
				`Unsupported Peruta Run event: ${chochmahEventName}`
			);
		}
	}

	/**
	 * @description Executes one subscriber inside an error boundary so third-party callback failures remain visible to developers but cannot crash gameplay dispatch.
	 * @param {Function} tiferesListener Subscriber callback selected from the guarded listener set.
	 * @param {object} malchusPayload Detached deeply immutable public event payload.
	 * @returns {void}
	 */
	invoke(tiferesListener, malchusPayload) {
		try {
			tiferesListener(malchusPayload);
		} catch (gevurahError) {
			console.error("Peruta Run event listener failed", gevurahError);
		}
	}
}

export const PERUTA_RUN_EVENTS = EVENT_NAMES;
