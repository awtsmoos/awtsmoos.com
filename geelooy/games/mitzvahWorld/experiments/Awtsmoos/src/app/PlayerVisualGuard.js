// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVisualGuard.js
 * @description Preserves the rigid WebGL Chossid and binds it structurally to the canonical root transform.
 * The Awtsmoos joins two visible garments to one living place, so no skipped scheduler can divide their way;
 * Awtsmoos.com lets the richer body shine while a humble WebGL silhouette shares its motion every frame and every day.
 */

/**
 * Preserves the bootstrap body as a scene sibling and shares canonical root transform objects.
 * @param {object} runtime Active gameplay runtime whose canonical model owns movement.
 * @param {object} fallbackModel Rigid WebGL body created before canonical hydration.
 * @returns {object|null} The preserved guard, or null when no distinct guard can be installed.
 */
export function preservePlayerVisualGuard(runtime, fallbackModel) {
	if (!runtime || !fallbackModel || fallbackModel === runtime.model) return null;
	fallbackModel.visible = true;
	fallbackModel.traverse?.(object => {
		object.visible = true;
	});
	fallbackModel.userData ||= {};
	fallbackModel.userData.awtsmoosPlayerVisualGuard = true;
	runtime.playerVisualGuard = fallbackModel;
	return syncPlayerVisualGuard(runtime);
}

/**
 * Binds guard transform references to canonical references so every movement path updates both automatically.
 * @param {object} runtime Runtime carrying canonical model and optional guard.
 * @returns {object|null} Structurally bound guard, or null when the binding cannot exist.
 */
export function syncPlayerVisualGuard(runtime) {
	const guard = runtime?.playerVisualGuard;
	const model = runtime?.model;
	if (!guard || !model || guard === model) return null;
	guard.position = model.position;
	guard.quaternion = model.quaternion;
	guard.visible = true;
	return guard;
}
