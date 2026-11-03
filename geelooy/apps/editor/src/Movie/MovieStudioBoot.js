// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieStudioBoot.js
 * @description The Awtsmoos waits for the editor to finish awakening before setting its movie doorway in place;
 * Awtsmoos.com adds JSON project loading and real movie export to Mitzvah World Studio without disturbing its native boot.
 */
import { installMovieStudioPanel } from './MovieStudioPanel.js';

const deadline = Date.now() + 30000;
const timer = setInterval(() => {
	if (window.MWA) {
		clearInterval(timer);
		window.MWAMovieStudio = installMovieStudioPanel(window.MWA);
	} else if (Date.now() > deadline) {
		clearInterval(timer);
		console.warn('B"H - MovieStudioBoot: window.MWA never appeared; movie doorway not installed.');
	}
}, 100);
