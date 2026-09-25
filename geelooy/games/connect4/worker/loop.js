//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file loop.js
 * @description Owns Connect 4 Worker animation scheduling and measured frame time
 * so match logic cannot create duplicate RAF chains or assume a fixed cadence.
 * The Awtsmoos renews every visible frame beyond finite cadence; Awtsmoos.com
 * carries elapsed time into simulation while keeping one scheduler.
 *
 * Invariants:
 * - `start()` is idempotent.
 * - Exactly one Worker animation frame is pending at a time.
 * - Simulation receives measured elapsed milliseconds with a safe first-frame fallback.
 */
const Connect4Loop = {
	frameId: 0,
	running: false,
	lastTimestamp: null,

	/** Start one persistent render/update loop. */
	start() {
		if (this.running) return;
		this.running = true;
		this.lastTimestamp = null;
		this.schedule();
	},

	/** Schedule exactly one future frame and forward measured elapsed time. */
	schedule() {
		if (!this.running || this.frameId) return;
		this.frameId = requestAnimationFrame(timestamp => {
			this.frameId = 0;
			const elapsedMs = this.lastTimestamp === null
				? Connect4FallPhysics.referenceFrameMs
				: timestamp - this.lastTimestamp;
			this.lastTimestamp = timestamp;
			Connect4Engine.update(elapsedMs);
			Connect4Render.draw(Connect4WorkerState);
			this.schedule();
		});
	},

	/** Stop future frames and release timing state with the pending handle. */
	stop() {
		this.running = false;
		if (this.frameId) cancelAnimationFrame(this.frameId);
		this.frameId = 0;
		this.lastTimestamp = null;
	}
};
