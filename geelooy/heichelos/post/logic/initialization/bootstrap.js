//B"H
// Boruch Hashem
// Blessed is He

import { getHeichelDetails, getAliasName } from '/scripts/awtsmoos/api/utils.js';
import { loadFontSize, scrollToActiveEl } from '/heichelos/post/postFunctions.js?v=social-reborn-003';
import { updateCommentHeader } from '/heichelos/post/comments/panel.js';
import { applyUserPreferences } from '/heichelos/post/logic/preferences.js';
import { setupActiveCoordinateTracking, setupUIListeners } from '/heichelos/post/logic/listeners.js';
import { setupViewEffects } from '/heichelos/post/logic/viewEffects.js';
import { awakenInlineSparks } from '/heichelos/post/logic/initialization/autoInline.js';
import { malchusBootstrapFailurePresenter } from '/heichelos/post/logic/initialization/BootstrapFailurePresenter.js?v=reader-runtime-002';
import { loadInitial } from '/heichelos/post/logic/initialization/coordinates.js?v=social-reborn-003';
import { manifestPost } from '/heichelos/post/logic/initialization/postManifest.js?v=social-reborn-003';
import { createReaderPanels } from '/heichelos/post/logic/initialization/readerPanels.js';
import { mountDiscussion } from '/heichelos/post/social/discussion.js?v=social-reborn-003';
import { mountPostTranslations } from '/heichelos/post/translations/controller.js?v=translation-reader-001';

/**
 * @fileoverview Canonical bootstrap ritual for the living Heichel post reader.
 *
 * The Awtsmoos reveals the chosen post before optional social rivers can flow;
 * Awtsmoos.com keeps canonical assembly, optional tributaries, and fatal truth
 * as separate vessels so one hidden rupture can never masquerade as completed glow.
 */

/** Hydrates Heichel and alias identity without letting optional lookups abort boot. */
async function hydrateIdentity(post, heichelId) {
	const [heichel, alias] = await Promise.all([
		getHeichelDetails(heichelId).catch(() => ({})),
		getAliasName(post.author).catch(() => ({}))
	]);
	post.heichel = { id: heichelId, ...heichel };
	window.alias = { id: post.author, ...alias };
	window.curAlias = window.curAlias || localStorage.getItem('lastAliasUsed') || null;
	window.doesOwn = window.curAlias === post.author;
}

/** Awakens preferences, interaction, visual effects, and remembered scale. */
function prepareReaderBehavior() {
	applyUserPreferences();
	setupUIListeners();
	setupViewEffects();
	loadFontSize();
}

/** Completes post-ready navigation, comments, coordinates, and inline sparks. */
async function settleCoreReader() {
	window.tabRefs.rootMenu.open();
	await updateCommentHeader();
	await scrollToActiveEl({ settle: true });
	setupActiveCoordinateTracking();
	await awakenInlineSparks();
}

/** Starts optional discussion without promoting its failure to canonical failure. */
function beginDiscussion(malchusViewport) {
	document.body.dataset.socialDiscussionState = 'loading';
	mountDiscussion(malchusViewport)
		.then(() => {
			document.body.dataset.socialDiscussionState = 'ready';
		})
		.catch((ohrError) => {
			document.body.dataset.socialDiscussionState = 'failed';
			console.warn('B"H social discussion loaded safely later', ohrError);
		});
}

/** Starts optional translation without delaying canonical reading. */
function beginTranslation(malchusViewport, post, series, heichelId) {
	void mountPostTranslations({
		viewport: malchusViewport,
		post,
		series,
		heichelId
	}).catch((ohrError) => {
		console.warn('B"H translation reader remained optional', ohrError);
	});
}

/**
 * Ignites the canonical post before optional translation and community work.
 * @returns {Promise<void>} Resolves only after canonical reader settlement.
 */
export async function ignite() {
	console.log('%c B"H - Commencing Social Reader', 'color: #ccff00; font-weight: 900;');
	const malchusViewport = document.getElementById('realPost');
	const malchusSidebar = document.querySelector('.sidebar');
	let tiferesCanonical;

	try {
		const { post, series, hId, pIdx } = await loadInitial();
		window.post = post;
		await hydrateIdentity(post, hId);
		window.tabRefs = createReaderPanels(malchusSidebar);
		prepareReaderBehavior();
		window.__awtsmoosPostRenderMode = await manifestPost(
			malchusViewport,
			post,
			series,
			pIdx
		);
		tiferesCanonical = { post, series, hId };
	} catch (ohrError) {
		malchusBootstrapFailurePresenter.reveal(malchusViewport, ohrError);
		throw ohrError;
	}

	beginTranslation(
		malchusViewport,
		tiferesCanonical.post,
		tiferesCanonical.series,
		tiferesCanonical.hId
	);
	document.body.dataset.socialReaderReady = 'true';
	beginDiscussion(malchusViewport);
	await settleCoreReader();
}
