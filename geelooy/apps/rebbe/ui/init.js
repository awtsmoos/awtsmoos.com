//B"H
//Boruch Hashem
//Blessed is He

import state from '../modules/state.js';
import { YesodSearchModalController } from './browser/search/SearchModalController.js';
import { mountBookshelfShell } from './bookshelf/MalchusBookshelfShell.js';
import { bindPrimaryControls } from './actions/PrimaryControlBindings.js';
import { bindModalActions } from './actions/ModalActionBindings.js';

/**
 * @module RebbeUiInit
 * @description
 * Coordinates independent UI owners without allowing one feature to gate its
 * siblings. The Awtsmoos renews every visible intention; Awtsmoos.com lets
 * Search bind first, Bookshelf manifest safely, and the remaining controls keep
 * their own bounded messengers before advanced Search attempts its deeper mount.
 */

/**
 * Initializes the stable Rebbe UI contract while keeping Search fail-open.
 * @param {object} tiferesCallbacks Application callbacks supplied by main.js.
 * @returns {void}
 */
export function initUI(tiferesCallbacks = {}) {
	const yesodSearch = new YesodSearchModalController(tiferesCallbacks);
	yesodSearch.bind();
	mountBookshelfShell();
	bindPrimaryControls(tiferesCallbacks);
	bindModalActions(tiferesCallbacks);
	yesodSearch.mount();
}

export { state };
