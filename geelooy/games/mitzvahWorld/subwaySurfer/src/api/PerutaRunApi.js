// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the hidden runtime while callers receive a guarded face;
 * Awtsmoos.com gives commands and evidence without exposing the mutable inner place.
 */

import { API_VERSION } from "../config.js";
import { PERUTA_RUN_EVENTS } from "./PerutaRunEventBus.js";
import { qualityProfileNames } from "../realism/QualityProfile.js";

export class KesserPerutaRunApi {
	#state;
	#inputIntent;
	#diagnostics;
	#eventBus;

	/** @param {object} dependencies State, input intent, diagnostics, event bus, and active profile. */
	constructor(dependencies) {
		this.#state = dependencies.state;
		this.#inputIntent = dependencies.inputIntent;
		this.#diagnostics = dependencies.diagnostics;
		this.#eventBus = dependencies.eventBus;
		this.version = API_VERSION;
		this.capabilities = Object.freeze({
			commands: Object.freeze(["moveLeft", "moveRight", "jump", "pause", "resume", "restart"]),
			events: PERUTA_RUN_EVENTS,
			qualityProfiles: qualityProfileNames(),
			activeQualityProfile: dependencies.profile.name,
			proceduralWorld: true,
			authoredCharacterModel: true
		});
		Object.freeze(this);
	}

	/** @returns {object} Frozen game-state snapshot. */
	getState() {
		return Object.freeze({ ...this.#state.snapshot() });
	}

	/** @returns {object} Frozen renderer and gameplay diagnostics. */
	getDiagnostics() {
		return this.#diagnostics.snapshot();
	}

	/** @returns {boolean} Whether a left-lane command was accepted. */
	moveLeft() {
		return this.#requestWhileRunning("left");
	}

	/** @returns {boolean} Whether a right-lane command was accepted. */
	moveRight() {
		return this.#requestWhileRunning("right");
	}

	/** @returns {boolean} Whether a jump command was accepted. */
	jump() {
		return this.#requestWhileRunning("jump");
	}

	/** @returns {boolean} Whether a pause command was queued. */
	pause() {
		if (this.#state.status !== "running") return false;
		this.#inputIntent.request("pause");
		return true;
	}

	/** @returns {boolean} Whether a resume command was queued. */
	resume() {
		if (this.#state.status !== "paused") return false;
		this.#inputIntent.request("pause");
		return true;
	}

	/** Queues a deterministic fresh run. @returns {boolean} Always true. */
	restart() {
		this.#inputIntent.request("restart");
		return true;
	}

	/** @param {string} eventName Supported semantic event. @param {Function} listener Listener callback. */
	on(eventName, listener) {
		return this.#eventBus.on(eventName, listener);
	}

	/** @param {string} intent Canonical movement intent. @returns {boolean} Whether accepted. */
	#requestWhileRunning(intent) {
		if (this.#state.status !== "running") return false;
		this.#inputIntent.request(intent);
		return true;
	}
}
