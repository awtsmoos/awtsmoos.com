// B"H
/**
 * @module LearningHub
 * @description
 * B"H — Yaakov 2026-10-13: the feed's learning track hub. A "Learn" button
 * in the feed topbar opens a drawer with five tabs: Learning Plans, Siyum
 * Tracker, Source Sheets, Challenges, and Shiur (quick-launch help). Each
 * tab lazy-loads its module on first open so the river's first paint never
 * pays for code the user did not ask for.
 *
 * Modules mount into a body element via an exported `mount(el, ctx)` and
 * expose an exported `initCardHooks()` for per-card buttons when they want
 * them. This hub is retractable: Escape or the scrim closes it.
 */

import { icon, escapeHtml } from './icons.js';

const TABS = [
	{ id: 'plans', label: 'Learning Plans', icon: 'calendar', module: './learningPlans.js' },
	{ id: 'siyum', label: 'Siyum Tracker', icon: 'flag', module: './siyum.js' },
	{ id: 'sheets', label: 'Source Sheets', icon: 'sheet', module: './sourceSheets.js' },
	{ id: 'challenges', label: 'Challenges', icon: 'trophy', module: './challenges.js' },
	{ id: 'shiur', label: 'Shiur Mode', icon: 'present', module: './shiurMode.js' }
];

const loaded = new Map();
let overlay = null;
let activeTab = 'plans';

export function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

/** Shared localStorage JSON helpers (each module owns its own keys). */
export function readStore(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch (_) {
		return fallback;
	}
}

export function writeStore(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (_) {
		return false;
	}
}

function openHub(tabId) {
	if (overlay) {
		if (tabId) selectTab(tabId);
		return;
	}
	overlay = document.createElement('div');
	overlay.className = 'learn-overlay';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-label', 'Learning hub');
	overlay.innerHTML = `
		<div class="learn-panel">
			<div class="learn-panel-head">
				${icon('book', 'feed-ic')}
				<h2>Learn</h2>
				<button type="button" class="feed-ic-btn" data-learn-close aria-label="Close learning hub">${icon('close')}</button>
			</div>
			<div class="learn-tabs" role="tablist" aria-label="Learning tracks">
				${TABS.map(t => `<button type="button" class="learn-tab" role="tab" data-learn-tab="${t.id}" aria-selected="${t.id === (tabId || activeTab)}">${icon(t.icon)}<span>${escapeHtml(t.label)}</span></button>`).join('')}
			</div>
			<div class="learn-body" id="learn-body" role="tabpanel"></div>
		</div>`;
	document.body.append(overlay);
	overlay.querySelector('[data-learn-close]').addEventListener('click', closeHub);
	overlay.addEventListener('mousedown', (event) => {
		if (event.target === overlay) closeHub();
	});
	overlay.querySelectorAll('[data-learn-tab]').forEach(btn => {
		btn.addEventListener('click', () => selectTab(btn.dataset.learnTab));
	});
	selectTab(tabId || activeTab);
}

function closeHub() {
	if (!overlay) return;
	overlay.remove();
	overlay = null;
	document.removeEventListener('keydown', onHubKey, true);
}

function onHubKey(event) {
	if (event.key === 'Escape') {
		event.stopPropagation();
		closeHub();
	}
}

async function selectTab(tabId) {
	activeTab = tabId;
	const body = overlay?.querySelector('#learn-body');
	overlay?.querySelectorAll('[data-learn-tab]').forEach(btn => {
		btn.setAttribute('aria-selected', String(btn.dataset.learnTab === tabId));
	});
	if (!body) return;
	const tab = TABS.find(t => t.id === tabId);
	if (!tab) return;
	body.innerHTML = '<p class="learn-empty">Opening…</p>';
	try {
		if (!loaded.has(tab.id)) {
			const mod = await import(tab.module);
			loaded.set(tab.id, mod);
		}
		const mod = loaded.get(tab.id);
		body.innerHTML = '';
		const ctx = { alias: currentAlias(), readStore, writeStore, openHub };
		if (typeof mod.mount === 'function') {
			await mod.mount(body, ctx);
		} else {
			body.innerHTML = '<p class="learn-empty">This track is still being written. Check back soon.</p>';
		}
	} catch (err) {
		body.innerHTML = `<div class="learn-empty">${icon('spark')}<p>This track could not be opened. ${escapeHtml(tab.label)} is still being prepared.</p></div>`;
	}
}

/** Wire per-card hooks for every loaded-and-ready module (lazy, non-blocking). */
function wireCardHooks() {
	for (const tab of TABS) {
		import(tab.module).then((mod) => {
			try { mod.initCardHooks?.(); } catch (_) {}
		}).catch(() => {});
	}
}

/** Mounts the Learn button into the feed topbar. Call once from index.html. */
export function initLearningHub() {
	const topbar = document.querySelector('.feed-topbar');
	if (!topbar || document.getElementById('feed-learn-btn')) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.id = 'feed-learn-btn';
	btn.className = 'feed-ic-btn feed-learn-btn';
	btn.setAttribute('aria-label', 'Open the learning hub');
	btn.setAttribute('title', 'Learning hub — plans, siyum, sheets, challenges');
	btn.innerHTML = `${icon('book')}<span class="feed-ic-btn-label">Learn</span>`;
	const themeDrop = document.getElementById('feed-theme-drop');
	if (themeDrop) themeDrop.before(btn);
	else topbar.append(btn);
	btn.addEventListener('click', () => {
		document.addEventListener('keydown', onHubKey, true);
		openHub();
	});
	// Deep link: #sheet=<payload> opens a shared source sheet on load.
	if (location.hash.startsWith('#sheet=')) {
		openHub('sheets');
	}
	// Per-card hooks are lazy so first paint stays fast.
	if ('requestIdleCallback' in window) {
		requestIdleCallback(() => wireCardHooks(), { timeout: 4000 });
	} else {
		setTimeout(wireCardHooks, 2500);
	}
}
