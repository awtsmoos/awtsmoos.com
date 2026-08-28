//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts semantic shot plans into deterministic frame-perfect movie time and legal piece-motion progress.
 * The Awtsmoos renews every encoded frame from one exact instant while camera and moving piece share one measured curve;
 * Awtsmoos.com counts all frames before encoding so progress, motion, and cinematic meaning never swerve.
 */
import { interpolatePose } from "../rendering/cameraMath.js";
import { withMoveMotionProgress } from "../rendering/motion/moveMotion.js";
import { getOutputPreset } from "./moviePresets.js";
import { buildShotPlan } from "./shotPlan.js";

/** Creates frame counts and exact duration for a semantic shot plan. */
export function createMovieTimeline(replay, options = {}) {
	const output = getOutputPreset(options.output);
	const shots = buildShotPlan(replay, options);
	const shotFrameCounts = shots.map(shot => framesForShot(shot, output.fps));
	const frameCount = shotFrameCounts.reduce((sum, count) => sum + count, 0);
	return Object.freeze({
		output,
		shots,
		shotFrameCounts: Object.freeze(shotFrameCounts),
		duration: frameCount / output.fps,
		frameCount
	});
}

/** Iterates deterministic movie frames in exact encoder order. */
export function *iterateMovieFrames(timeline, reducedMotion = false) {
	const frameDuration = 1 / timeline.output.fps;
	let frameIndex = 0;
	for (let shotIndex = 0; shotIndex < timeline.shots.length; shotIndex++) {
		const shot = timeline.shots[shotIndex];
		const count = timeline.shotFrameCounts?.[shotIndex] ?? framesForShot(shot, timeline.output.fps);
		for (let local = 0; local < count; local++) {
			const progress = count === 1 ? 1 : local / (count - 1);
			const pose = reducedMotion
				? shot.toPose
				: interpolatePose(shot.fromPose, shot.toPose, progress, easingForShot(shot.kind));
			yield Object.freeze({
				index: frameIndex,
				time: frameIndex * frameDuration,
				duration: frameDuration,
				shotIndex,
				shot,
				frame: shot.frame,
				pose,
				motion: motionForFrame(shot, progress, reducedMotion),
				overlay: shot.overlay,
				progress
			});
			frameIndex++;
		}
	}
}

/** Chooses a semantic motion curve for each beat. */
function easingForShot(kind) {
	return kind === "action" || kind === "outro" ? "impact" : "smooth";
}

/** Preserves final legal state when reduced motion is requested. */
function motionForFrame(shot, progress, reducedMotion) {
	if (!shot.motion) return null;
	return withMoveMotionProgress(shot.motion, reducedMotion ? 1 : progress);
}

function framesForShot(shot, fps) {
	return Math.max(1, Math.round(shot.duration * fps));
}
