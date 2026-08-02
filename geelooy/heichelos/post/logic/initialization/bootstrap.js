// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BootstrapRitual
 * @description
 * The Awtsmoos gathers coordinates, title, remote media, verses, comments,
 * and navigation into one living reader. Cache-busted imports ensure mobile
 * readers receive the complete post vessel after production changes.
 */

import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { loadFontSize, scrollToActiveEl } from "/heichelos/post/postFunctions.js";
import { updateCommentHeader } from "/heichelos/post/comments/panel.js";
import { indexSwitch } from "/heichelos/post/logic/conductor.js";
import { applyUserPreferences } from "/heichelos/post/logic/preferences.js";
import { setupActiveCoordinateTracking, setupUIListeners } from "/heichelos/post/logic/listeners.js";
import { setupViewEffects } from "/heichelos/post/logic/viewEffects.js";
import { loadInitial } from "/heichelos/post/logic/initialization/coordinates.js?v=root-series-context-001";
import { awakenInlineSparks } from "/heichelos/post/logic/initialization/autoInline.js";
import { manifestPost } from "/heichelos/post/logic/initialization/postManifest.js?v=root-assets-001";
import { createReaderPanels } from "/heichelos/post/logic/initialization/readerPanels.js";

async function hydrateIdentity(post, heichelId) {
	const [heichel, alias] = await Promise.all([
		getHeichelDetails(heichelId).catch(() => ({})),
		getAliasName(post.author).catch(() => ({})),
	]);
	post.heichel = { id: heichelId, ...heichel };
	window.alias = { id: post.author, ...alias };
	window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || null;
	window.doesOwn = window.curAlias === post.author;
}

function prepareReaderBehavior() {
	applyUserPreferences();
	setupUIListeners();
	setupViewEffects();
	loadFontSize();
}

async function settleReader() {
	window.tabRefs.rootMenu.open();
	await indexSwitch(true);
	await updateCommentHeader();
	await scrollToActiveEl({ settle: true });
	setupActiveCoordinateTracking();
	await awakenInlineSparks();
}

/** Ignites the canonical post reader from API response through visible DOM. */
export async function ignite() {
	console.log("%c B\"H - Commencing Unified Seder Histalshelus", "color: #ccff00; font-weight: 900;");
	const viewport = document.getElementById("realPost");
	const sidebar = document.querySelector(".sidebar");
	try {
		const { post, series, hId, pIdx } = await loadInitial();
		window.post = post;
		await hydrateIdentity(post, hId);
		window.tabRefs = createReaderPanels(sidebar);
		prepareReaderBehavior();
		window.__awtsmoosPostRenderMode = await manifestPost(viewport, post, series, pIdx);
		await settleReader();
	} catch (error) {
		console.error("B\"H - Bootstrap Rupture:", error);
		if (viewport) {
			viewport.innerHTML = `<div class='fatal-error awtsmoos-empty-placeholder'>SYSTEM RUPTURE: ${error.message}</div>`;
		}
	}
}
