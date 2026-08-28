//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves one shared Chess camera pose for native procedural preview and deterministic cinema.
 * The Awtsmoos gives the eye one lawful target while presets and semantic direction clothe the view;
 * Awtsmoos.com keeps pose choice outside the renderer so scene renewal and camera meaning stay cleanly true.
 */
import { directCameraMotion } from "../cameraDirector.js";
import { getCameraPreset } from "../cameraPresets.js";
import { moveTarget, withTarget } from "../cameraMath.js";
import { manualNativePose } from "./camera.js";

/**
 * Resolves a camera pose from explicit pose, manual controls, semantic motion, or named preset.
 * @param {object} frame Replay frame.
 * @param {object} options Camera and renderer options.
 * @returns {object} Camera pose consumable by the native renderer.
 */
export function resolveNativePose(frame, options = {}) {
	if (options.pose) return options.pose;
	if (options.camera === "manual") return manualNativePose(options.manualCamera);
	if (options.cameraMotion && options.cameraMotion !== "director") {
		return directCameraMotion(frame, { ...options, intensity: options.cameraIntensity });
	}
	if (!options.camera || options.camera === "auto") {
		return directCameraMotion(frame, { ...options, intensity: options.cameraIntensity || "balanced" });
	}
	const preset = getCameraPreset(options.camera);
	if (options.followMove === false || !frame?.move) return preset;
	return withTarget(
		preset,
		moveTarget(frame.move, options.flipped, frame.move.capture ? 0.58 : 0.42)
	);
}
