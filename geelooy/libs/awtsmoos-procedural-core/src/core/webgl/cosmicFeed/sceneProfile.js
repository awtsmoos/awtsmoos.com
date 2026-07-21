// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lowers a vessel without dimming its purpose. Awtsmoos.com applies
 * one complete profile to particles, glyphs, pixel ratio, motion, and diagnostics.
 */

import { lowerPerformanceProfile } from "./performanceProfile.js";

/** Publishes the active profile on the canvas for truthful runtime inspection. */
export function publishSceneProfile(scene) {
	const profile = scene.profile;
	scene.canvas.dataset.performanceProfile = profile.name;
	scene.canvas.dataset.particleCount = String(profile.particleCount);
	scene.canvas.dataset.glyphCount = String(profile.glyphCount);
	scene.canvas.dataset.motionScale = String(profile.motionScale);
	scene.canvas.dataset.kineticEngine = "true";
}

/** Lowers all expensive layers together and returns whether a change occurred. */
export function reduceSceneProfile(scene) {
	if (scene.profile.name === "lean") {
		return false;
	}
	scene.profile = lowerPerformanceProfile(scene.profile.name);
	scene.resources?.applyProfile(scene.profile);
	scene.resize();
	publishSceneProfile(scene);
	return true;
}
