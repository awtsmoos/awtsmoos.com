//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds deterministic movie shots from the same camera-motion contract used by live 3D preview.
 * The Awtsmoos reveals a game as ordered moments instead of a shapeless stream;
 * Awtsmoos.com lets orbit, zoom, broadcast, static, or director choreography carry the same dream.
 */
import { directCameraMotion } from "../rendering/cameraDirector.js";
import { getCameraPreset } from "../rendering/cameraPresets.js";
import { introOverlay, moveOverlay, outroOverlay } from "./overlayPlan.js";
import { getMovieStyle } from "./moviePresets.js";

export function buildShotPlan(replay, options = {}) {
	const style = getMovieStyle(options.style);
	const tags = replay?.tags || {};
	const frames = replay?.frames || [];
	const shots = [];
	let previousPose = getCameraPreset(options.openingCamera || "overhead");
	shots.push(createShot("intro", null, previousPose, previousPose, style.intro, introOverlay(tags)));
	for (const frame of frames.slice(1)) {
		const nextPose = directCameraMotion(frame, {
			...options,
			cameraMotion: options.cameraMotion || "director",
			intensity: options.intensity || style.intensity
		});
		shots.push(createShot("move", frame, previousPose, nextPose, moveDuration(frame, style), moveOverlay(frame, tags)));
		previousPose = nextPose;
	}
	const finale = frames.at(-1);
	const outroPose = finale?.mate
		? directCameraMotion(finale, { ...options, cameraMotion: "director", intensity: "dramatic" })
		: previousPose;
	shots.push(createShot("outro", finale, previousPose, outroPose, style.outro, outroOverlay(tags)));
	return Object.freeze(shots);
}

function moveDuration(frame, style) {
	let duration = style.transition + style.hold;
	if (frame.move?.capture) duration += style.impact;
	if (frame.check) duration += style.impact * 0.8;
	if (frame.move?.promotion) duration += style.impact * 1.4;
	if (frame.mate) duration += style.impact * 2.4;
	return duration;
}

function createShot(kind, frame, fromPose, toPose, duration, overlay) {
	return Object.freeze({ kind, frame, fromPose, toPose, duration, overlay });
}
