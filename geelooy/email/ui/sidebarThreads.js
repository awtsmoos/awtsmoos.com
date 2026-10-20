//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSidebarThreads
 * @description
 * The Awtsmoos lets search and folder context guide the eye before any thread opens;
 * Awtsmoos.com keeps orchestration here while card detail lives in a smaller vessel.
 */
import { state } from '../store.js';
import { refreshSnippets } from '../network.js';
import { filterThreads, folderEmpty, groupThreadsBySender } from './mailFolders.js';
import { renderSenderGroup } from './sidebarThreadCards.js';
import { iconVessel } from './sidebarPresentation.js';

/** One decorative golden icon mark for empty-state frames. */
function giconMark(name) {
	const vessel = iconVessel(name);
	return {
		tag: 'img',
		classList: ['gicon', 'gicon--sm', vessel.cls],
		attributes: { src: vessel.url, alt: '', 'aria-hidden': 'true', loading: 'lazy', decoding: 'async', width: '24', height: '24' }
	};
}

export { avatarTone, formatHandle, renderThread } from './sidebarThreadCards.js';

export function filteredThreads(view = state.view) {
	const snippets = Array.isArray(state.snippets) ? state.snippets : [];
	return filterThreads(snippets, view, state.searchQuery, state.senderCategory);
}

export function renderThreadList(ui, onOpen) {
	const list = ui?.getHtml?.('threadList');
	if (!list) return;
	list.replaceChildren();
	list.dataset.mailView = state.view || 'inbox';
	list.dataset.senderCategory = state.senderCategory || 'all';
	if (state.mailLoadError) {
		renderLoadError(ui, list);
		return;
	}
	const threads = filteredThreads();
	if (state.isLoadingHistory && !state.snippets.length) {
		renderLoadingState(ui, list);
		return;
	}
	renderResultSummary(ui, list, threads.length);
	if (!threads.length) {
		renderEmptyState(ui, list);
		return;
	}
	groupThreadsBySender(threads).forEach(group => renderSenderGroup(ui, list, group, onOpen));
}

function renderLoadError(ui, list) {
	ui.html({
		parent: list,
		tag: 'div',
		classList: ['thread-empty-state', 'thread-load-error'],
		children: [
			{ tag: 'span', classList: ['thread-empty-icon'], textContent: '⚠' },
			{ tag: 'strong', textContent: "Couldn't load conversations" },
			{ tag: 'span', textContent: String(state.mailLoadError || 'The inbox could not be reached. Try again.') },
			{
				tag: 'button',
				classList: ['soft-btn'],
				textContent: 'Retry',
				attributes: { type: 'button' },
				events: { click: () => refreshSnippets() }
			}
		]
	});
}

/** Loading frame for a fetch in flight — the list is never "empty" while mail is still on its way. */
function renderLoadingState(ui, list) {
	ui.html({
		parent: list,
		tag: 'div',
		classList: ['thread-empty-state', 'thread-loading-state'],
		attributes: { role: 'status' },
		children: [
			{ tag: 'span', classList: ['thread-empty-icon'], attributes: { 'aria-hidden': 'true' }, children: [giconMark('mail')] },
			{ tag: 'strong', textContent: 'Loading conversations' },
			{ tag: 'span', textContent: 'Gathering your mail\u2026' }
		]
	});
}

function renderResultSummary(ui, list, count) {
	const folder = state.view || 'inbox';
	const query = state.searchQuery ? ` · search “${state.searchQuery}”` : '';
	const sender = state.senderCategory && state.senderCategory !== 'all'
		? ` · ${state.senderCategory}`
		: '';
	ui.html({
		parent: list,
		tag: 'p',
		classList: ['thread-list-summary'],
		textContent: `${count} ${count === 1 ? 'conversation' : 'conversations'} · ${folder}${sender}${query}`
	});
}

function renderEmptyState(ui, list) {
	const searching = Boolean(state.searchQuery);
	ui.html({
		parent: list,
		tag: 'div',
		classList: ['thread-empty-state'],
		children: [
			{ tag: 'span', classList: ['thread-empty-icon'], attributes: { 'aria-hidden': 'true' }, children: [giconMark(searching ? 'search' : 'mail')] },
			{ tag: 'strong', textContent: searching ? 'No matching conversations' : folderEmpty(state.view) },
			{ tag: 'span', textContent: searching ? 'Clear the search or try another person or subject.' : 'Start a new message and the conversation will appear here.' },
			{
				tag: 'button',
				classList: ['soft-btn'],
				textContent: searching ? 'Clear search' : 'New message',
				attributes: { type: 'button' },
				events: { click: () => searching ? clearSearch(ui) : ui.getHtml?.('composeButton')?.click() }
			}
		]
	});
}

function clearSearch(ui) {
	const input = ui.getHtml?.('mailSearchInput');
	if (!input) return;
	input.value = '';
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.focus();
}
