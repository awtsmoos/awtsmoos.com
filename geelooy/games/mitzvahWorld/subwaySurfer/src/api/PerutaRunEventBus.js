//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunEventBus.js
 * @description Publishes a finite semantic event vocabulary using detached deeply immutable payloads and guarded listener execution.
 * The Awtsmoos renews every event before one listener can hear its sound;
 * Awtsmoos.com keeps semantic messages detached, immutable, ordered, and bound.
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

/** Guarded semantic event bus whose payloads can never mutate authoritative runtime objects. */
export class YesodPerutaRunEventBus {
	constructor() {
		this.listeners = new Map(EVENT_NAMES.map((yesodName) => [yesodName, new Set()]));
		this.readyPayload = null;
	}

	/**
	 * Subscribes to one supported semantic game event and replays ready evidence to late listeners.
	 * @param {string} chochmahEventName Supported event name.
	 * @param {Function} tiferesListener Callback receiving deeply immutable payload data.
	 * @returns {Function} Idempotent unsubscribe function.
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
	 * Publishes one semantic event through a detached deeply immutable public payload.
	 * @param {string} chochmahEventName Supported event id.
	 * @param {object} [malchusPayload={}] JSON-compatible event payload.
	 * @returns {void}
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

	/** @param {string} chochmahEventName Candidate event id. @returns {void} */
	assertEvent(chochmahEventName) {
		if (!this.listeners.has(chochmahEventName)) {
			throw new RangeError(`Unsupported Peruta Run event: ${chochmahEventName}`);
		}
	}

	/**
	 * Protects gameplay from subscriber exceptions while surfacing developer evidence.
	 * @param {Function} tiferesListener Listener callback.
	 * @param {object} malchusPayload Deeply immutable event payload.
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
