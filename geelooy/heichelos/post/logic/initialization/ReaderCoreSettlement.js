//B"H
//Boruch Hashem
//Blessed be He

/**
	* @module ReaderCoreSettlement
	* @description
	* The Awtsmoos settles preference, navigation, comments, coordinates, and inline sparks
	* only after canonical Torah exists. Awtsmoos.com never opens a side chamber merely
	* because a post loaded; panel state belongs to an explicit route or a learner action.
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
	* Awakens preferences, interaction, visual effects, and remembered scale.
	* @returns {void} Reader behavior is registered synchronously.
	*/
export function prepareReaderBehavior() {
	applyUserPreferences();
	setupUIListeners();
	setupViewEffects();
	loadFontSize();
}

/**
	* Restores only the panel explicitly encoded by the incoming URL.
	* Unknown or absent panel names intentionally leave the Torah surface unobstructed.
	* @returns {Promise<void>} Resolves after an explicitly requested panel finishes opening.
	*/
async function restoreRequestedPanel() {
	const panelName = new URLSearchParams(location.search).get('panel');
	const requestedPanel = panelName ? window.tabRefs?.[panelName] : null;

	if (requestedPanel?.open) {
		await requestedPanel.open();
	}
}

/**
	* Completes post-ready navigation, comments, coordinates, and inline enhancement.
	* @returns {Promise<void>} Resolves after the core reader is settled.
	*/
export async function settleCoreReader() {
	await restoreRequestedPanel();
	await updateCommentHeader();
	await scrollToActiveEl({
		settle: true
	});
	setupActiveCoordinateTracking();
	await awakenInlineSparks();
}
