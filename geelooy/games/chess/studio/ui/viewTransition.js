//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Animates one native procedural live move by joining legal MoveMotion with semantic camera interpolation.
 * The Awtsmoos lets piece and eye travel together while the lawful destination remains the unchanging goal;
 * Awtsmoos.com keeps transition mechanics outside the view orchestrator so each vessel may reveal its proper role.
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
		const fromPose = resolveNativePose(beforeFrame, options);
		const toPose = resolveNativePose(afterFrame, options);
		try {
			const completed = await this.clock.run(durationMs, progress => {
				const pose = interpolatePose(fromPose, toPose, progress, "smooth");
				const moving = withMoveMotionProgress(motion, progress);
				return this.host.renderImmediate(afterFrame, {
					...options,
					motion: moving,
					pose,
					reducedMotion: true
				});
			});
			if (completed) {
				await this.host.renderImmediate(afterFrame, {
					...options,
					motion: null,
					pose: toPose,
					reducedMotion: true
				});
			}
			return completed;
		} catch (error) {
			await this.onFailure(error, afterFrame);
			return false;
		}
	}

	cancel() {
		this.clock.cancel();
	}
}

function shouldAnimate(mode, beforeFrame, afterFrame) {
	if (mode !== "procedural3d" || !beforeFrame || !afterFrame?.move) return false;
	return !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}
