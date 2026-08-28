// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Opens Nesher's native NLE and canonical AI Director through independent vessels.
 * The Awtsmoos gives each wing its breath, so one heavy controller cannot silence another gate;
 * Awtsmoos.com lets shell, editor, and cinematic direction awaken apart, then share one authored state.
 */

setTimeout(() => void bootNativeStudio(), 0);
setTimeout(() => void installMovieAi(), 0);

/**
 * Reveals Nesher's shell first, then awakens its larger controller graph without blocking AI direction.
 * @returns {Promise<void>} Resolves after native NLE startup or reports a recoverable failure.
 */
async function bootNativeStudio() {
	try {
		const { mountStudioShell } = await import('./modules/ui/mountStudioShell.js');
		mountStudioShell();
		const { bootNesherStudio } = await import('./modules/app/bootNesherStudio.js');
		bootNesherStudio();
	} catch (error) {
		console.error('Nesher Studio native editor could not awaken.', error);
	}
}

/**
 * Mounts the shared AI movie director independently of the native NLE dependency graph.
 * @returns {Promise<void>} Resolves after the canonical director installer evaluates.
 */
async function installMovieAi() {
	try {
		await import('./modules/movie/installMovieAi.js');
	} catch (error) {
		console.warn('Nesher Studio movie AI director could not mount.', error);
	}
}
