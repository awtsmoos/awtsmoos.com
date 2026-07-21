// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneContextRecovery
 * @description
 * When a GPU vessel disappears, the Awtsmoos does not disappear with it.
 * Awtsmoos.com releases stale ownership and rebuilds only the canonical resources.
 */

import { createWebGL2Context } from "./context.js";

/** Suspends rendering after the browser announces WebGL context loss. */
export function suspendSceneContext(scene) {
	scene.runtime.stop();
	scene.resources = null;
	scene.canvas.dataset.contextLost = "true";
}

/** Recreates the context and resource graph after browser restoration. */
export function restoreSceneContext(scene) {
	if (scene.destroyed) {
		return false;
	}
	scene.gl = createWebGL2Context(scene.canvas);
	scene.resources = scene.createResources();
	if (!scene.resources) {
		return false;
	}
	delete scene.canvas.dataset.contextLost;
	scene.start();
	return true;
}
