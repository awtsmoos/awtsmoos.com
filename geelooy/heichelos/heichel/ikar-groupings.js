//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IkarGroupings
 * @description
 * The Awtsmoos lets Ikar's server Torah stay the visible vessel, yet the
 * alternate groupings the import side registered must be reachable.
 * Awtsmoos.com mounts one small Collections tab onto the server-rendered
 * discovery list.
 *
 * Root cause it answers (batch 35): the full living navigator — the only
 * code that manifests the Timeline/Tree/Groupings tab bar and honors
 * ?view=groupings — never boots on Ikar's stable path. critical-boot.js
 * loads ikar-stable.js for every /heichelos/ikar/* route, and ikar-stable
 * only enhances the server fallback in place (ikar-first.js). So the
 * Groupings tab had no owner and ?view=groupings was never read by any
 * running code. This mount is the small owner: it fetches the live
 * alternateGroups, renders the Collections tab beside the existing list,
 * and honors ?view=groupings — without waking the full navigator or
 * replacing the server fallback. No By Volume category is invented:
 * volumes are the series' native subseries, already the default list.
 * Group pages are ordinary series pages and already work; this mount
 * only links to them, it never renders members itself.
 */

const SPECIAL_SERIES_WITHOUT_GROUPINGS = new Set(['daily-chitas', 'torah-language-tools']);
const STYLE_ID = 'ikar-groupings-style';

/** Returns the series id from the path, or 'root' for the Ikar root. */
function currentSeriesId() {
	const parts = location.pathname.split('/').filter(Boolean);
	const idx = parts.indexOf('series');
	if (idx >= 0 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]);
	return 'root';
}

function seriesApi(seriesId) {
	return `/api/social/heichelos/ikar/series/${encodeURIComponent(seriesId)}`;
}

/** Fetches JSON, returning null on any transport or parse failure. */
async function fetchJson(url) {
	try {
		const res = await fetch(url, { headers: { Accept: 'application/json' } });
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

function isPostHref(href) {
	return href.includes('/post/');
}

function isSeriesHref(href) {
	return href.includes('/series/');
}

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined && text !== null) node.textContent = text;
	return node;
}

/** Injects the mount's small scoped stylesheet exactly once. */
function injectStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = [
		/* B"H batch 36 (2026-11-12): explicit ink everywhere — batch 35 used
		   color:inherit / currentColor, and the series pages inherit a
		   near-white pale blue, so the tab and the whole panel rendered
		   barely legible on cream while the identical component reads dark
		   navy on the ikar root. Dark navy / sefer ink on cream here; the
		   dark-theme overrides keep it legible there too. */
		'.ikar-groupings-tabs{display:flex;flex-wrap:wrap;gap:.15rem;margin:0 0 .6rem;color:#1e2a4a}',
		'.ikar-groupings-tabs button{appearance:none;background:none;border:0;border-bottom:2px solid transparent;padding:.45rem .7rem;font:inherit;cursor:pointer;color:#1e2a4a}',
		'.ikar-groupings-tabs button[aria-selected="true"]{border-bottom-color:#1e2a4a;font-weight:600}',
		'.ikar-groupings-panel{color:#1e2a4a}',
		'.ikar-groupings-panel h2{color:#1e2a4a}',
		'.ikar-groupings-category{margin:0 0 1.4rem}',
		'.ikar-groupings-category h3{margin:0 0 .15rem;color:#2b2118}',
		'.ikar-groupings-category p{margin:0 0 .55rem;color:#5a4f3a}',
		'.ikar-groupings-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr));gap:.5rem;list-style:none;margin:0;padding:0}',
		'.ikar-groupings-grid a{display:block;padding:.55rem .7rem;border:1px solid #d9c9a8;border-radius:.5rem;text-decoration:none;color:#1e2a4a;background:#fffdf6}',
		'.ikar-groupings-count{display:block;font-size:.85em;color:#5a4f3a}',
		'[data-theme="dark"] .ikar-groupings-panel,[data-theme="dark"] .ikar-groupings-tabs,[data-theme="dark"] .ikar-groupings-tabs button,[data-theme="dark"] .ikar-groupings-panel h2,[data-theme="dark"] .ikar-groupings-category h3{color:#f0e7d3}',
		'[data-theme="dark"] .ikar-groupings-tabs button[aria-selected="true"]{border-bottom-color:#f0e7d3}',
		'[data-theme="dark"] .ikar-groupings-category p,[data-theme="dark"] .ikar-groupings-count{color:#cfc4a8}',
		'[data-theme="dark"] .ikar-groupings-grid a{color:#f0e7d3;background:#2b2118;border-color:#6b5a34}'
	].join('\n');
	document.head.appendChild(style);
}

/**
 * Mounts the Collections tab for the current Ikar series or root.
 * Does nothing when the branch has no alternate groups, so group-less
 * pages keep exactly the rendering they have today.
 */
export async function mountIkarGroupings() {
	const root = document.querySelector('[data-heichel-semantic-fallback]');
	if (!root || root.dataset.ikarGroupingsMounted === 'true') return;
	if (location.pathname.includes('/post/')) return;
	const seriesId = currentSeriesId();
	if (SPECIAL_SERIES_WITHOUT_GROUPINGS.has(seriesId)) return;
	root.dataset.ikarGroupingsMounted = 'true';

	const data = await fetchJson(`${seriesApi(seriesId)}/alternateGroups?details=true`);
	if (!Array.isArray(data) || !data.length) return;
	const categories = data;

	injectStyles();

	const discovery = root.querySelector('.heichel-semantic-discovery');
	const items = discovery
		? [...discovery.querySelectorAll('#heichel-discovery-list > li')]
		: [];
	const itemHref = li => li.querySelector('a')?.getAttribute('href') || '';
	const hasPosts = items.some(li => isPostHref(itemHref(li)));
	const hasSeries = items.some(li => isSeriesHref(itemHref(li)));

	const panel = el('section', 'ikar-groupings-panel');
	panel.id = 'ikar-groupings-panel';
	panel.setAttribute('aria-label', 'Collections');
	panel.hidden = true;
	panel.append(el('h2', null, 'Collections'));
	const loading = el('p', 'ikar-groupings-loading', 'Loading collections…');
	panel.append(loading);

	const buttons = {};
	let tabs = null;
	if (discovery) {
		tabs = el('nav', 'ikar-groupings-tabs');
		tabs.setAttribute('role', 'tablist');
		tabs.setAttribute('aria-label', 'Browse this branch');
		const tabDefs = [];
		if (hasPosts) tabDefs.push({ view: 'posts', label: 'Teachings' });
		if (hasSeries) tabDefs.push({ view: 'series', label: 'Torah Library' });
		tabDefs.push({ view: 'groupings', label: 'Collections' });
		for (const def of tabDefs) {
			const button = el('button', null, def.label);
			button.type = 'button';
			button.setAttribute('role', 'tab');
			button.setAttribute('aria-selected', 'false');
			button.setAttribute('aria-controls', def.view === 'groupings' ? panel.id : 'heichel-discovery-list');
			button.addEventListener('click', () => setView(def.view));
			tabs.append(button);
			buttons[def.view] = button;
		}
		root.insertBefore(tabs, discovery);
		discovery.after(panel);
	} else {
		// No discovery list to tab against: show the collections directly.
		panel.hidden = false;
		root.append(panel);
	}

	function setView(view, { replaceUrl = true } = {}) {
		const active = buttons[view]
			? view
			: (hasPosts ? 'posts' : 'series');
		for (const [key, button] of Object.entries(buttons)) {
			button.setAttribute('aria-selected', String(key === active));
		}
		const showGroups = active === 'groupings';
		if (discovery) discovery.hidden = showGroups;
		panel.hidden = !showGroups;
		if (discovery && !showGroups) {
			for (const li of items) {
				const href = itemHref(li);
				li.hidden = active === 'posts' ? !isPostHref(href) : !isSeriesHref(href);
			}
		}
		if (replaceUrl) {
			const url = new URL(location.href);
			if (active === 'posts') url.searchParams.delete('view');
			else url.searchParams.set('view', active);
			history.replaceState(null, '', url);
		}
	}

	if (discovery) {
		const requested = new URLSearchParams(location.search).get('view');
		const initial = requested === 'groupings'
			? 'groupings'
			: (requested === 'series' && hasSeries)
				? 'series'
				: (requested === 'posts' && hasPosts)
					? 'posts'
					: (hasPosts ? 'posts' : 'series');
		setView(initial, { replaceUrl: false });
	}

	void loadCategories();

	/** Fills each category section with its groups (one light request each). */
	async function loadCategories() {
		try {
			const results = await Promise.all(categories.map(async category => ({
				category,
				groups: await fetchJson(`${seriesApi(category.id)}/subSeries?light=true`)
			})));
			loading.remove();
			for (const { category, groups } of results) {
				const section = el('section', 'ikar-groupings-category');
				section.append(el('h3', null, category.title || category.name || category.id));
				if (category.description) section.append(el('p', null, category.description));
				if (!Array.isArray(groups)) {
					section.append(el('p', 'ikar-groupings-note', 'Could not load this collection right now.'));
				} else if (!groups.length) {
					section.append(el('p', 'ikar-groupings-note', 'No groups in this collection yet.'));
				} else {
					const grid = el('ul', 'ikar-groupings-grid');
					for (const group of groups) {
						const id = group.id || group.seriesId;
						if (!id) continue;
						const li = el('li');
						const a = el('a', null, group.name || group.title || id);
						a.href = `/heichelos/ikar/series/${encodeURIComponent(id)}`;
						const count = typeof group.postsCount === 'number' ? group.postsCount : null;
						if (count !== null) {
							a.append(el('span', 'ikar-groupings-count', count === 1 ? '1 teaching' : `${count} teachings`));
						}
						li.append(a);
						grid.append(li);
					}
					section.append(grid);
				}
				panel.append(section);
			}
		} catch {
			loading.textContent = 'Collections could not load right now.';
		}
	}
}
