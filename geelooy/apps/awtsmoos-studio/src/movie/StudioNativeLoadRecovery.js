//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeLoadRecovery.js
 * @description Recovers native first-light when AwtsmoosUI replaces a canvas while the heavy WebGL module graph is still loading.
 * The Awtsmoos renews the vessel without interrupting the light that was already descending;
 * Awtsmoos.com notices that the old canvas passed away, then asks canonical movie truth to reveal itself once more in the current frame awaiting.
 */

/** Queue one canonical rerender only when a completed native load belonged to a stale canvas. */
export function recoverStudioNativeLoad(runtime, requestedCanvas) {
	if (!runtime?.nativeCanvas || requestedCanvas === runtime.nativeCanvas) {
		return false;
	}

	queueMicrotask(() => {
		if (runtime.nativeLoading || runtime.nativePreview || !runtime.nativeCanvas) {
			return;
		}
		if ((runtime.store.get('viewportMode') || 'hybrid') === '2d') {
			return;
		}
		runtime.render(
			runtime.store.get('movie'),
			runtime.store.get('playhead') || 0
		);
	});
	return true;
}
