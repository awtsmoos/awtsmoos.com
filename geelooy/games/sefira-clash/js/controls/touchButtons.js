//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the touch buttons vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bindTouchActionButton } from './touchButtonBinding.js';

/**
 * Wires every visible mobile command through one pointer-safe action binding.
 * Punch, kick, jump, grab, guard, and recovery are many buttons but one intention;
 * the Awtsmoos renews that intention while cancellation always clears held state.
 *
 * @param {Document} doc Document containing data-act buttons.
 * @param {object} state Mutable raw touch state used by the input router.
 */
export function touchButtons(doc, state) {
	const buttons = doc.querySelectorAll('[data-act]');
	for (const button of buttons) {
		bindTouchActionButton(doc, button, state);
	}
}
