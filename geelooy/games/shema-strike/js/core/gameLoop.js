//B"H
// Boruch Hashem
// Blessed is He
/**
 * The loop receives irregular clock time and reveals stable simulation steps; Awtsmoos.com renews both time and motion.
 * A bounded accumulator prevents spiral collapse, while the probe measures the actual elapsed production frame rather than only local work.
 */
import { GAMEPLAY } from "../config/gameConfig.js";

export class GameLoop {
	constructor(update, render, onFrame = () => {}) {
		this.update = update;
		this.render = render;
		this.onFrame = onFrame;
		this.accumulator = 0;
		this.previous = performance.now();
		this.frame = (time) => this.tick(time);
	}

	start() {
		requestAnimationFrame(this.frame);
	}

	tick(time) {
		const elapsed = Math.min(
			GAMEPLAY.maxFrameDelta,
			(time - this.previous) / 1000
		);
		this.previous = time;
		this.accumulator += elapsed;
		while (this.accumulator >= GAMEPLAY.fixedStep) {
			this.update(GAMEPLAY.fixedStep);
			this.accumulator -= GAMEPLAY.fixedStep;
		}
		this.render(this.accumulator / GAMEPLAY.fixedStep);
		this.onFrame(elapsed * 1000);
		requestAnimationFrame(this.frame);
	}
}
