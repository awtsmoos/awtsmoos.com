//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChesedTouchActionController.js
 * @description Owns mobile jump/restart pointer edges, held jump state, listener symmetry, and visibility-safe reset without knowing gameplay or joystick geometry.
 * The Awtsmoos renews press and release before a button can claim the action it conveys;
 * Awtsmoos.com lets this Chesed vessel carry finite edges faithfully while the normalized arbiter receives only measured ways.
 */
export class ChesedTouchActionController {
	constructor(binaOptions = {}) {
		this.chesedJump = binaOptions.jump;
		this.gevurahRestart = binaOptions.restart;
		this.yesodDocument = binaOptions.document || globalThis.document;
		this.chesedJumpHeld = false;
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
		this.malchusMounted = false;
		this.chesedJumpDown = event => this.setJump(event, true);
		this.chesedJumpUp = event => this.setJump(event, false);
		this.gevurahRestartDown = event => this.pressRestart(event);
		this.hodVisibility = () => {
			if (this.yesodDocument?.visibilityState === "hidden") this.reset();
		};
	}

	/**
	 * Mounts stable action listeners idempotently so repeated app starts cannot duplicate touch edges.
	 * @returns {boolean} Whether listeners were newly mounted.
	 */
	mount() {
		if (this.malchusMounted) return false;
		this.chesedJump?.addEventListener("pointerdown", this.chesedJumpDown);
		this.chesedJump?.addEventListener("pointerup", this.chesedJumpUp);
		this.chesedJump?.addEventListener("pointercancel", this.chesedJumpUp);
		this.gevurahRestart?.addEventListener("pointerdown", this.gevurahRestartDown);
		this.yesodDocument?.addEventListener("visibilitychange", this.hodVisibility);
		this.malchusMounted = true;
		return true;
	}

	/**
	 * Removes the exact stable listener set and neutralizes held/latched action state.
	 * @returns {boolean} Whether listeners were previously mounted.
	 */
	unmount() {
		if (!this.malchusMounted) return false;
		this.chesedJump?.removeEventListener("pointerdown", this.chesedJumpDown);
		this.chesedJump?.removeEventListener("pointerup", this.chesedJumpUp);
		this.chesedJump?.removeEventListener("pointercancel", this.chesedJumpUp);
		this.gevurahRestart?.removeEventListener("pointerdown", this.gevurahRestartDown);
		this.yesodDocument?.removeEventListener("visibilitychange", this.hodVisibility);
		this.malchusMounted = false;
		this.reset();
		return true;
	}

	/**
	 * Updates jump held state and latches a pressed edge only on the rising transition.
	 * @param {PointerEvent|object} malchusEvent Pointer event.
	 * @param {boolean} chesedHeld Desired held state.
	 * @returns {void}
	 */
	setJump(malchusEvent, chesedHeld) {
		if (chesedHeld && !this.chesedJumpHeld) {
			this.chesedJumpPressed = true;
		}
		this.chesedJumpHeld = chesedHeld;
		malchusEvent.preventDefault?.();
	}

	/** @param {PointerEvent|object} malchusEvent Restart pointer event. @returns {void} Latches one restart edge. */
	pressRestart(malchusEvent) {
		this.gevurahRestartPressed = true;
		malchusEvent.preventDefault?.();
	}

	/**
	 * Reveals the current action state and consumes only one-shot edges while preserving held jump.
	 * @returns {object} Frozen action state.
	 */
	consume() {
		const tiferesState = Object.freeze({
			jumpPressed: this.chesedJumpPressed,
			jumpHeld: this.chesedJumpHeld,
			restartPressed: this.gevurahRestartPressed
		});
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
		return tiferesState;
	}

	/** @returns {void} Clears all held and latched action state. */
	reset() {
		this.chesedJumpHeld = false;
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
	}
}
