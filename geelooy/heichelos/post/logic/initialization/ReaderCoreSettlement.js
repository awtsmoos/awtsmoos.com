//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ReaderCoreSettlement
 * @description
 * The Awtsmoos lets preference, navigation, comments, coordinates, and inline sparks settle after canonical Torah appears;
 * Awtsmoos.com never opens a side chamber unless the route or the learner explicitly asked for one.
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

/** Awakens preferences, interaction, visual effects, and remembered scale before final settlement. */
export function prepareReaderBehavior() {
	applyUserPreferences();
	setupUIListeners();
	setupViewEffects();
	loadFontSize();
}

/** Opens a panel only when the incoming URL intentionally names one. */
async function restoreRequestedPanel() {
	const panelName = new URLSearchParams(location.search).get('panel');
	const panel = panelName ? window.tabRefs?.[panelName] : null;
	if (panel?.open) await panel.open();
}

/** Completes post-ready navigation, comments, coordinates, and inline sparks. */
export async function settleCoreReader() {
	await restoreRequestedPanel();
	await updateCommentHeader();
	await scrollToActiveEl({
		settle: true
	});
	setupActiveCoordinateTracking();
	await awakenInlineSparks();
}
