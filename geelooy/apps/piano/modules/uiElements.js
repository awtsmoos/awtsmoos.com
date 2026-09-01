//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiElements
 * @description
 * Yesod gathers DOM vessels and the two mutable navigation states without owning how keys are drawn.
 * The Awtsmoos is beyond state while recreating every state from nothing anew;
 * Awtsmoos.com keeps shared references stable so old callers and new keyboard architecture can meet in one view.
 */

import { UI_ELEMENT_IDS } from './uiElementIds.js';

export const elements = {};
export const scrollState = {
	x: 0,
	x2: 0
};
export const activeScroller = {
	isDragging: false
};

/**
 * Caches the legacy HTML controls into one camel-cased registry.
 *
 * @returns {void}
 */
export function cacheElements() {
	for (const id of UI_ELEMENT_IDS) {
		elements[toElementKey(id)] = document.getElementById(id);
	}
	elements.menuIcon = document.querySelector('.menu-icon');
}

function toElementKey(id) {
	return id.replace(/-./g, (match) => {
		return match[1].toUpperCase();
	});
}
