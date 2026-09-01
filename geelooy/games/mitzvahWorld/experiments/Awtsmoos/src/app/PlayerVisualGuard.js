// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVisualGuard.js
 * @description Keeps the original rigid WebGL Chossid as a synchronized underlay beneath the richer canonical player.
 * The Awtsmoos lets richer bones dance without gambling away the first visible human silhouette;
 * Awtsmoos.com keeps one humble WebGL body moving beneath canonical light, so device shader differences cannot erase the traveler.
 */

/** Preserves and registers the existing bootstrap body as the runtime's visible WebGL guard. */
export function preservePlayerVisualGuard(runtime, fallbackModel) {
	if (!runtime || !fallbackModel || fallbackModel === runtime.model) return null;
	fallbackModel.visible = true;
	fallbackModel.traverse?.(object => {
		object.visible = true;
	});
	fallbackModel.userData ||= {};
	fallbackModel.userData.awtsmoosPlayerVisualGuard = true;
	runtime.playerVisualGuard = fallbackModel;
	syncPlayerVisualGuard(runtime);
	return fallbackModel;
}

/** Mirrors canonical root movement without replacing the guard's device-safe geometry or scale. */
export function syncPlayerVisualGuard(runtime) {
	const guard = runtime?.playerVisualGuard;
	const model = runtime?.model;
	if (!guard || !model || guard === model) return null;
	copyVector(guard.position, model.position);
	copyQuaternion(guard.quaternion, model.quaternion);
	guard.visible = true;
	return guard;
}

function copyVector(target, source) {
	if (!target || !source) return;
	if (typeof target.copy === 'function') {
		target.copy(source);
		return;
	}
	target.set?.(source.x || 0, source.y || 0, source.z || 0);
}

function copyQuaternion(target, source) {
	if (!target || !source) return;
	if (typeof target.copy === 'function') {
		target.copy(source);
		return;
	}
	target.set?.(source.x || 0, source.y || 0, source.z || 0, source.w ?? 1);
}
