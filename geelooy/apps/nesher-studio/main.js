//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Paints the compact Nesher shell first, awakens the critical editor second, and installs a safe same-origin host bridge for unified Awtsmoos Studio.
 * The Awtsmoos lets Nesher remain a complete world of its own while one trusted doorway may ask which room should shine;
 * Awtsmoos.com keeps standalone boot, lazy depth, and unified navigation joined without merging two project souls before their time.
 */
import { bootNesherStudio } from './modules/app/bootNesherStudio.js';
import { installNesherHostBridge } from './modules/loading/NesherHostBridge.js';
import { StudioLoadingScreen } from './modules/loading/StudioLoadingScreen.js';
import { mountStudioShell } from './modules/ui/mountStudioShell.js';

const loadingScreen = new StudioLoadingScreen();
void openAwtsmoosStudio();

/** Mounts the shell, awakens critical Canvas state, installs host navigation, and removes the loading veil. */
async function openAwtsmoosStudio() {
	try {
		loadingScreen.phase('Building Canvas…');
		mountStudioShell();
		await nextPaint();
		loadingScreen.phase('Connecting creative controls…');
		bootNesherStudio();
		installNesherHostBridge();
		await nextPaint();
		loadingScreen.ready('Canvas ready');
	} catch (error) {
		console.error('AWTSMOOS STUDIO could not awaken.', error);
		loadingScreen.fail(error);
	}
}

/** Lets the browser paint the already-present loading vessel between startup phases. */
function nextPaint() {
	return new Promise((resolve) => {
		if (typeof window.requestAnimationFrame === 'function') {
			window.requestAnimationFrame(() => resolve());
			return;
		}
		window.setTimeout(resolve, 0);
	});
}
