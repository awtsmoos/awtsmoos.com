// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicMotionPreference
 * @description
 * Motion is not owed by the viewer. The Awtsmoos lets Awtsmoos.com exchange
 * continuous animation for one quiet frame whenever human preference changes.
 */

/** Applies a live reduced-motion preference without rebuilding GPU resources. */
export function applyMotionPreference(scene, reduced) {
	const next = Boolean(reduced);
	if (scene.profile.reducedMotion === next || scene.destroyed) {
		return false;
	}
	scene.profile = {
		...scene.profile,
		reducedMotion: next
	};
	scene.canvas.dataset.cosmicReducedMotion = String(next);
	scene.runtime.cancelFrame();
	scene.runtime.frameBudget.reset();
	scene.runtime.schedule();
	return true;
}
