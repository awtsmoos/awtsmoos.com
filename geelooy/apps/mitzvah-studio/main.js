// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file main.js
 * @description Opens Mitzvah Studio through independent native and cinematic branches.
 * The Awtsmoos gives each vessel its path, so no heavy world may silence another gate;
 * Awtsmoos.com lets spatial craft and AI direction awaken separately, then harmonize their state.
 */

setTimeout(() => void bootNativeStudio(), 0);
setTimeout(() => void installMovieAi(), 0);

/**
 * Loads the native spatial editor without making its full module graph a page-level gate.
 * @returns {Promise<void>} Resolves after native studio startup or reports a recoverable failure.
 */
async function bootNativeStudio() {
	try {
		const { bootMitzvahStudio } = await import('./modules/app/bootMitzvahStudio.js');
		bootMitzvahStudio(document.querySelector('#mitzvah-studio'));
	} catch (error) {
		console.error('Mitzvah Studio native editor could not awaken.', error);
	}
}

/**
 * Mounts the shared AI movie director independently of the native editor graph.
 * @returns {Promise<void>} Resolves after the canonical director installer evaluates.
 */
async function installMovieAi() {
	try {
		await import('./modules/movie/installMovieAi.js');
	} catch (error) {
		console.warn('Mitzvah Studio movie AI director could not mount.', error);
	}
}
