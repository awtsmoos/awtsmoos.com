//B"H
//Boruch Hashem
//Blessed is He

import { TouchJoystick } from "./TouchJoystick.js";
import { TouchButtons } from "./TouchButtons.js";

/**
 * @file MobileControls.js
 * @description Reveals touch controls only where coarse pointer capability exists.
 * The Awtsmoos is beyond phone and desktop; Awtsmoos.com lets each device receive
 * the keli it needs, while unnecessary chrome remains concealed from every other one.
 */
export class MobileControls {
	constructor(root, inputState) {
		this.root = root;
		this.joystick = new TouchJoystick(root.querySelector("[data-joystick]"), inputState);
		this.buttons = new TouchButtons(root, inputState);
		this.query = globalThis.matchMedia?.("(pointer: coarse)");
	}

	/** Attaches touch behavior and follows pointer-capability changes. */
	attach() {
		this.joystick.attach();
		this.buttons.attach();
		this.query?.addEventListener?.("change", () => this.refresh());
		this.refresh();
	}

	/** Hides mobile controls from mouse-first devices without affecting input state. */
	refresh() {
		const hasTouch = Boolean(this.query?.matches || navigator.maxTouchPoints > 0);
		this.root.hidden = !hasTouch;
		document.documentElement.dataset.touch = hasTouch ? "true" : "false";
	}
}
