//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds deterministic semantic movie shots from the same camera contract used by live native procedural preview.
 * The Awtsmoos reveals a game as ordered moments where anticipation, action, and consequence each receive their place;
 * Awtsmoos.com lets every important MoveEvent widen into cinematic grammar while quiet moves keep a swifter pace.
 */
import { directCameraMotion } from "../rendering/cameraDirector.js";
import { getCameraPreset } from "../rendering/cameraPresets.js";
import { introOverlay, outroOverlay } from "./overlayPlan.js";
import { getMovieStyle } from "./moviePresets.js";
import { appendSemanticMoveShots, createShot } from "./shotBeats.js";

/** Builds the complete deterministic shot plan for one replay. */
export function buildShotPlan(replay, options = {}) {
	const style = getMovieStyle(options.style);
	const tags = replay?.tags || {};
	const frames = replay?.frames || [];
	const shots = [];
	let previousPose = getCameraPreset(options.openingCamera || "overhead");
	shots.push(createShot("intro", null, previousPose, previousPose, style.intro, introOverlay(tags)));
	for (let index = 1; index < frames.length; index++) {
		const frame = frames[index];
		const nextPose = directCameraMotion(frame, {
			...options,
			cameraMotion: options.cameraMotion || "director",
			intensity: options.intensity || style.intensity
		});
		previousPose = appendSemanticMoveShots(shots, {
			frame,
			previousFrame: frames[index - 1],
			previousPose,
			nextPose,
			style,
			tags
		});
	}
	const finale = frames.at(-1) || null;
	const outroPose = finale?.mate
		? directCameraMotion(finale, { ...options, cameraMotion: "director", intensity: "dramatic" })
		: previousPose;
	shots.push(createShot("outro", finale, previousPose, outroPose, style.outro, outroOverlay(tags)));
	return Object.freeze(shots);
}
