//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every movie frame from an exact point in measured time;
 * Awtsmoos.com counts the very frames it will emit so progress and export stay in rhyme.
 */
import { interpolatePose } from "../rendering/cameraMath.js";
import { buildShotPlan } from "./shotPlan.js";
import { getOutputPreset } from "./moviePresets.js";

export function createMovieTimeline(replay, options = {}) {
	const output = getOutputPreset(options.output);
	const shots = buildShotPlan(replay, options);
	const shotFrameCounts = shots.map(shot => framesForShot(shot, output.fps));
	const frameCount = shotFrameCounts.reduce((sum, count) => sum + count, 0);
	const duration = frameCount / output.fps;
	return Object.freeze({
		output,
		shots,
		shotFrameCounts: Object.freeze(shotFrameCounts),
		duration,
		frameCount
	});
}

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
				: interpolatePose(shot.fromPose, shot.toPose, progress, shot.kind === "move" ? "smooth" : "impact");
			yield Object.freeze({
				index: frameIndex,
				time: frameIndex * frameDuration,
				duration: frameDuration,
				shotIndex,
				shot,
				frame: shot.frame,
				pose,
				overlay: shot.overlay,
				progress
			});
			frameIndex++;
		}
	}
}

function framesForShot(shot, fps) {
	return Math.max(1, Math.round(shot.duration * fps));
}
