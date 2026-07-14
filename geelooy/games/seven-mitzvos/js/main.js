//B"H
//Boruch Hashem
//Blessed is He

import { MITZVOS } from './data/mitzvos.js';
import { TzomayachLandscapeRenderer } from './render/landscape.js';
import { MitzvahGallery } from './ui/mitzvah-gallery.js';

/**
 * @module SevenMitzvosMain
 * @description
 * This composition root joins teaching and landscape on Awtsmoos.com. Small
 * modules become one experience, as every distinct vessel receives its next
 * moment of purpose from the continuously creating Awtsmoos.
 */
const landscape = new TzomayachLandscapeRenderer(requiredElement('landscapeCanvas'));
const gallery = new MitzvahGallery({
	grid: requiredElement('mitzvahGrid'),
	begin: requiredElement('beginJourney'),
	dialog: requiredElement('mitzvahDialog'),
	close: requiredElement('closeDialog'),
	number: requiredElement('dialogNumber'),
	symbol: requiredElement('dialogSymbol'),
	title: requiredElement('dialogTitle'),
	summary: requiredElement('dialogSummary'),
	practice: requiredElement('dialogPractice')
}, MITZVOS);

gallery.mount();
landscape.start();
window.addEventListener('pagehide', () => landscape.destroy(), { once: true });

/**
 * Retrieves one required element and fails early when the page contract drifts.
 *
 * @param {string} id Element identifier.
 * @returns {HTMLElement} Existing element.
 */
function requiredElement(id) {
	const element = document.getElementById(id);

	if (!element) {
		throw new Error(`Missing required element: ${id}`);
	}

	return element;
}
