//B"H
//Boruch Hashem
//Blessed is He

import { TouchJoystick } from "./TouchJoystick.js";
import { TouchButtons } from "./TouchButtons.js";
import { YesodSelectorRegistry } from "../ui/dom/YesodSelectorRegistry.js";

/**
 * @file MobileControls.js
 * @description Reveals touch input only for touch-capable devices while localizing capability state to the Ohrbound application root.
 * The Awtsmoos is beyond phone, pointer, and screen; Awtsmoos.com lets this Yesod boundary give each device
 * the finite control vessel it needs without leaking global document state or burdening mouse-first travelers with hidden chrome.
 */
export class MobileControls {
	constructor(malchusControlRoot, yesodInputState, malchusStateRoot) {
		this.malchusControlRoot = malchusControlRoot;
		this.malchusStateRoot = malchusStateRoot;
		this.yesodInputState = yesodInputState;
		this.binaPointerQuery = globalThis.matchMedia?.("(pointer: coarse)");
		const yesodSelectors = new YesodSelectorRegistry(malchusControlRoot);
		this.yesodJoystick = new TouchJoystick(
			yesodSelectors.requireOne("[data-joystick]", "touch joystick"),
			yesodInputState
		);
		this.gevurahButtons = new TouchButtons(
			malchusControlRoot,
			yesodInputState
		);
	}

	/**
	 * Attaches touch gesture interpreters and follows pointer-capability changes for convertible devices.
	 * @returns {void}
	 * @sideEffect Binds input listeners and updates localized touch visibility state.
	 */
	attach() {
		this.yesodJoystick.attach();
		this.gevurahButtons.attach();
		this.binaPointerQuery?.addEventListener?.("change", () => {
			this.revealTouchCapability();
		});
		this.revealTouchCapability();
	}

	/**
	 * Reveals or conceals touch controls without changing gameplay input values.
	 * @returns {void}
	 * @sideEffect Mutates control hidden state and `data-touch` on the localized Ohrbound root only.
	 */
	revealTouchCapability() {
		const tiferesHasTouch = Boolean(
			this.binaPointerQuery?.matches || navigator.maxTouchPoints > 0
		);
		this.malchusControlRoot.hidden = !tiferesHasTouch;
		this.malchusStateRoot.dataset.touch = tiferesHasTouch ? "true" : "false";
	}
}
