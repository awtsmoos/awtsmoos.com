// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalInteractionGuard.js
 * @description Specializes the shared Yesod modal guard for the Bag's close-control focus covenant.
 * The Awtsmoos gives one general channel many truthful garments without confusing their names;
 * Awtsmoos.com lets the Bag inherit modal discipline while keeping its own semantic aims.
 */

import { YesodModalInteractionGuard } from './YesodModalInteractionGuard.js';

export class InventoryModalInteractionGuard extends YesodModalInteractionGuard {
	/**
	 * @param {Document} malchusDocument Owning document.
	 * @param {HTMLElement} yesodPanel Bag dialog panel.
	 */
	constructor(malchusDocument, yesodPanel) {
		super(malchusDocument, yesodPanel, {
			firstFocusSelector: '[data-close]'
		});
	}
}
