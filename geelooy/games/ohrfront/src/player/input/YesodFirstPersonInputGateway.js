// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodFirstPersonInputGateway.js
 * @description Translates browser key and pointer events into semantic first-person intentions while Hod reveals input state and Netzach owns listener lifetime.
 * Yesod joins finite event to embodied intention while the Awtsmoos renews hand, key, pointer, and world beyond every dividing line;
 * Awtsmoos.com lets event meaning live here, state testimony in Hod, and browser endurance in Netzach, three ordered vessels of one clear light.
 */
import { HodFirstPersonInputState } from "./HodFirstPersonInputState.js";
import { NetzachFirstPersonInputBinding } from "./NetzachFirstPersonInputBinding.js";

export class YesodFirstPersonInputGateway extends HodFirstPersonInputState {
	/**
	 * @description Creates semantic first-person input around callbacks and an injected browser or test document.
	 * @param {object} yesodCallbacks - Semantic callbacks consumed by the player controller.
	 * @param {Function} yesodCallbacks.onLook - Receives horizontal and vertical pointer movement.
	 * @param {Function} yesodCallbacks.onJump - Receives one jump intention on Space keydown.
	 * @param {Function} yesodCallbacks.onSlide - Receives one slide intention on KeyC keydown.
	 * @param {Document|object|null} [malchusDocument] - Browser document or test double; null disables browser binding.
	 * @sideEffects Creates stable event handlers and a separate Netzach binding authority; no listeners attach until `bind()`.
	 */
	constructor(yesodCallbacks, malchusDocument = globalThis.document ?? null) {
		super();
		this.yesodCallbacks = yesodCallbacks;
		this.malchusDocument = malchusDocument;
		this.netzachKeys = new Set();
		const yesodHandlers = Object.freeze({
			keydown: malchusEvent => this.receiveKeyDown(malchusEvent),
			keyup: malchusEvent => this.receiveKeyUp(malchusEvent),
			mousemove: malchusEvent => this.receiveMouseMove(malchusEvent)
		});
		this.netzachBinding = new NetzachFirstPersonInputBinding(
			malchusDocument,
			yesodHandlers
		);
	}

	/**
	 * @description Binds the first-person browser listener set through the focused lifecycle authority.
	 * @returns {boolean} True when the browser binding is active after the call.
	 * @sideEffects May attach keydown, keyup, and mousemove listeners on first invocation.
	 */
	bind() {
		return this.netzachBinding.bind();
	}

	/**
	 * @description Releases browser listeners and clears held-key intent for safe teardown and re-entry.
	 * @returns {boolean} True when an active browser binding was removed.
	 * @sideEffects May detach listeners and clears the local held-key set after successful disposal.
	 */
	dispose() {
		const netzachDisposed = this.netzachBinding.dispose();
		if (netzachDisposed) this.netzachKeys.clear();
		return netzachDisposed;
	}

	/**
	 * @description Records one held key and emits discrete jump or slide intentions without deciding whether gameplay permits them.
	 * @param {KeyboardEvent|object} malchusEvent - Browser or test keydown event containing a `code`.
	 * @returns {void}
	 * @sideEffects Mutates held-key state and may invoke semantic callbacks.
	 */
	receiveKeyDown(malchusEvent) {
		this.netzachKeys.add(malchusEvent.code);
		if (malchusEvent.code === "Space") this.yesodCallbacks.onJump();
		if (malchusEvent.code === "KeyC") this.yesodCallbacks.onSlide();
	}

	/**
	 * @description Removes one released key from the held-intention set.
	 * @param {KeyboardEvent|object} malchusEvent - Browser or test keyup event containing a `code`.
	 * @returns {void}
	 * @sideEffects Mutates held-key state only.
	 */
	receiveKeyUp(malchusEvent) {
		this.netzachKeys.delete(malchusEvent.code);
	}

	/**
	 * @description Emits look intention only while the injected document body owns pointer lock.
	 * @param {MouseEvent|object} malchusEvent - Browser or test pointer event with movement deltas.
	 * @returns {void}
	 * @sideEffects May invoke `onLook`; never changes camera state directly.
	 */
	receiveMouseMove(malchusEvent) {
		if (!this.hasBattlePointerLock()) return;
		this.yesodCallbacks.onLook(
			malchusEvent.movementX || 0,
			malchusEvent.movementY || 0
		);
	}
}
