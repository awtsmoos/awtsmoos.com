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
}

startNesherStudio().catch((error) => {
	console.error('Nesher Studio failed to awaken.', error);
});
