// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedFilters
 * @description
 * Yaakov 2026-10-13: the river can be narrowed to the voices you want —
 * specific authors, specific heichelos, specific topics. A retractable
 * filter panel collects facets from the posts already loaded; choices
 * persist and also travel to the server as query params (best effort).
 * Client-side filtering is authoritative: the server may ignore unknown
 * params, the river never shows what you filtered out.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';
import { getHeichelTheme, setHeichelTheme, THEMES, isThemeId, themeById } from './themes.js';

const STORE_KEY = 'awtsmoos-feed-filters';

export function loadFilters() {
	try {
		const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
		return {
			authors: new Set(Array.isArray(raw.authors) ? raw.authors : []),
			heichels: new Set(Array.isArray(raw.heichels) ? raw.heichels : []),
			topics: new Set(Array.isArray(raw.topics) ? raw.topics : [])
		};
	} catch (_) {
		return { authors: new Set(), heichels: new Set(), topics: new Set() };
	}
}

export function saveFilters(f) {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify({
			authors: [...f.authors], heichels: [...f.heichels], topics: [...f.topics]
		}));
	} catch (_) { /* private mode */ }
}

export function clearFilters(f) {
	f.authors.clear(); f.heichels.clear(); f.topics.clear();
	saveFilters(f);
}

export function hasActiveFilters(f) {
	return f.authors.size > 0 || f.heichels.size > 0 || f.topics.size > 0;
}

function authorIdOf(item = {}) {
	return String(item.aliasId || item.author || '');
}

function authorNameOf(item = {}) {
	return String(item.authorName || item.aliasName || item.aliasId || item.author || 'Awtsmoos');
}

function heichelIdOf(item = {}) {
	return String(item.heichelId || 'ikar');
}

function heichelNameOf(item = {}) {
	return String(item.heichelName || item.heichelId || 'Heichel');
}

function topicsOf(item = {}) {
	const out = new Set();
	for (const t of (item.topics || item.tags || [])) {
		const s = String(t).trim().replace(/^#/, '');
		if (s) out.add(s);
	}
	const text = `${item.title || ''} ${item.excerpt || ''} ${item.summary || ''}`;
	for (const m of String(text).match(/#[\p{L}\p{N}_-]+/gu) || []) out.add(m.slice(1));
	return [...out];
}

export function itemTopics(item = {}) {
	return topicsOf(item);
}

/**
 * Collects facet counts from loaded items for the panel.
 * @returns {{authors: Array, heichels: Array, topics: Array}}
 */
export function collectFacets(items = []) {
	const authors = new Map();
	const heichels = new Map();
	const topics = new Map();
	for (const item of items) {
		const aid = authorIdOf(item);
		if (aid && aid !== 'anonymous') {
			const a = authors.get(aid) || { id: aid, name: authorNameOf(item), count: 0 };
			a.count++;
			authors.set(aid, a);
		}
		const hid = heichelIdOf(item);
		const h = heichels.get(hid) || { id: hid, name: heichelNameOf(item), count: 0 };
		h.count++;
		heichels.set(hid, h);
		for (const t of topicsOf(item)) {
			const e = topics.get(t) || { id: t, name: '#' + t, count: 0 };
			e.count++;
			topics.set(t, e);
		}
	}
	const byCount = (a, b) => b.count - a.count;
	return {
		authors: [...authors.values()].sort(byCount).slice(0, 40),
		heichels: [...heichels.values()].sort(byCount),
		topics: [...topics.values()].sort(byCount).slice(0, 40)
	};
}

export function itemMatchesFilters(item = {}, f) {
	if (!hasActiveFilters(f)) return true;
	if (f.authors.size && !f.authors.has(authorIdOf(item))) return false;
	if (f.heichels.size && !f.heichels.has(heichelIdOf(item))) return false;
	if (f.topics.size) {
		const ts = new Set(topicsOf(item));
		let hit = false;
		for (const t of f.topics) if (ts.has(t)) { hit = true; break; }
		if (!hit) return false;
	}
	return true;
}

/** Query params for the server (best effort — the server may ignore them). */
export function filterQueryParams(f) {
	const qs = {};
	if (f.authors.size) qs.authors = [...f.authors].join(',');
	if (f.heichels.size) qs.heichels = [...f.heichels].join(',');
	if (f.topics.size) qs.topics = [...f.topics].join(',');
	return qs;
}

/* ============ panel rendering ============ */

function facetSectionHtml(kind, title, facets, selected, iconName) {
	if (!facets.length) return '';
	const rows = facets.map(f => {
		const checked = selected.has(f.id) ? ' checked' : '';
		const themeBtn = kind === 'heichel'
			? `<button type="button" class="feed-heichel-theme" data-heichel="${escapeAttr(f.id)}" title="Heichel theme" aria-label="Theme for ${escapeAttr(f.name)}"><span class="feed-heichel-theme-dot" aria-hidden="true"></span></button>`
			: '';
		return `<label class="feed-filter-row">
			<input type="checkbox" data-filter-kind="${kind}" value="${escapeAttr(f.id)}"${checked}>
			<span class="feed-filter-check" aria-hidden="true">${icon('check', 'feed-filter-check-ic')}</span>
			<span class="feed-filter-name">${escapeHtml(f.name)}</span>
			<span class="feed-filter-count">${f.count}</span>
			${themeBtn}
		</label>`;
	}).join('');
	return `<section class="feed-filter-section" data-section="${kind}">
		<h3 class="feed-filter-title">${icon(iconName, 'feed-filter-title-ic')}<span>${escapeHtml(title)}</span></h3>
		<div class="feed-filter-rows">${rows}</div>
	</section>`;
}

export function filterPanelHtml(facets, filters) {
	return `
	<div class="feed-filter-head">
		<h2 class="feed-filter-head-title">${icon('filter', 'feed-filter-title-ic')}<span>Refine the river</span></h2>
		<button type="button" class="feed-ic-btn feed-filter-clear" data-clear-filters aria-label="Clear all filters">${icon('close')}<span class="feed-ic-btn-label">Clear</span></button>
	</div>
	<div class="feed-filter-body">
		${facetSectionHtml('authors', 'Authors', facets.authors, filters.authors, 'users')}
		${facetSectionHtml('heichel', 'Heichelos', facets.heichels, filters.heichels, 'home')}
		${facetSectionHtml('topics', 'Topics', facets.topics, filters.topics, 'spark')}
		${!facets.authors.length && !facets.heichels.length && !facets.topics.length
			? '<p class="feed-filter-empty">Facets appear once posts load.</p>' : ''}
	</div>
	<p class="feed-filter-hint">Heichel theme dots set that heichel's default reading theme.</p>`;
}

/** Theme swatch popup for one heichel row. */
function heichelThemePopup(heichelId, heichelName) {
	const current = getHeichelTheme(heichelId);
	const opts = [`<button type="button" class="feed-menu-item" data-heichel-theme-val="" data-heichel="${escapeAttr(heichelId)}">
		<span class="feed-menu-check">${!current ? icon('check') : ''}</span><span>Feed default</span></button>`];
	for (const t of THEMES) {
		const [c1, c2] = t.swatch;
		opts.push(`<button type="button" class="feed-menu-item" data-heichel-theme-val="${t.id}" data-heichel="${escapeAttr(heichelId)}">
			<span class="feed-menu-check">${current === t.id ? icon('check') : ''}</span>
			<span class="feed-theme-swatch" style="background:linear-gradient(135deg, ${c1} 50%, ${c2} 50%)" aria-hidden="true"></span>
			<span>${escapeHtml(t.name)}</span></button>`);
	}
	return `<div class="feed-menu feed-heichel-theme-menu" role="menu" aria-label="Theme for ${escapeAttr(heichelName)}">
		<p class="feed-menu-head">Theme for ${escapeHtml(heichelName)}</p>${opts.join('')}</div>`;
}

let openMenu = null;
function closeMenu() {
	if (openMenu) { openMenu.remove(); openMenu = null; }
	document.removeEventListener('click', onDocClick, true);
	document.removeEventListener('keydown', onDocKey);
}
function onDocClick(e) {
	if (openMenu && !openMenu.contains(e.target) && !e.target.closest('[data-heichel-theme-open]')) closeMenu();
}
function onDocKey(e) {
	if (e.key === 'Escape') closeMenu();
}

/**
 * Wires the filter panel: checkbox changes, clear button, heichel theme dots.
 * @param {HTMLElement} panel
 * @param {object} api {getFacets, getFilters, onChange}
 */
export function wireFilterPanel(panel, api) {
	panel.addEventListener('change', (event) => {
		const input = event.target.closest('input[data-filter-kind]');
		if (!input) return;
		const f = api.getFilters();
		const kind = input.dataset.filterKind;
		const set = kind === 'authors' ? f.authors : kind === 'heichel' ? f.heichels : f.topics;
		if (input.checked) set.add(input.value);
		else set.delete(input.value);
		saveFilters(f);
		api.onChange();
	});
	panel.addEventListener('click', (event) => {
		if (event.target.closest('[data-clear-filters]')) {
			const f = api.getFilters();
			clearFilters(f);
			panel.querySelectorAll('input[data-filter-kind]').forEach(i => { i.checked = false; });
			api.onChange();
			return;
		}
		const themeBtn = event.target.closest('.feed-heichel-theme');
		if (themeBtn) {
			event.stopPropagation();
			closeMenu();
			const hid = themeBtn.dataset.heichel;
			const name = themeBtn.closest('.feed-filter-row')?.querySelector('.feed-filter-name')?.textContent || hid;
			const menu = document.createElement('div');
			menu.innerHTML = heichelThemePopup(hid, name);
			const inner = menu.firstElementChild;
			themeBtn.closest('.feed-filter-row')?.append(inner);
			inner.querySelectorAll('[data-heichel-theme-val]').forEach(btn => {
				btn.addEventListener('click', (ev) => {
					ev.stopPropagation();
					const val = btn.dataset.heichelThemeVal || null;
					setHeichelTheme(btn.dataset.heichel, val);
					closeMenu();
					api.onChange(true);
				});
			});
			openMenu = inner;
			themeBtn.setAttribute('data-heichel-theme-open', '1');
			document.addEventListener('click', onDocClick, true);
			document.addEventListener('keydown', onDocKey);
			return;
		}
	});
}

/** Repaints the panel facets without losing scroll position. */
export function repaintFilterPanel(panel, facets, filters) {
	const scroll = panel.querySelector('.feed-filter-body')?.scrollTop || 0;
	panel.innerHTML = filterPanelHtml(facets, filters);
	const body = panel.querySelector('.feed-filter-body');
	if (body) body.scrollTop = scroll;
	paintHeichelThemeDots(panel);
}

/** Colors each heichel theme dot with its current theme. */
export function paintHeichelThemeDots(root = document) {
	root.querySelectorAll('.feed-heichel-theme').forEach(btn => {
		const t = themeById(getHeichelTheme(btn.dataset.heichel));
		const dot = btn.querySelector('.feed-heichel-theme-dot');
		if (!dot) return;
		if (t) {
			dot.style.background = `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`;
			dot.classList.add('is-set');
		} else {
			dot.style.background = '';
			dot.classList.remove('is-set');
		}
	});
}
