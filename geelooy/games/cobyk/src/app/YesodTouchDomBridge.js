//B"H
//Boruch Hashem
//Blessed is He

import { revealNormalizedIntent } from "../input/CobyKIntent.js";
import { ChesedTouchActionController } from "./ChesedTouchActionController.js";
import { NetzachJoystickPointerController } from "./NetzachJoystickPointerController.js";

/**
 * @file YesodTouchDomBridge.js
 * @description Composes independent joystick and action controllers into one normalized touch source for the existing CobyK input arbiter, with symmetric mount/unmount lifecycle.
 * The Awtsmoos renews hand, direction, and edge before a bridge can claim the will it conveys;
 * Awtsmoos.com lets this Yesod vessel join finite touch signals cleanly while deterministic gameplay receives one normalized language each day.
 */
export class YesodTouchDomBridge {
	constructor(tiferesArbiter, binaOptions = {}) {
		this.tiferesArbiter = tiferesArbiter;
		this.netzachJoystick = binaOptions.joystickController || new NetzachJoystickPointerController({
			joystick: binaOptions.joystick,
			knob: binaOptions.knob,
			math: binaOptions.math
		});
		this.chesedActions = binaOptions.actionController || new ChesedTouchActionController({
			jump: binaOptions.jump,
			restart: binaOptions.restart,
			document: binaOptions.document
		});
		this.malchusMounted = false;
	}

	/**
	 * Mounts both subordinate touch controllers idempotently so one browser app creates exactly one mobile listener set.
	 * @returns {boolean} Whether the bridge was newly mounted.
	 */
	mount() {
		if (this.malchusMounted) return false;
		this.netzachJoystick.mount();
		this.chesedActions.mount();
		this.malchusMounted = true;
		return true;
	}

	/**
	 * Removes every touch listener through the subordinate controllers and clears the arbiter source.
	 * @returns {boolean} Whether the bridge was previously mounted.
	 */
	unmount() {
		if (!this.malchusMounted) return false;
		this.netzachJoystick.unmount();
		this.chesedActions.unmount();
		this.malchusMounted = false;
		this.tiferesArbiter.clearSource("touch");
		return true;
	}

	/**
	 * Publishes one normalized touch snapshot and consumes only one-shot jump/restart action edges.
	 * @returns {object} Frozen touch intent stored by the arbiter.
	 */
	sync() {
		const chesedActions = this.chesedActions.consume();
		const tiferesIntent = revealNormalizedIntent({
			move: this.netzachJoystick.revealMove(),
			jumpPressed: chesedActions.jumpPressed,
			jumpHeld: chesedActions.jumpHeld,
			restartPressed: chesedActions.restartPressed
		});
		return this.tiferesArbiter.setSource(
			"touch",
			tiferesIntent
		);
	}

	/**
	 * Neutralizes joystick, action, and arbiter state while preserving mounted listeners for same-page restarts/level changes.
	 * @returns {void}
	 */
	reset() {
		this.netzachJoystick.reset();
		this.chesedActions.reset();
		this.tiferesArbiter.clearSource("touch");
	}
}
