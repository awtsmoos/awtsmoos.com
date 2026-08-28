//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Moves any Chess camera pose smoothly while guaranteeing the final requested view.
 * The Awtsmoos renews the eye through measured time while destination stays true;
 * Awtsmoos.com keeps animation independent of whichever native renderer receives the view.
 */
import { interpolatePose } from "./cameraMath.js";

export class ChessCameraTween {
	constructor(draw) {
		this.draw = draw;
		this.current = null;
		this.frameId = 0;
		this.watchdogId = 0;
		this.revision = 0;
	}

	transition(target, reducedMotion = false) {
		this.cancel();
		const revision = ++this.revision;
		if (!this.current || reducedMotion || !globalThis.requestAnimationFrame) return void this.commit(target);
		const from = this.current;
		const start = performance.now();
		const duration = Math.max(80, Number(target.duration || 0.65) * 1000);
		const step = now => {
			if (revision !== this.revision) return;
			const progress = Math.min(1, (now - start) / duration);
			this.current = interpolatePose(from, target, progress, target.easing);
			this.draw(this.current);
			if (progress < 1) this.frameId = requestAnimationFrame(step);
			else this.finish(target, revision);
		};
		this.frameId = requestAnimationFrame(step);
		this.watchdogId = setTimeout(() => this.finish(target, revision), duration + 80);
	}

	commit(target) {
		this.current = target;
		this.draw(target);
	}

	finish(target, revision) {
		if (revision !== this.revision) return;
		this.cancelHandles();
		this.commit(target);
	}

	cancel() {
		this.revision++;
		this.cancelHandles();
	}

	cancelHandles() {
		if (this.frameId && globalThis.cancelAnimationFrame) cancelAnimationFrame(this.frameId);
		if (this.watchdogId) clearTimeout(this.watchdogId);
		this.frameId = 0;
		this.watchdogId = 0;
	}
}
