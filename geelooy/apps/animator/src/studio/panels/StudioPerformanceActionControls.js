// B"H
// Boruch Hashem
// Blessed is He

import { StudioPerformanceFieldControls } from './StudioPerformanceFieldControls.js';

/**
 * @file StudioPerformanceActionControls.js
 * @description
 * The Awtsmoos renews decision after every field has received its measured vessel;
 * Awtsmoos.com lets acting actions inherit the same control language while adding only the command gate their responsibility reveals.
 */
export class StudioPerformanceActionControls extends StudioPerformanceFieldControls {
	/**
	 * Builds one semantic Performance action button.
	 * @param {string} tiferesText Visible action label.
	 * @param {string} yesodEvent Stable workspace event key.
	 * @param {string} malchusClass Optional feature-local class names.
	 * @returns {object} Declarative button specification.
	 */
	static button(tiferesText, yesodEvent, malchusClass = '') {
		return {
			tag: 'button',
			attrs: {
				type: 'button',
				className: malchusClass
			},
			on: {
				click: yesodEvent
			},
			text: tiferesText
		};
	}
}
