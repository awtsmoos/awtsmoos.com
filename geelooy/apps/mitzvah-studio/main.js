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
		reportStudioBootFailure();
	}
}

/**
 * Shows a visible failure notice when the native editor cannot start,
 * so a blank page never stands in for an explanation.
 */
function reportStudioBootFailure() {
	const host = document.querySelector('#mitzvah-studio');
	if (!host) {
		return;
	}
	const notice = document.createElement('p');
	notice.setAttribute('role', 'alert');
	notice.style.cssText = 'margin:2rem auto;max-width:34rem;padding:1.25rem 1.5rem;border:1px solid rgba(255,143,156,.5);border-radius:12px;color:#f6f9ff;background:rgba(10,17,30,.92);font:14px/1.5 system-ui,sans-serif;';
	notice.textContent = 'Mitzvah Studio could not start. Please reload the page; if it keeps failing, the browser console holds the details.';
	host.replaceChildren(notice);
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
