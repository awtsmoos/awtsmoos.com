//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts semantic shot plans into deterministic frame-perfect movie time while carrying output aspect into direction.
 * The Awtsmoos renews every encoded instant while camera and moving piece share one lawful measured curve;
 * Awtsmoos.com lets portrait, square, and landscape inherit the same legal motion truth without making timing swerve.
 */
import { interpolatePose } from "../rendering/cameraMath.js";
import { withMoveMotionProgress } from "../rendering/motion/moveMotion.js";
import { buildShotPlan } from "./shotPlan.js";
import { getMovieOutput } from "./moviePresets.js";

/** Creates exact shot frame counts and passes the selected output aspect to the semantic director. */
export function createMovieTimeline(replay, options = {}) {
	const output = getMovieOutput(options.output);
	const aspectRatio = output.width / output.height;
	const shots = buildShotPlan(replay, { ...options, aspectRatio });
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

function easingForShot(kind) {
	return kind === "action" || kind === "outro" ? "impact" : "smooth";
}

function motionForFrame(shot, progress, reducedMotion) {
	if (!shot.motion) return null;
	return withMoveMotionProgress(shot.motion, reducedMotion ? 1 : progress);
}

function framesForShot(shot, fps) {
	return Math.max(1, Math.round(shot.duration * fps));
}
