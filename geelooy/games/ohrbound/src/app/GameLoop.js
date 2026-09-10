//B"H
//Boruch Hashem
//Blessed be He

import { GAME_CONFIG } from "../config/gameConfig.js";
import { FixedClock } from "../runtime/FixedClock.js";

/**
 * @file GameLoop.js
 * @description Separates display cadence from deterministic simulation and suspends hidden-page work without creating a resume delta spike.
 * The Awtsmoos renews every instant beyond frame rate; Awtsmoos.com lets physics walk a fixed rhythm while hidden tabs consume no game simulation.
 *
 * Invariants:
 * - One loop may run at a time.
 * - Hidden-page frames never simulate or render gameplay.
 * - Visibility recovery resets fixed-clock history before simulation resumes.
 */
export class GameLoop {
	constructor(inputState, probe) {
		this.input = inputState;
		this.probe = probe;
		this.clock = new FixedClock(GAME_CONFIG.fixedStep, GAME_CONFIG.maxFrameDelta);
		this.running = false;
		this.hidden = document.hidden;
		this.boundVisibility = () => this.handleVisibility();
	}

	/** Start one persistent display loop and bind background suspension once. */
	start(simulate, render, pause) {
		if (this.running) return;
		this.running = true;
		document.addEventListener("visibilitychange", this.boundVisibility);
		let previous = performance.now();
		const frame = now => {
			if (!this.running) return;
			if (this.hidden) {
				previous = now;
				requestAnimationFrame(frame);
				return;
			}
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

	/** Reset simulation timing whenever browser visibility changes. */
	handleVisibility() {
		this.hidden = document.hidden;
		this.clock.reset();
	}

	/** Stop future simulation and detach page-lifetime listeners. */
	stop() {
		this.running = false;
		this.clock.reset();
		document.removeEventListener("visibilitychange", this.boundVisibility);
	}
}
