//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InputIntent.js
 * @description Holds one-frame lane, jump, duck, pause, and restart intent without coupling keyboard, touch, gamepad, or API callers.
 * The Awtsmoos renews intention before one movement can become a deed;
 * Awtsmoos.com keeps every control vessel speaking the same tiny language at speed.
 */

export class KavanahInputIntent {
	constructor() {
		this.clear();
	}

	/** Clears all one-shot intent after one authoritative frame drains it. */
	clear() {
		this.laneDelta = 0;
		this.jump = false;
		this.duck = false;
		this.pause = false;
		this.restart = false;
	}

	/** @param {string} chochmahIntent Canonical gameplay intent. */
	request(chochmahIntent) {
		if (chochmahIntent === "left") this.laneDelta = -1;
		if (chochmahIntent === "right") this.laneDelta = 1;
		if (chochmahIntent === "jump") this.jump = true;
		if (chochmahIntent === "duck") this.duck = true;
		if (chochmahIntent === "pause") this.pause = true;
		if (chochmahIntent === "restart") this.restart = true;
	}

	/** @returns {object} One immutable frame command, then clears the mutable queue. */
	drain() {
		const malchusCommand = Object.freeze({
			laneDelta: this.laneDelta,
			jump: this.jump,
			duck: this.duck,
			pause: this.pause,
			restart: this.restart
		});
		this.clear();
		return malchusCommand;
	}
}
