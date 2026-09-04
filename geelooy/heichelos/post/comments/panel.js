// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SidebarCommentPanel
 * @description
 * The Awtsmoos gives community insight its own truthful chamber beside canonical Torah light;
 * Awtsmoos.com names loading, emptiness, and failure honestly, so no social zero can masquerade as a commentator sight.
 */

import { getCurrentVerse } from './state.js';
import {
	clearSidebarCommentCache,
	getAndSaveAliases as fetchAliases
} from './panel/fetching.js?v=community-panel-003';
import { makeCommentatorList as renderCommentatorList } from './panel/rendering.js';
import {
	communityHeader,
	renderCommunityRetry
} from './panel/communityState.js?v=community-panel-003';
import {
	openCommunityAliasThread,
	showCommunityAliasThread
} from './panel/aliasThreads.js?v=community-panel-003';

export { getAndSaveAliases } from './panel/fetching.js?v=community-panel-003';

function updateHeaderState(state, count = 0) {
	const search = new URLSearchParams(location.search);
	window.tabComment?.onUpdateHeader?.(communityHeader({
		state,
		count,
		verse: getCurrentVerse(),
		sub: search.get('sub')
	}));
}

async function renderRootCommunity(parent, fresh = false) {
	updateHeaderState('loading');
	try {
		const aliases = await fetchAliases(false, fresh, null, undefined);
		updateHeaderState('ready', aliases.length);
		return await renderCommentatorList(parent, fresh);
	} catch (error) {
		console.warn('B"H community panel could not load.', error);
		updateHeaderState('error');
		renderCommunityRetry(parent, async () => {
			clearSidebarCommentCache();
			await renderRootCommunity(parent, true);
		});
		return [];
	}
}

export async function loadRootComments({ parent, tab }) {
	window.tabComment = tab;
	window.tabParent = parent;
	window.rootLevelCommentatorTab = tab;
	tab.actual = parent;
	tab.awtsmoosType = 'main community list';
	parent.replaceChildren();
	await renderRootCommunity(parent, false);
}

export async function makeCommentatorList(actualTab, forceFresh = false) {
	return renderRootCommunity(actualTab, forceFresh);
}

export async function updateCommentHeader(fresh = false) {
	updateHeaderState('loading');
	try {
		const aliases = await fetchAliases(false, fresh, null, undefined);
		updateHeaderState('ready', aliases.length);
		return aliases;
	} catch (error) {
		updateHeaderState('error');
		throw error;
	}
}

export async function showAllComments({ alias, tab, all = false, forceFresh = false }) {
	return showCommunityAliasThread({ alias, tab, all, forceFresh });
}

export async function openCommentsPanelToAlias(alias, open = true, searchAll = false) {
	return openCommunityAliasThread(alias, open, searchAll);
}

export async function openCommentsOfAlias({ alias, actualTab, all = false, forceFresh = false }) {
	return showCommunityAliasThread({ alias, tab: actualTab, all, forceFresh });
}

export async function refreshSidebarComments() {
	clearSidebarCommentCache();
	if (window.rootLevelCommentatorTab?.actual) {
		await renderRootCommunity(window.rootLevelCommentatorTab.actual, true);
	}
	if (window.currentAliasTabContainer && window.currentAliasBeingViewed) {
		await openCommentsOfAlias({
			alias: window.currentAliasBeingViewed,
			actualTab: window.currentAliasTabContainer,
			forceFresh: true
		});
	}
}

window.openCommentsPanelToAlias = openCommentsPanelToAlias;
window.openCommentsOfAlias = openCommentsOfAlias;
window.makeCommentatorList = makeCommentatorList;
window.refreshSidebarComments = refreshSidebarComments;
