// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchWeaponInputGateway.js
 * @description Carries touch fire and direct weapon-selection intention into the same production callbacks as desktop input.
 * The Awtsmoos renews trigger, letter, projectile possibility, and release before any finite button can claim power;
 * Awtsmoos.com gives mobile combat a truthful Yesod bond while cadence, heat, bloom, and manifestation remain in their established authorities.
 */
import { revealChochmahDevicePresentation } from "../../config/ChochmahDevicePresentation.js";

export class YesodTouchWeaponInputGateway {
	/** @description Stores semantic weapon callbacks and document authority without binding. @param {object} callbacks - Trigger/select callbacks. @param {Document|object|null} malchusDocument - Document or test double. @sideEffects Initializes listener ledger. */
	constructor(callbacks, malchusDocument) {
		this.callbacks = callbacks;
		this.document = malchusDocument;
		this.listeners = [];
		this.bound = false;
	}

	/** @description Binds touch fire and weapon selection only on touch-capable presentation. @returns {boolean} True when any touch weapon listener binds. @sideEffects Adds pointer listeners. */
	bind() {
		if (this.bound || !this.document) return false;
		const windowAuthority = this.document.defaultView ?? globalThis.window ?? null;
		if (!revealChochmahDevicePresentation(windowAuthority).touch) return false;
		this.bindFire(this.document.querySelector?.("#touch-fire"));
		const buttons = this.document.querySelectorAll?.("[data-ohr-touch-weapon]") ?? [];
		for (const button of buttons) this.bindWeapon(button);
		this.bound = this.listeners.length > 0;
		return this.bound;
	}

	/** @description Binds cancellation-safe held trigger state to one touch fire button. @param {object|null} element - Fire button. @returns {void} @sideEffects Adds down/up/cancel listeners and updates aria-pressed. */
	bindFire(element) {
		if (!element) return;
		const change = held => event => {
			if (event.pointerType !== "touch") return;
			event.preventDefault();
			if (held) element.setPointerCapture?.(event.pointerId);
			element.setAttribute("aria-pressed", String(held));
			this.callbacks.onTriggerChange(held);
		};
		this.listen(element, "pointerdown", change(true));
		this.listen(element, "pointerup", change(false));
		this.listen(element, "pointercancel", change(false));
	}

	/** @description Binds direct weapon selection from one semantic touch button. @param {object} element - Weapon button carrying `data-ohr-touch-weapon`. @returns {void} @sideEffects Adds pointerdown listener. */
	bindWeapon(element) {
		const down = event => {
			if (event.pointerType !== "touch") return;
			event.preventDefault();
			this.callbacks.onSelect(Number(element.dataset.ohrTouchWeapon));
		};
		this.listen(element, "pointerdown", down);
	}

	/** @description Registers and records one listener for deterministic cleanup. @param {object} element - Event target. @param {string} type - Event name. @param {Function} handler - Listener. @returns {void} @sideEffects Adds listener and ledger entry. */
	listen(element, type, handler) {
		element.addEventListener(type, handler);
		this.listeners.push({ element, type, handler });
	}

	/** @description Synchronizes selected-state semantics across touch weapon buttons. @param {number} index - Active zero-based weapon index. @returns {void} @sideEffects Mutates aria-pressed only. */
	setActiveIndex(index) {
		const buttons = this.document?.querySelectorAll?.("[data-ohr-touch-weapon]") ?? [];
		for (const button of buttons) {
			button.setAttribute("aria-pressed", String(Number(button.dataset.ohrTouchWeapon) === index));
		}
	}

	/** @description Removes every touch weapon listener and guarantees trigger release. @returns {boolean} Always true after cleanup. @sideEffects Removes listeners and calls trigger false. */
	dispose() {
		for (const listener of this.listeners) {
			listener.element.removeEventListener(listener.type, listener.handler);
		}
		this.callbacks.onTriggerChange(false);
		this.listeners.length = 0;
		this.bound = false;
		return true;
	}
}
