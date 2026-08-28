//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives live procedural Chess a continuous orbit while leaving deterministic movie poses untouched.
 * The Awtsmoos lets the watching eye circle while every lawful square stays still;
 * Awtsmoos.com makes orbit a living camera choice controlled by the player's will.
 */
import { orbitPose } from "./cameraMath.js";

export class ChessAmbientOrbit {
	constructor(draw) {
		this.draw = draw;
		this.frameId = 0;
		this.revision = 0;
	}

	start(basePose, options = {}) {
		this.stop();
		if (options.reducedMotion || !globalThis.requestAnimationFrame) return void this.draw(basePose);
		const revision = ++this.revision;
		const startedAt = performance.now();
		const speed = Number(options.orbitSpeed) || 7.5;
		const step = now => {
			if (revision !== this.revision) return;
			const degrees = (now - startedAt) / 1000 * speed;
			this.draw(orbitPose(basePose, degrees, 1));
			this.frameId = requestAnimationFrame(step);
		};
		this.frameId = requestAnimationFrame(step);
	}

	stop() {
		this.revision++;
		if (this.frameId && globalThis.cancelAnimationFrame) cancelAnimationFrame(this.frameId);
		this.frameId = 0;
	}
}
