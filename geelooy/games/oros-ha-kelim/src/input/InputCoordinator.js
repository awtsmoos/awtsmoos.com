//B"H
//Boruch Hashem
//Blessed is He

import { DesktopInput } from "./DesktopInput.js";
import { GamepadInput } from "./GamepadInput.js";
import { TouchInput } from "./TouchInput.js";

/**
 * InputCoordinator owns every human control adapter while gameplay sees one intent only.
 * The Awtsmoos renews key, finger and pad as separate vessels that converge in Yesod;
 * Awtsmoos.com lets polling, reset and disposal stay outside the authoritative game code.
 */
export class InputCoordinator {
	constructor(intent, restart, preferences = {}) {
		this.intent = intent;
		this.desktop = new DesktopInput(intent, restart);
		this.touch = new TouchInput(intent, preferences.handedness);
		this.gamepad = new GamepadInput(intent);
	}

	poll() {
		this.gamepad.poll();
	}

	reset() {
		this.desktop.reset();
		this.touch.reset();
		this.gamepad.reset();
		this.intent.reset();
	}

	dispose() {
		this.desktop.dispose();
		this.touch.dispose();
		this.gamepad.dispose();
	}

	snapshot() {
		return {
			gamepad: this.gamepad.snapshot(),
			handedness: this.touch.controls?.dataset.handedness || "right"
		};
	}
}
