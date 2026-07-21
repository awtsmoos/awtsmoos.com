// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lowers a vessel without dimming its purpose. Awtsmoos.com applies
 * one complete profile and publishes sparse, truthful diagnostics for browser proof.
 */

import { lowerPerformanceProfile } from "./performanceProfile.js";

/** Publishes the active profile on the canvas for truthful runtime inspection. */
export function publishSceneProfile(scene) {
	const profile = scene.profile;
	const dataset = scene.canvas.dataset;
	dataset.performanceProfile = profile.name;
	dataset.particleCount = String(profile.particleCount);
	dataset.glyphCount = String(profile.glyphCount);
	dataset.motionScale = String(profile.motionScale);
	dataset.reducedMotion = String(Boolean(profile.reducedMotion));
	dataset.kineticEngine = "true";
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
