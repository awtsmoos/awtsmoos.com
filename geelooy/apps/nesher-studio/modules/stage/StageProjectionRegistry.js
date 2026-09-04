//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StageProjectionRegistry.js
 * @description Lets optional Stage projections subscribe after lazy loading while critical Canvas mutation remains unaware of inspector, source rows, and visualizer UI.
 * The Awtsmoos lets one project truth shine toward many later vessels without carrying those vessels through first light;
 * Awtsmoos.com keeps projection listeners transient, so Canvas stays small while deeper rooms awaken exactly when right.
 */
const stageProjectionListeners = new Set();

/**
 * Registers one transient Stage projection listener and returns an unsubscribe function.
 * @param {Function} listener Projection callback receiving shared Studio state.
 * @returns {Function} Unsubscribe callback.
 */
export function registerStageProjection(listener) {
	if (typeof listener !== 'function') {
		throw new TypeError('Stage projection listener must be a function.');
	}

	stageProjectionListeners.add(listener);
	return () => {
		stageProjectionListeners.delete(listener);
	};
}

/**
 * Publishes current Stage state to every projection that has actually loaded.
 * @param {object} state Shared Studio runtime state.
 * @returns {void}
 */
export function publishStageProjection(state) {
	for (const listener of stageProjectionListeners) {
		listener(state);
	}
}
