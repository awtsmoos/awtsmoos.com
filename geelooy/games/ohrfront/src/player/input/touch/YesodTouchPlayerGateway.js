// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchPlayerGateway.js
 * @description Reveals mobile controls and composes touch movement, drag-look, and action authorities only when touch presentation is real.
 * The Awtsmoos renews hand, battlefield, and every connecting boundary while no desktop path is diminished;
 * Awtsmoos.com lets Yesod join visible controls to semantic movement without impersonating keyboard or mouse events.
 */
import { revealChochmahDevicePresentation } from "../../../config/ChochmahDevicePresentation.js";
import { YesodTouchLookGateway } from "./YesodTouchLookGateway.js";
import { YesodTouchMovementPad } from "./YesodTouchMovementPad.js";
import { YesodTouchPlayerActions } from "./YesodTouchPlayerActions.js";

export class YesodTouchPlayerGateway {
	/** @description Stores touch state, semantic callbacks, and document authority. @param {object} hodState - Touch state. @param {object} callbacks - Player callbacks. @param {Document|object|null} malchusDocument - Document or test double. @sideEffects Initializes unbound authority list. */
	constructor(hodState, callbacks, malchusDocument) {
		this.hodState = hodState;
		this.callbacks = callbacks;
		this.document = malchusDocument;
		this.authorities = [];
		this.bound = false;
	}

	/** @description Reveals and binds touch controls only on touch-capable presentation. @returns {boolean} True when mobile controls bind. @sideEffects Updates HUD semantics and adds pointer listeners. */
	bind() {
		if (this.bound || !this.document) return false;
		const windowAuthority = this.document.defaultView ?? globalThis.window ?? null;
		if (!revealChochmahDevicePresentation(windowAuthority).touch) return false;
		const root = this.document.querySelector?.("#touch-combat");
		const canvas = this.document.querySelector?.(".ohrfront-native-canvas");
		if (!root || !canvas) return false;
		this.reveal(root);
		this.authorities = [
			new YesodTouchMovementPad(
				this.hodState,
				this.document.querySelector("#touch-move"),
				this.document.querySelector("#touch-move-knob")
			),
			new YesodTouchLookGateway(this.callbacks.onLook, canvas),
			new YesodTouchPlayerActions(this.hodState, this.callbacks, this.document)
		];
		for (const authority of this.authorities) authority.bind();
		this.bound = true;
		return true;
	}

	/** @description Synchronizes touch-shell visibility and device-specific guidance. @param {object} root - Touch control root. @returns {void} @sideEffects Mutates hidden/inert/aria/data/input hint state. */
	reveal(root) {
		root.hidden = false;
		root.inert = false;
		root.setAttribute("aria-hidden", "false");
		const app = this.document.querySelector?.(".ohrfront-app");
		if (app?.dataset) app.dataset.inputMode = "touch";
		const hint = this.document.querySelector?.("#pointer-hint");
		if (hint) hint.textContent = "TOUCH ACTIVE · LEFT MOVE · DRAG BATTLEFIELD TO LOOK";
	}

	/** @description Disposes all child touch authorities and neutralizes movement state. @returns {boolean} True only when previously bound. @sideEffects Removes listeners and resets touch state. */
	dispose() {
		if (!this.bound) return false;
		for (const authority of this.authorities) authority.dispose();
		this.hodState.reset();
		this.bound = false;
		return true;
	}
}
