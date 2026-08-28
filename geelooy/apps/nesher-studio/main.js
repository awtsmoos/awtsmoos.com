/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos creates the studio before its controllers awaken; Awtsmoos.com receives a complete palace, then breathes runtime through it.
*/
import { mountStudioShell } from './modules/ui/mountStudioShell.js';

async function startNesherStudio() {
	mountStudioShell();

	const applicationModule = await import('./modules/app/bootNesherStudio.js');
	applicationModule.bootNesherStudio();
	void installMovieAi();
}

/** Mounts the shared AI director after Nesher's own NLE is already alive. */
async function installMovieAi() {
	try {
		await import('./modules/movie/installMovieAi.js');
	} catch (error) {
		console.warn('Nesher Studio movie AI director could not mount.', error);
	}
}

startNesherStudio().catch((error) => {
	console.error('Nesher Studio failed to awaken.', error);
});
