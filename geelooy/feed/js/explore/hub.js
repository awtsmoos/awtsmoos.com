// B"H
/**
 * @module ExploreHub
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): the Explore hub.
 * An "Explore" button in the feed topbar opens a dialog with six visual
 * exploration views, each lazy-loaded on first open so the river's first
 * paint never pays for code the user did not ask for:
 *
 *   - compare:     side-by-side translation comparison (translationCompare.js)
 *   - manuscripts: handwritten manuscript viewer (manuscripts.js)
 *   - timeline:    chronological timeline of texts/sages/events (timeline.js)
 *   - map:         places in the texts on a schematic map (mapView.js)
 *   - trees:       sage family trees (familyTrees.js)
 *   - xref:        cross-reference graph (xrefGraph.js)
 *
 * Every view module exports `mount(el, ctx)`; the hub passes a context of
 * { post, postId } when the hub was opened for a specific post.
 *
 * Public API:
 *   initExplore()             — mounts the topbar button; safe to call once.
 *   openExplore(tabId, ctx)   — opens the dialog on a tab.
 *
 * Retractable: Escape, the close button, or a scrim click closes it.
 */

import { icon, escapeHtml } from '../icons.js';

const TABS = [
	{ id: 'compare', label: 'Compare Translations', icon: 'globe', module: './translationCompare.js' },
	{ id: 'manuscripts', label: 'Manuscripts', icon: 'sheet', module: './manuscripts.js' },
	{ id: 'timeline', label: 'Timeline', icon: 'clock', module: './timeline.js' },
	{ id: 'map', label: 'Map', icon: 'compass', module: './mapView.js' },
	{ id: 'trees', label: 'Sage Family Trees', icon: 'users', module: './familyTrees.js' },
	{ id: 'xref', label: 'Cross-References', icon: 'link', module: './xrefGraph.js' }
];

const loaded = new Map();
let overlay = null;
let activeTab = 'compare';
let activeCtx = {};

function comingSoon(el, label) {
	el.innerHTML = `<div class="explore-soon">
		<h3>${escapeHtml(label)} — coming soon</h3>
		<p>This exploration view has not shipped yet. The hub stays open so you
		can browse the views that are ready.</p>
	</div>`;
}

async function loadTabModule(tab) {
	if (loaded.has(tab.id)) return loaded.get(tab.id);
	try {
		const mod = await import(/* webpackIgnore: true */ tab.module);
		if (!mod || typeof mod.mount !== 'function') throw new Error('no mount');
		loaded.set(tab.id, mod);
		return mod;
	} catch (_) {
		loaded.set(tab.id, null);
		return null;
	}
}

function renderTabs() {
	return TABS.map(t => `<button type="button" class="explore-tab" role="tab"
		data-explore-tab="${t.id}" aria-selected="${t.id === activeTab}">
		${icon(t.icon, 'feed-ic')}<span>${escapeHtml(t.label)}</span></button>`).join('');
}

async function selectTab(tabId, bodyEl) {
	const tab = TABS.find(t => t.id === tabId) || TABS[0];
	activeTab = tab.id;
	overlay.querySelectorAll('[data-explore-tab]').forEach(btn => {
		btn.setAttribute('aria-selected', btn.dataset.exploreTab === tab.id ? 'true' : 'false');
	});
	bodyEl.innerHTML = `<div class="explore-soon"><h3>Loading…</h3>
		<p>Opening ${escapeHtml(tab.label)}.</p></div>`;
	const mod = await loadTabModule(tab);
	if (!overlay) return;
	if (!mod) {
		comingSoon(bodyEl, tab.label);
		return;
	}
	try {
		bodyEl.innerHTML = '';
		await mod.mount(bodyEl, { ...activeCtx, openExplore });
	} catch (err) {
		comingSoon(bodyEl, tab.label);
	}
}

function closeHub() {
	if (!overlay) return;
	overlay.remove();
	overlay = null;
	document.removeEventListener('keydown', onKey, true);
}

/** @param {KeyboardEvent} e */
function onKey(e) {
	if (e.key === 'Escape') closeHub();
}

/**
 * Opens the Explore dialog.
 * @param {string} [tabId] Tab to open on.
 * @param {object} [ctx] Context passed to the tab module ({ post, postId }).
 */
export function openExplore(tabId, ctx = {}) {
	activeCtx = ctx || {};
	if (overlay) {
		selectTab(tabId || activeTab, overlay.querySelector('.explore-body'));
		return;
	}
	overlay = document.createElement('div');
	overlay.className = 'explore-overlay';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-label', 'Explore');
	overlay.innerHTML = `
		<div class="explore-panel">
			<div class="explore-panel-head">
				${icon('compass', 'feed-ic')}
				<h2>Explore the texts</h2>
				<button type="button" class="feed-ic-btn" data-explore-close aria-label="Close explore">
					${icon('close', 'feed-ic')}
				</button>
			</div>
			<div class="explore-tabs" role="tablist" aria-label="Exploration views">${renderTabs()}</div>
			<div class="explore-body" role="tabpanel"></div>
		</div>`;
	document.body.append(overlay);
	overlay.querySelector('[data-explore-close]').addEventListener('click', closeHub);
	overlay.addEventListener('mousedown', (event) => {
		if (event.target === overlay) closeHub();
	});
	overlay.querySelectorAll('[data-explore-tab]').forEach(btn => {
		btn.addEventListener('click', () => selectTab(btn.dataset.exploreTab, overlay.querySelector('.explore-body')));
	});
	document.addEventListener('keydown', onKey, true);
	selectTab(tabId || activeTab, overlay.querySelector('.explore-body'));
}

/** Mounts the Explore button into the feed topbar. Safe to call once. */
export function initExplore() {
	const topbar = document.querySelector('.feed-topbar');
	if (!topbar || topbar.querySelector('[data-explore-open]')) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn';
	btn.dataset.exploreOpen = '1';
	btn.setAttribute('aria-label', 'Explore: translations, manuscripts, timeline, map, trees, cross-references');
	btn.title = 'Explore';
	btn.innerHTML = `${icon('compass', 'feed-ic')}<span class="feed-ic-btn-label">Explore</span>`;
	btn.addEventListener('click', () => openExplore());
	const brand = topbar.querySelector('.feed-brand');
	if (brand && brand.nextSibling) topbar.insertBefore(btn, brand.nextSibling);
	else topbar.prepend(btn);
}
