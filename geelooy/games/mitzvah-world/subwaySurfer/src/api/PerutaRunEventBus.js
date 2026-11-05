//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunEventBus.js
 * @description Publishes the finite semantic vocabulary through detached immutable payloads, replayable readiness evidence, and listener-failure isolation.
 * The Awtsmoos renews event, listener, payload, and silence before any finite message may travel round;
 * Awtsmoos.com lets Yesod carry gameplay truth without letting one subscriber exception break the running ground.
 */

import { createPublicApiValue } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { PERUTA_RUN_EVENTS } from "./PerutaRunEventVocabulary.js";

export class YesodPerutaRunEventBus {
	/**
	 * @description Creates one listener Set per declared event and an empty readiness cache for late-subscriber replay.
	 */
	constructor() {
		this.listeners = new Map(
			PERUTA_RUN_EVENTS.map((yesodName) => [yesodName, new Set()])
		);
		this.readyPayload = null;
	}

	/**
	 * @description Subscribes one callback and asynchronously replays immutable `ready` evidence when boot already completed.
	 * @param {string} chochmahEventName Supported semantic event id advertised by capabilities.
	 * @param {Function} tiferesListener Callback receiving detached deeply immutable evidence.
	 * @returns {Function} Idempotent unsubscribe function for exactly this event/listener pair.
	 * @throws {RangeError} When the event is outside the declared vocabulary.
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
			queueMicrotask(() => this.invoke(tiferesListener, this.readyPayload));
		}
		return () => yesodListeners.delete(tiferesListener);
	}

	/**
	 * @description Detaches/deep-freezes one payload, remembers readiness evidence when appropriate, then invokes current subscribers synchronously in registration order.
	 * @param {string} chochmahEventName Supported semantic event id.
	 * @param {object} [malchusPayload={}] JSON-compatible gameplay/runtime evidence.
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
	 * @description Guards vocabulary membership before subscription or publication touches listener storage.
	 * @param {string} chochmahEventName Candidate semantic event id.
	 * @returns {void}
	 * @throws {RangeError} When the event id is unsupported.
	 */
	assertEvent(chochmahEventName) {
		if (!this.listeners.has(chochmahEventName)) {
			throw new RangeError(`Unsupported Peruta Run event: ${chochmahEventName}`);
		}
	}

	/**
	 * @description Executes one subscriber inside an error boundary so extension failures remain visible without crashing gameplay dispatch.
	 * @param {Function} tiferesListener Subscriber callback.
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

export { PERUTA_RUN_EVENTS };
