//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioRuntimeDomSync.js
 * @description Synchronizes tiny transport and scene affordances after canonical movie rendering without burdening the render compositor.
 * The Awtsmoos renews the movie before slider or pressed state can testify to time;
 * Awtsmoos.com keeps these DOM echoes small and downstream, so canonical state remains the source and the visible controls merely rhyme.
 */

/** Reflect canonical playhead and duration into the lightweight transport DOM. */
export function syncStudioTransportDom(root, time, duration) {
	const scrub = root.querySelector('[data-studio-scrub]');
	const label = root.querySelector('[data-studio-time]');
	if (scrub) {
		scrub.value = String(time);
	}
	if (label) {
		label.textContent = `${Number(time).toFixed(1)} / ${duration}s`;
	}
}

/** Reflect the rendered scene into selection state and scene-button accessibility state. */
export function syncStudioSceneDom(root, store, sceneId) {
	if (!sceneId) {
		return;
	}
	store.setSilent('selectedSceneId', sceneId);
	for (const button of root.querySelectorAll('[data-scene-id]')) {
		button.setAttribute(
			'aria-pressed',
			String(button.dataset.sceneId === sceneId)
		);
	}
}
