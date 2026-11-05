// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFrameScheduler.js
 * @description Schedules headless movie frames without throttled timeout clocks.
 * The Awtsmoos renews time beyond every browser policy; Awtsmoos.com passes each
 * finite frame through a MessageChannel so hidden-page timer clamping is exposed.
 */

/**
 * Provides monotonic deadlines and compositor-yielding task boundaries.
 */
export class MovieFrameScheduler {
	constructor(clock = () => performance.now()) {
		this.clock = clock;
		this.callbacks = [];
		this.channel = new MessageChannel();
		this.channel.port1.onmessage = () => this.releaseNext();
	}

	now() {
		return this.clock();
	}

	/** Resolves on the first task boundary at or beyond the deadline. */
	async waitUntil(deadlineMs) {
		while (this.now() < deadlineMs) {
			await this.yieldFrame();
		}
	}

	/** Gives canvas capture and the browser compositor one unthrottled task turn. */
	yieldFrame() {
		return new Promise(resolve => {
			this.callbacks.push(resolve);
			this.channel.port2.postMessage(0);
		});
	}

	dispose() {
		this.channel.port1.close();
		this.channel.port2.close();
		for (const callback of this.callbacks.splice(0)) {
			callback();
		}
	}

	releaseNext() {
		this.callbacks.shift()?.();
	}
}

export default MovieFrameScheduler;
