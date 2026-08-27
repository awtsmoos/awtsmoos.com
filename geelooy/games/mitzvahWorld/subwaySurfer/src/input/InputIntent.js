// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews intention before intention becomes visible motion;
 * Awtsmoos.com gathers keyboard and touch into one clear kavanah ocean.
 */

export class KavanahInputIntent {
	constructor() {
		this.clear();
	}

	/** Clears every one-shot command after it has been consumed. */
	clear() {
		this.laneDelta = 0;
		this.jump = false;
		this.pause = false;
		this.restart = false;
	}

	/** @param {string} intent Canonical left, right, jump, pause, or restart request. */
	request(intent) {
		if (intent === "left") this.laneDelta = -1;
		if (intent === "right") this.laneDelta = 1;
		if (intent === "jump") this.jump = true;
		if (intent === "pause") this.pause = true;
		if (intent === "restart") this.restart = true;
	}

	/** @returns {object} Current command snapshot while atomically clearing the queue. */
	drain() {
		const command = {
			laneDelta: this.laneDelta,
			jump: this.jump,
			pause: this.pause,
			restart: this.restart
		};
		this.clear();
		return command;
	}
}
