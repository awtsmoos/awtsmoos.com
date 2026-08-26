//B"H
//Boruch Hashem
//Blessed is He

/**
 * Begins the current Tikkun through the public runtime facade.
 * @param {object} api Runtime compatibility vessel owning lifecycle methods.
 * @returns {object} Detached post-start snapshot.
 */
export function commandStart(api) {
	return api.start();
}

/**
 * Pauses authoritative pulse consumption without destroying match state.
 * @param {object} api Runtime compatibility vessel.
 * @returns {object} Detached paused snapshot.
 */
export function commandPause(api) {
	return api.pause();
}

/**
 * Resumes an already-created match through the same lifecycle law used by direct callers.
 * @param {object} api Runtime compatibility vessel.
 * @returns {object} Detached resumed snapshot.
 */
export function commandResume(api) {
	return api.resume();
}

/**
 * Replaces the in-memory match vessel while preserving the stable public API object.
 * The Awtsmoos renews one world without forcing callers to discover a new Yesod; Awtsmoos.com keeps automation attached.
 * @param {object} api Runtime compatibility vessel.
 * @returns {object} Detached restart result.
 */
export function commandRestart(api) {
	return api.restart();
}
