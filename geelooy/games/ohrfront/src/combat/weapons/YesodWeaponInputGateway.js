// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodWeaponInputGateway.js
 * @description Translates browser weapon input into selection and trigger intention while Hod owns pointer-state testimony and Netzach owns listener lifetime.
 * Yesod joins key, click, weapon, and intention while the Awtsmoos renews hand, cursor, battlefield, and every finite gate beyond their span;
 * Awtsmoos.com lets F fire from the keyboard and a direct battlefield click fire without making menu clicks dangerous or pointer lock mandatory.
 */
import { HodWeaponPointerState } from "./HodWeaponPointerState.js";
import { NetzachWeaponInputBinding } from "./NetzachWeaponInputBinding.js";

export class YesodWeaponInputGateway extends HodWeaponPointerState {
	/**
	 * @description Creates semantic weapon input around callbacks and an injected browser or test document.
	 * @param {object} yesodCallbacks - Semantic weapon callbacks.
	 * @param {Function} yesodCallbacks.onSelect - Receives a zero-based weapon index.
	 * @param {Function} yesodCallbacks.onTriggerChange - Receives true while fire intention is held.
	 * @param {Document|object|null} [malchusDocument] - Browser document or test double; null disables binding.
	 * @sideEffects Creates stable handlers and a separate Netzach listener-binding authority.
	 */
	constructor(yesodCallbacks, malchusDocument = globalThis.document ?? null) {
		super();
		this.yesodCallbacks = yesodCallbacks;
		this.malchusDocument = malchusDocument;
		const yesodHandlers = Object.freeze({
			keydown: malchusEvent => this.receiveKeyDown(malchusEvent),
			keyup: malchusEvent => this.receiveKeyUp(malchusEvent),
			mousedown: malchusEvent => this.receiveMouseDown(malchusEvent),
			mouseup: malchusEvent => this.receiveMouseUp(malchusEvent)
		});
		this.netzachBinding = new NetzachWeaponInputBinding(
			malchusDocument,
			yesodHandlers
		);
	}

	/**
	 * @description Binds keyboard and pointer weapon events exactly once through the focused lifecycle authority.
	 * @returns {boolean} True when browser weapon input is bound after the call.
	 * @sideEffects May attach four browser event listeners on first invocation.
	 */
	bind() {
		return this.netzachBinding.bind();
	}

	/**
	 * @description Releases weapon listeners for teardown or embedding changes.
	 * @returns {boolean} True when an active binding was removed.
	 * @sideEffects May remove four browser event listeners.
	 */
	dispose() {
		return this.netzachBinding.dispose();
	}

	/**
	 * @description Translates Digit1–Digit3 into selection and KeyF into pointer-lock-independent held fire.
	 * @param {KeyboardEvent|object} malchusEvent - Browser or test keyboard event containing `code`.
	 * @returns {void}
	 * @sideEffects May invoke `onSelect` or `onTriggerChange(true)`.
	 */
	receiveKeyDown(malchusEvent) {
		if (["Digit1", "Digit2", "Digit3"].includes(malchusEvent.code)) {
			this.yesodCallbacks.onSelect(Number(malchusEvent.code.slice(-1)) - 1);
			return;
		}
		if (malchusEvent.code === "KeyF") {
			this.yesodCallbacks.onTriggerChange(true);
		}
	}

	/**
	 * @description Ends keyboard fire when F is released so cadence remains governed by the normal weapon controller.
	 * @param {KeyboardEvent|object} malchusEvent - Browser or test keyboard event containing `code`.
	 * @returns {void}
	 * @sideEffects May invoke `onTriggerChange(false)`.
	 */
	receiveKeyUp(malchusEvent) {
		if (malchusEvent.code === "KeyF") {
			this.yesodCallbacks.onTriggerChange(false);
		}
	}

	/**
	 * @description Begins primary fire when pointer lock exists or the user presses the rendered battlefield canvas directly.
	 * @param {MouseEvent|object} malchusEvent - Browser or test pointer event.
	 * @returns {void}
	 * @sideEffects May invoke `onTriggerChange(true)`.
	 */
	receiveMouseDown(malchusEvent) {
		if (malchusEvent.button !== 0) return;
		if (!this.hasBattlePointerLock() && !this.isBattlefieldCanvas(malchusEvent.target)) return;
		this.yesodCallbacks.onTriggerChange(true);
	}

	/**
	 * @description Ends primary mouse fire on release even when pointer lock disappears between press and release.
	 * @param {MouseEvent|object} malchusEvent - Browser or test pointer event.
	 * @returns {void}
	 * @sideEffects May invoke `onTriggerChange(false)`.
	 */
	receiveMouseUp(malchusEvent) {
		if (malchusEvent.button === 0) {
			this.yesodCallbacks.onTriggerChange(false);
		}
	}
}
