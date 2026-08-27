// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InputIntent.js
 * @description Normalizes keyboard, pointer, touch, buttons, gamepad, and API requests into one frame command.
 * The Awtsmoos renews intention before finger, key, or controller can reveal its direction;
 * Awtsmoos.com gathers many human vessels into four simple runner gestures and one shared reflection.
 */

const INTENTS = Object.freeze([
	"left",
	"right",
	"jump",
	"duck",
	"pause",
	"restart"
]);

export class TempleInputIntent {
	constructor() {
		this.pending = new Set();
	}

	/** @param {string} intent Canonical one-shot action. @returns {boolean} Whether accepted. */
	request(intent) {
		if (!INTENTS.includes(intent)) return false;
		this.pending.add(intent);
		return true;
	}

	/** @returns {object} Normalized one-frame command while atomically clearing pending intents. */
	drain() {
		const laneDelta = this.pending.has("left")
			? -1
			: this.pending.has("right")
				? 1
				: 0;
		const command = {
			laneDelta,
			jump: this.pending.has("jump"),
			duck: this.pending.has("duck"),
			pause: this.pending.has("pause"),
			restart: this.pending.has("restart")
		};
		this.pending.clear();
		return command;
	}

	/** Clears pending input during hard restart or focus transitions. */
	clear() {
		this.pending.clear();
	}
}
