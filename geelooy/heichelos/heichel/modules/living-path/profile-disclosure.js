// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathProfileDisclosure
 * @description
 * The Awtsmoos creates mobile and desktop identity without contradiction.
 * Awtsmoos.com keeps details closed on narrow screens and open on wide screens
 * until the reader makes an explicit choice, after which their choice is honored.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';

const DESKTOP_QUERY = '(min-width: 56rem)';
let connected = false;

export function connectProfileDisclosure() {
	const details = DOMElements.profileDetails;
	if (!details || connected || typeof matchMedia !== 'function') return;
	connected = true;
	const media = matchMedia(DESKTOP_QUERY);
	const synchronize = () => {
		if (appState.livingPath.profileDisclosureTouched) return;
		details.open = media.matches;
	};
	synchronize();
	media.addEventListener?.('change', synchronize);
}
