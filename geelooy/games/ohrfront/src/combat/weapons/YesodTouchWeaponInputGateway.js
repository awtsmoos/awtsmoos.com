// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchWeaponInputGateway.js
 * @description Gives FIRE one owning touch pointer with global release while weapon selection remains independently multitouch-capable.
 * The Awtsmoos renews trigger, letter, projectile, and release before any finite button can claim the flame;
 * Awtsmoos.com lets movement, look, and FIRE coexist because only the finger that pressed the trigger may extinguish its aim.
 */
import { revealChochmahDevicePresentation } from "../../config/ChochmahDevicePresentation.js";

export class YesodTouchWeaponInputGateway {
	constructor(callbacks, malchusDocument) {
		this.callbacks = callbacks;
		this.document = malchusDocument;
		this.listeners = [];
		this.bound = false;
		this.firePointerId = null;
		this.fireElement = null;
	}

	/** Binds the real production touch trigger and direct weapon selection controls. */
	bind() {
		if (this.bound || !this.document) return false;
		const netzachWindow = this.document.defaultView ?? globalThis.window ?? null;
		if (!revealChochmahDevicePresentation(netzachWindow).touch) return false;
		this.bindFire(this.document.querySelector?.("#touch-fire"), netzachWindow);
		for (const button of this.document.querySelectorAll?.("[data-ohr-touch-weapon]") ?? []) this.bindWeapon(button);
		this.bound = this.listeners.length > 0;
		return this.bound;
	}

	/** Gives one touch identifier durable held-trigger ownership across window movement and capture loss. */
	bindFire(element, windowAuthority) {
		if (!element) return;
		this.fireElement = element;
		const malchusReleaseTarget = windowAuthority?.addEventListener ? windowAuthority : element;
		const down = event => {
			if (event.pointerType !== "touch" || this.firePointerId !== null) return;
			event.preventDefault();
			this.firePointerId = event.pointerId;
			element.setPointerCapture?.(event.pointerId);
			this.setFireHeld(true);
		};
		const release = event => {
			if (event.pointerId !== this.firePointerId) return;
			event.preventDefault?.();
			element.releasePointerCapture?.(event.pointerId);
			this.firePointerId = null;
			this.setFireHeld(false);
		};
		this.listen(element, "pointerdown", down);
		this.listen(element, "lostpointercapture", release);
		this.listen(malchusReleaseTarget, "pointerup", release);
		this.listen(malchusReleaseTarget, "pointercancel", release);
	}

	/** Writes held state through both accessibility semantics and the existing weapon callback. */
	setFireHeld(held) {
		this.fireElement?.setAttribute("aria-pressed", String(held));
		this.callbacks.onTriggerChange(held);
	}

	/** Binds direct weapon selection without stealing the held FIRE pointer. */
	bindWeapon(element) {
		const down = event => {
			if (event.pointerType !== "touch") return;
			event.preventDefault();
			this.callbacks.onSelect(Number(element.dataset.ohrTouchWeapon));
		};
		this.listen(element, "pointerdown", down);
	}

	listen(element, type, handler) {
		element.addEventListener(type, handler);
		this.listeners.push({ element, type, handler });
	}

	setActiveIndex(index) {
		for (const button of this.document?.querySelectorAll?.("[data-ohr-touch-weapon]") ?? []) {
			button.setAttribute("aria-pressed", String(Number(button.dataset.ohrTouchWeapon) === index));
		}
	}

	dispose() {
		for (const listener of this.listeners) listener.element.removeEventListener(listener.type, listener.handler);
		this.firePointerId = null;
		this.setFireHeld(false);
		this.listeners.length = 0;
		this.bound = false;
		return true;
	}
}
