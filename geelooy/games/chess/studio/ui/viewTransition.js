//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Animates one legal live move across canvas or native procedural renderers from a single shared MoveMotion truth.
 * The Awtsmoos lets piece and eye travel together while the lawful destination remains the unchanging goal;
 * Awtsmoos.com keeps 2D, 2.5D, and native 3D transitions in one vessel instead of teaching each renderer another soul.
 */
import { interpolatePose } from "../rendering/cameraMath.js";
import { ChessLiveTransition } from "../rendering/liveTransition.js";
import { createMoveMotion, withMoveMotionProgress } from "../rendering/motion/moveMotion.js";
import { resolveNativePose } from "../rendering/native/poseResolver.js";

export class ChessViewTransition {
	constructor(host, preferences, renderOptions, onFailure = async () => {}) {
		this.host = host;
		this.preferences = preferences;
		this.renderOptions = renderOptions;
		this.onFailure = onFailure;
		this.clock = new ChessLiveTransition();
	}

	async render(beforeFrame, afterFrame, durationMs) {
		if (!shouldAnimate(this.preferences.renderer, beforeFrame, afterFrame)) return false;
		const options = this.renderOptions();
		const motion = createMoveMotion(beforeFrame, afterFrame);
		const native = this.preferences.renderer === "procedural3d";
		const fromPose = native ? resolveNativePose(beforeFrame, options) : null;
		const toPose = native ? resolveNativePose(afterFrame, options) : null;
		try {
			const completed = await this.clock.run(durationMs, progress => {
				const pose = native ? interpolatePose(fromPose, toPose, progress, "smooth") : null;
				return this.host.renderImmediate(afterFrame, {
					...options,
					motion: withMoveMotionProgress(motion, progress),
					...(pose ? { pose } : {}),
					reducedMotion: true
				});
			});
			if (completed) await this.finish(afterFrame, options, toPose);
			return completed;
		} catch (error) {
			await this.onFailure(error, afterFrame);
			return false;
		}
	}

	async finish(frame, options, pose) {
		await this.host.renderImmediate(frame, { ...options, motion: null, ...(pose ? { pose } : {}), reducedMotion: true });
	}

	cancel() {
		this.clock.cancel();
	}
}

function shouldAnimate(mode, beforeFrame, afterFrame) {
	if (!beforeFrame || !afterFrame?.move) return false;
	if (!new Set(["canvas2d", "canvas25d", "procedural3d"]).has(mode)) return false;
	return !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}
