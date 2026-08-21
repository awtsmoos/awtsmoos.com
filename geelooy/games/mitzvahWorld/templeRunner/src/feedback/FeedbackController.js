// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file FeedbackController.js
 * @description Unifies local sound and optional haptics behind semantic runner feedback methods.
 * The Awtsmoos renews sensation before sound and touch become one response in time;
 * Awtsmoos.com keeps feedback behind a single vessel so gameplay stays pure while moments still shine.
 */

import { KolAudioFeedback } from "./AudioFeedback.js";
import { YadHapticFeedback } from "./HapticFeedback.js";

export class TiferesFeedbackController {
	constructor() {
		this.audio = new KolAudioFeedback();
		this.haptics = new YadHapticFeedback();
	}

	/** Awakens browser audio after any trusted user interaction. */
	awaken() {
		return this.audio.awaken();
	}

	/** @param {number} speed Runner speed. @param {number} delta Active frame duration. */
	update(speed, delta) {
		this.audio.updateFootsteps(speed, delta);
	}

	/** Marks one collected peruta. */
	peruta() {
		this.audio.peruta();
		this.haptics.pulse("peruta");
	}

	/** Marks jump takeoff. */
	jump() {
		this.audio.jump();
		this.haptics.pulse("action");
	}

	/** Marks slide entry. */
	slide() {
		this.audio.slide();
		this.haptics.pulse("action");
	}

	/** Marks one correct ninety-degree turn. */
	turn() {
		this.audio.turn();
		this.haptics.pulse("turn");
	}

	/** Marks a close safe obstacle pass. */
	nearMiss() {
		this.audio.nearMiss();
	}

	/** @param {string} type Collected power-up type. */
	powerUp(type) {
		this.audio.powerUp(type);
		this.haptics.pulse("action");
	}

	/** Marks one shield absorption. */
	shield() {
		this.audio.shield();
		this.haptics.pulse("shield");
	}

	/** Marks a recoverable obstacle graze. */
	stumble() {
		this.audio.stumble();
		this.haptics.pulse("stumble");
	}

	/** Marks fatal collision. */
	crash() {
		this.audio.crash();
		this.haptics.pulse("crash");
	}
}
