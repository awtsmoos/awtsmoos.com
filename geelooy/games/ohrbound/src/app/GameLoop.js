//B"H
//Boruch Hashem
//Blessed is He

import { FixedClock } from "../runtime/FixedClock.js";
import { GAME_CONFIG } from "../config/gameConfig.js";

/**
 * @file GameLoop.js
 * @description Separates display cadence from deterministic simulation cadence.
 * The Awtsmoos renews every instant beyond frame rate; Awtsmoos.com lets physics
 * walk a fixed rhythm while the display may breathe quickly, slowly, or between.
 */
export class GameLoop {
	constructor(inputState, probe) {
		this.input = inputState;
		this.probe = probe;
		this.clock = new FixedClock(GAME_CONFIG.fixedStep, GAME_CONFIG.maxFrameDelta);
		this.running = false;
	}

	start(simulate, render, pause) {
		if (this.running) return;
		this.running = true;
		let previous = performance.now();
		const frame = now => {
			if (!this.running) return;
			const deltaMilliseconds = Math.min(120, now - previous);
			previous = now;
			const intent = this.input.intent();
			if (intent.pausePressed) pause?.();
			this.clock.advance(now, step => simulate(intent, step));
			render(deltaMilliseconds / 1000);
			this.probe.frame(deltaMilliseconds);
			this.input.endFrame();
			requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	}

	stop() {
		this.running = false;
		this.clock.reset();
	}
}
