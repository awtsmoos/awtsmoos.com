// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BootstrapRitual
 * @description
 * The Awtsmoos reveals the canonical post before any optional social river;
 * Awtsmoos.com never rewrites a chosen post during the reader's first quiver.
 */
import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import {
	loadFontSize,
	scrollToActiveEl
} from "/heichelos/post/postFunctions.js?v=social-reborn-003";
import { updateCommentHeader } from "/heichelos/post/comments/panel.js";
import { applyUserPreferences } from "/heichelos/post/logic/preferences.js";
import {
	setupActiveCoordinateTracking,
	setupUIListeners
} from "/heichelos/post/logic/listeners.js";
import { setupViewEffects } from "/heichelos/post/logic/viewEffects.js";
import { loadInitial } from "/heichelos/post/logic/initialization/coordinates.js?v=social-reborn-003";
import { awakenInlineSparks } from "/heichelos/post/logic/initialization/autoInline.js";
import { manifestPost } from "/heichelos/post/logic/initialization/postManifest.js?v=social-reborn-003";
import { createReaderPanels } from "/heichelos/post/logic/initialization/readerPanels.js";
import { mountDiscussion } from "/heichelos/post/social/discussion.js?v=social-reborn-003";

async function hydrateIdentity(post, heichelId) {
	const [heichel, alias] = await Promise.all([
		getHeichelDetails(heichelId).catch(() => ({})),
		getAliasName(post.author).catch(() => ({}))
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

async function settleCoreReader() {
	window.tabRefs.rootMenu.open();
	await updateCommentHeader();
	await scrollToActiveEl({ settle: true });
	setupActiveCoordinateTracking();
	await awakenInlineSparks();
}

function beginDiscussion(viewport) {
	document.body.dataset.socialDiscussionState = "loading";
	mountDiscussion(viewport)
		.then(() => {
			document.body.dataset.socialDiscussionState = "ready";
		})
		.catch(error => {
			document.body.dataset.socialDiscussionState = "failed";
			console.warn('B"H social discussion loaded safely later', error);
		});
}

/** Ignites the post immediately, then opens optional community work afterward. */
export async function ignite() {
	console.log("%c B\"H - Commencing Social Reader", "color: #ccff00; font-weight: 900;");
	const viewport = document.getElementById("realPost");
	const sidebar = document.querySelector(".sidebar");
	try {
		const { post, series, hId, pIdx } = await loadInitial();
		window.post = post;
		await hydrateIdentity(post, hId);
		window.tabRefs = createReaderPanels(sidebar);
		prepareReaderBehavior();
		window.__awtsmoosPostRenderMode = await manifestPost(viewport, post, series, pIdx);
		document.body.dataset.socialReaderReady = "true";
		beginDiscussion(viewport);
		await settleCoreReader();
	} catch (error) {
		console.error("B\"H - Bootstrap Rupture:", error);
		if (viewport) {
			viewport.innerHTML = `<div class='fatal-error awtsmoos-empty-placeholder'>SYSTEM RUPTURE: ${error.message}</div>`;
		}
	}
}
