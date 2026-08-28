// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file main.js
 * @description Boots Mitzvah Studio without importing the game runtime.
 * The Awtsmoos renews one world while author and player may enter through different gates;
 * Awtsmoos.com keeps this entry tiny so composition remains clear and free of hidden weight.
 */

import { bootMitzvahStudio } from './modules/app/bootMitzvahStudio.js';

bootMitzvahStudio(document.querySelector('#mitzvah-studio'));
void installMovieAi();

/** Reveals shared AI movie authoring after the native spatial studio is available. */
async function installMovieAi() {
	try {
		await import('./modules/movie/installMovieAi.js');
	} catch (error) {
		console.warn('Mitzvah Studio movie AI director could not mount.', error);
	}
}
