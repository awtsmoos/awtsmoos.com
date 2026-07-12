// B"H
/**
 * @module GeelooyHomeFeedController
 * @description
 * The feed now drinks only from observed API rivers. No invented post pretends
 * to be a person; quiet water is rendered honestly as quiet water.
 */
import { loadFeedMode } from './api.js';
import { emptyCard, renderObjectCard, statusCard } from './cards.js?v=comments-001';
import { inspectObject } from './inspector.js';
import { extractItems, normalizeItem } from './normalize.js';
import { state } from './state.js';
import { syncFeedObjects } from './graphBridge.js';
import { createInfiniteFeed } from '../../feed/infiniteFeed.js';
import { fetchIkarPosts } from '../../feed/ikarFeedApi.js';

let initialized = false;
let activeRun = 0;

/** Initializes tabs, search, and the first real feed request. */
export function initHomeLiveFeed() {
	if (initialized) return;
	initialized = true;
	bindTabs();
	bindSearch();
	activate('forYou');
}

async function activate(mode, options = {}) {
	const run = ++activeRun;
	const feed = feedRoot();
	if (!feed) return;
	state.mode = mode;
	updateTabs(mode);
	feed.setAttribute('aria-busy', 'true');
	feed.replaceChildren(statusCard('Loading feed', 'Gathering live posts from Geelooy…', 'loading'));
	try {
		const objects = await loadRealObjects(mode, options);
		if (run !== activeRun) return;
		commitFeed(feed, objects, mode);
	} catch (error) {
		if (run !== activeRun) return;
		console.error('B"H live feed request failed', error);
		feed.replaceChildren(statusCard('Feed unavailable', error.message || 'The live stream could not open.', 'error'));
	} finally {
		if (run === activeRun) feed.setAttribute('aria-busy', 'false');
	}
}

function commitFeed(feed, objects, mode) {
	if (!objects.length) {
		feed.replaceChildren(emptyCard(mode, () => focusSearch()));
		return;
	}
	state.objects = new Map(objects.map(object => [object.id, object]));
	syncFeedObjects(mode, objects);
	feed.replaceChildren(...objects.map(object => renderObjectCard(object, inspectObject)));
	const infinite = createInfiniteFeed({
		initial: objects,
		pageSize: 8,
		render: next => appendCards(feed, next),
		onAppend: all => syncFeedObjects(mode, all)
	});
	infinite.attach(feed);
	feed.dataset.infiniteFeed = 'real-api';
	if (objects[0]) inspectObject(objects[0]);
}

async function loadRealObjects(mode, options) {
	const tasks = [loadFeedMode(mode, { query: state.lastQuery, ...options })];
	if (mode !== 'search') tasks.push(fetchIkarPosts({ limit: 18 }));
	const settled = await Promise.allSettled(tasks);
	const apiPayload = settled[0].status === 'fulfilled' ? settled[0].value : [];
	const apiObjects = extractItems(apiPayload, mode).map(item => normalizeItem(item, mode));
	const ikarObjects = settled[1]?.status === 'fulfilled' ? settled[1].value : [];
	if (settled.every(result => result.status === 'rejected')) throw settled[0].reason;
	return uniqueObjects([...ikarObjects, ...apiObjects]);
}

function uniqueObjects(objects) {
	const unique = new Map();
	objects.filter(object => object?.id).forEach(object => unique.set(String(object.id), object));
	return Array.from(unique.values());
}

function appendCards(feed, next) {
	const sentinel = feed.querySelector('[data-infinite-feed-sentinel]');
	const cards = next.map(object => renderObjectCard(object, inspectObject));
	sentinel ? sentinel.before(...cards) : feed.append(...cards);
}

function bindTabs() {
	document.querySelectorAll('[data-feed-mode]').forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.feedMode)));
}

function bindSearch() {
	const form = document.querySelector('[data-home-search]');
	if (!form) return;
	form.addEventListener('submit', event => {
		event.preventDefault();
		state.lastQuery = new FormData(form).get('q') || '';
		activate('search', { query: state.lastQuery });
	});
}

function updateTabs(mode) {
	document.querySelectorAll('[data-feed-mode]').forEach(tab => {
		const selected = tab.dataset.feedMode === mode;
		tab.classList.toggle('active', selected);
		tab.setAttribute('aria-pressed', String(selected));
	});
}

function focusSearch() {
	document.querySelector('[data-home-search] input')?.focus();
}

function feedRoot() {
	return document.querySelector('[data-home-feed]');
}
