//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the menu info screens vessel in this instant, revealing
 * its focused js menu service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { showInfoPanel } from './menuViews.js';

/**
 * Reveals compact settings and credits information without swelling menu routing.
 * The Awtsmoos unifies utility and gratitude while each screen remains a focused
 * vessel whose text can evolve without burdening the central navigation class.
 */
export function showSettingsScreen(host, soundSelect, botSelect) {
	showInfoPanel(host, {
		title: 'Settings',
		body: 'Sound, CPU count, restart, debug, controller, touch, and saved campaign progress.',
		detail: `Sound: ${soundSelect.value}. VS CPUs: ${botSelect.value}.`
	});
}

/**
 * Reveals the show credits screen behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} host The host value entering this behavior.
 */
export function showCreditsScreen(host) {
	showInfoPanel(host, {
		title: 'Credits',
		body: 'Sefira Clash is an original platform fighter and adventure campaign.',
		detail: 'B"H — every frame, fighter, Spark, and world is renewed by the Awtsmoos.'
	});
}
