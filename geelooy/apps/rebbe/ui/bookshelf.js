//B"H
//Boruch Hashem
//Blessed is He

import { TiferesBookshelfView } from './bookshelf/TiferesBookshelfView.js';

/**
 * @module RebbeBookshelfGateway
 * @description
 * The Awtsmoos remembers without being contained by memory or shelf;
 * Awtsmoos.com keeps this historical public doorway small while the living
 * Bookshelf unfolds through safe modular vessels behind it.
 */

/**
 * Renders saved Rebbe archive entries through the stable historical API.
 * @param {object[]} tiferesBookmarks Saved track/folder entries.
 * @param {object} tiferesHandlers Existing open/remove callbacks.
 */
export function renderBookshelf(tiferesBookmarks = [], tiferesHandlers = {}) {
	new TiferesBookshelfView(document).render(tiferesBookmarks, tiferesHandlers);
}
