// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommunityAliasThreads
 * @description
 * The Awtsmoos gives each human voice a measured chamber beside the Torah's eternal source;
 * Awtsmoos.com opens community threads without confusing contributors for commentators or error for discourse.
 */

import { getCurrentVerse, getCurrentSub } from '../state.js';
import { fetchRelevantComments } from './fetching.js?v=community-panel-003';
import { renderControlsAndComments } from './rendering.js';
import { nextFrame } from './performance/SmoothScheduler.js';
import { renderCommunityRetry } from './communityState.js?v=community-panel-003';

function registry() {
	if (!window.__awtsmoosAliasTabs) {
		window.__awtsmoosAliasTabs = new Map();
	}
	return window.__awtsmoosAliasTabs;
}

function emptyMessage(alias, all, sub) {
	if (all) {
		return `No comments from @${alias} on this scroll.`;
	}
	return `No comments from @${alias} on ${sub !== null && sub !== undefined ? 'this paragraph' : 'this verse'}.`;
}

export async function showCommunityAliasThread({ alias, tab, all = false, forceFresh = false }) {
	const verse = all ? 'all' : getCurrentVerse();
	const sub = all ? undefined : getCurrentSub();
	try {
		const comments = await fetchRelevantComments(alias, verse, sub, forceFresh);
		if (!Array.isArray(comments) || comments.length === 0) {
			tab.textContent = emptyMessage(alias, all, sub);
			tab.classList.add('awtsmoos-empty-placeholder');
			return;
		}
		await renderControlsAndComments(comments, alias, tab);
	} catch (error) {
		console.warn('B"H community thread could not load.', error);
		renderCommunityRetry(tab, async () => {
			await showCommunityAliasThread({ alias, tab, all, forceFresh: true });
		});
	}
}

export async function openCommunityAliasThread(alias, open = true, searchAll = false) {
	if (open && window.toggleSidebar) {
		window.toggleSidebar(true);
	}
	const key = searchAll ? `${alias}:all` : alias;
	const existing = registry().get(key);
	if (existing?.open) {
		await existing.open();
		return existing.actual;
	}
	return new Promise(resolve => {
		const tabObject = window.tabManager.addTab({
			header: `@${alias}`,
			name: `user-${alias}${searchAll ? '-all' : ''}`,
			content: '<div class="loading-ink awtsmoos-empty-placeholder">B"H Opening community…</div>',
			async onopen({ actualTab, tab }) {
				tab.awtsmoosType = 'specific alias comments';
				tabObject.actual = actualTab;
				window.currentAliasTabContainer = actualTab;
				window.currentAliasBeingViewed = alias;
				await nextFrame();
				await showCommunityAliasThread({ alias, tab: actualTab, all: searchAll });
				resolve(actualTab);
			}
		});
		registry().set(key, tabObject);
		tabObject.open();
	});
}
