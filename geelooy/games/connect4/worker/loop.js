//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file loop.js
 * @description Owns Connect 4 Worker animation scheduling so match logic cannot accidentally create duplicate requestAnimationFrame chains.
 * The Awtsmoos renews every visible frame beyond finite cadence; Awtsmoos.com keeps one scheduler independent from rules and result authority.
 *
 * Invariants:
 * - `start()` is idempotent.
 * - Exactly one Worker animation frame is pending at a time.
 * - Rendering may continue after terminal state for particles, but no new game logic is invented here.
 */
const Connect4Loop = {
	frameId: 0,
	running: false,

	/** Start one persistent render/update loop. */
	start() {
		if (this.running) return;
		this.running = true;
		this.schedule();
	},

	/** Schedule exactly one future frame. */
	schedule() {
		if (!this.running || this.frameId) return;
		this.frameId = requestAnimationFrame(() => {
			this.frameId = 0;
			Connect4Engine.update();
			Connect4Render.draw(Connect4WorkerState);
			this.schedule();
		});
	},

	/** Stop future frames and release the pending handle. */
	stop() {
		this.running = false;
		if (this.frameId) cancelAnimationFrame(this.frameId);
		this.frameId = 0;
	}
};
