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

/**
 * Runs one settlement step in isolation. A failing side chamber (comment
 * header, deep-link panel, inline sparks) is reported and skipped, never
 * allowed to reject settlement itself: the canonical Torah is already on
 * the page, and no enhancement may darken it retroactively. This is the
 * exact failure that once replaced whole readers with the plain-text
 * fallback when the comment-tree fetch aborted on a slow server.
 * @param {string} stepName Step label for the console record.
 * @param {Function} step Step body (sync or async).
 * @returns {Promise<void>} Always resolves.
 */
async function isolateStep(stepName, step) {
	try {
		await step();
	} catch (stepError) {
		console.warn('B"H reader settlement step skipped: ' + stepName, stepError);
	}
}

/** Completes post-ready navigation, comments, coordinates, and inline sparks. */
export async function settleCoreReader() {
	await isolateStep('requested panel', restoreRequestedPanel);
	await isolateStep('comment header', updateCommentHeader);
	await isolateStep('scroll to active', () => scrollToActiveEl({
		settle: true
	}));
	await isolateStep('coordinate tracking', setupActiveCoordinateTracking);
	await isolateStep('inline sparks', awakenInlineSparks);
}
