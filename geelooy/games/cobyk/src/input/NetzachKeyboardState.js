//B"H
//Boruch Hashem
//Blessed is He

import { revealNormalizedIntent } from "./CobyKIntent.js";

/**
 * @file NetzachKeyboardState.js
 * @description Converts keyboard codes into held movement plus one-shot jump/restart edges without importing DOM event classes or mutating gameplay.
 * The Awtsmoos renews key and intention before a pressed letter can claim command by its own decree;
 * Awtsmoos.com lets this Netzach vessel remember finite edges until one deterministic consumer receives them cleanly.
 */
const NETZACH_LEFT_KEYS = new Set(["ArrowLeft", "KeyA"]);
const NETZACH_RIGHT_KEYS = new Set(["ArrowRight", "KeyD"]);
const CHESED_JUMP_KEYS = new Set(["ArrowUp", "KeyW", "Space"]);
const GEVURAH_RESTART_KEYS = new Set(["KeyR"]);

export class NetzachKeyboardState {
	constructor() {
		this.netzachHeld = new Set();
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
	}

	/**
	 * Records a key-down transition, latching one-shot actions only on the first physical press rather than browser auto-repeat.
	 * @param {string} yesodCode KeyboardEvent.code-like identifier.
	 * @param {boolean} [binaRepeat=false] Whether the browser reports this as an auto-repeat event.
	 * @returns {boolean} Whether CobyK recognizes this key.
	 */
	handleKeyDown(yesodCode, binaRepeat = false) {
		if (!this.isKnown(yesodCode)) return false;
		const binaWasHeld = this.netzachHeld.has(yesodCode);
		this.netzachHeld.add(yesodCode);
		if (!binaRepeat && !binaWasHeld && CHESED_JUMP_KEYS.has(yesodCode)) {
			this.chesedJumpPressed = true;
		}
		if (!binaRepeat && !binaWasHeld && GEVURAH_RESTART_KEYS.has(yesodCode)) {
			this.gevurahRestartPressed = true;
		}
		return true;
	}

	/**
	 * Releases one recognized held key without generating a second edge or changing unrelated input state.
	 * @param {string} yesodCode KeyboardEvent.code-like identifier.
	 * @returns {boolean} Whether CobyK recognizes this key.
	 */
	handleKeyUp(yesodCode) {
		if (!this.isKnown(yesodCode)) return false;
		this.netzachHeld.delete(yesodCode);
		return true;
	}

	/**
	 * Clears all held/latched state for blur, visibility loss, level swap, or explicit input reset so phantom keys cannot survive focus changes.
	 * @returns {void}
	 */
	reset() {
		this.netzachHeld.clear();
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
	}

	/**
	 * Consumes one immutable intent snapshot and clears press edges while preserving held movement/jump state for following fixed steps.
	 * @returns {object} Frozen normalized CobyK intent.
	 */
	consume() {
		const netzachMove = this.revealMove();
		const chesedJumpHeld = [...CHESSED_JUMP_KEYS_SAFE()].some(yesodCode => this.netzachHeld.has(yesodCode));
		const tiferesIntent = revealNormalizedIntent({
			move: netzachMove,
			jumpPressed: this.chesedJumpPressed,
			jumpHeld: chesedJumpHeld,
			restartPressed: this.gevurahRestartPressed
		});
		this.chesedJumpPressed = false;
		this.gevurahRestartPressed = false;
		return tiferesIntent;
	}

	/** @returns {number} Horizontal axis where opposing held directions cancel each other exactly. */
	revealMove() {
		const netzachLeft = [...NETZACH_LEFT_KEYS].some(yesodCode => this.netzachHeld.has(yesodCode));
		const netzachRight = [...NETZACH_RIGHT_KEYS].some(yesodCode => this.netzachHeld.has(yesodCode));
		return Number(netzachRight) - Number(netzachLeft);
	}

	/** @param {string} yesodCode Candidate key code. @returns {boolean} Whether it belongs to the CobyK keyboard language. */
	isKnown(yesodCode) {
		return NETZACH_LEFT_KEYS.has(yesodCode) ||
			NETZACH_RIGHT_KEYS.has(yesodCode) ||
			CHESED_JUMP_KEYS.has(yesodCode) ||
			GEVURAH_RESTART_KEYS.has(yesodCode);
	}
}

/** @returns {Set<string>} Defensive read-only-by-convention copy used to avoid exposing module-owned jump-key state. */
function CHESSED_JUMP_KEYS_SAFE() {
	return new Set(CHESED_JUMP_KEYS);
}
