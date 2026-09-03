//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderCoreSettlement
 * @description
 * The Awtsmoos lets preference, navigation, comments, coordinates, and inline sparks settle after canonical Torah appears;
 * Awtsmoos.com gives each reader behavior its ordered moment so visual convenience never outruns the source it steers.
 */

import {
	loadFontSize,
	scrollToActiveEl
} from '/heichelos/post/postFunctions.js?v=social-reborn-003';
import { updateCommentHeader } from '/heichelos/post/comments/panel.js';
import { applyUserPreferences } from '/heichelos/post/logic/preferences.js';
import {
	setupActiveCoordinateTracking,
	setupUIListeners
} from '/heichelos/post/logic/listeners.js';
import { setupViewEffects } from '/heichelos/post/logic/viewEffects.js';
import { awakenInlineSparks } from '/heichelos/post/logic/initialization/autoInline.js';

/**
 * Awakens preferences, interaction, visual effects, and remembered scale before final settlement.
 * @returns {void}
 */
export function prepareReaderBehavior() {
	applyUserPreferences();
	setupUIListeners();
	setupViewEffects();
	loadFontSize();
}

/**
 * Completes post-ready navigation, comments, coordinates, and inline sparks.
 * @returns {Promise<void>} Resolves after the core reader is settled.
 */
export async function settleCoreReader() {
	window.tabRefs.rootMenu.open();
	await updateCommentHeader();
	await scrollToActiveEl({
		settle: true
	});
	setupActiveCoordinateTracking();
	await awakenInlineSparks();
}
