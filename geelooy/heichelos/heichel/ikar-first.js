//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IkarFirst
 * @description
 * The Awtsmoos lets server-rendered Torah geometry remain the living product;
 * Awtsmoos.com enhances that same navigation and discovery without replacing first paint.
 */

import { installIkarSearch } from './ikar-search.js?v=ikar-search-001';

const IKAR_ROOT = '/heichelos/ikar';

/** Enhances the semantic Ikar document in place. */
export function boot() {
	if (!isIkarRoute()) return;

	const root = document.querySelector('[data-heichel-semantic-fallback]');
	if (!root) return;

	document.body.dataset.heichelId = 'ikar';
	document.body.dataset.heichelReady = 'true';
	document.documentElement.dataset.heichelExperience = 'torah-first';
	root.classList.add('ikar-first');
	root.dataset.ikarFirst = 'ready';

	installNavigation(root);

	const discovery = root.querySelector('.heichel-semantic-discovery');
	if (discovery) enhanceDiscovery(root, discovery);

	// B"H — Daily Chitas is a virtual series (not in the API). The full
	// navigator never boots on Ikar's stable path, so mount the chitas
	// study directly here when the URL targets it.
	if (isDailyChitasRoute()) {
		void mountDailyChitas(root, discovery);
	}
}

/** Returns whether the current URL targets the Daily Chitas virtual series. */
function isDailyChitasRoute() {
	const parts = location.pathname.split('/').filter(Boolean);
	const idx = parts.indexOf('series');
	return idx >= 0 && decodeURIComponent(parts[idx + 1] || '') === 'daily-chitas';
}

/**
 * B"H — mounts the Daily Chitas study (Chumash + Tanya + Tehillim) on the
 * virtual series page. Loads the chitas modules on demand so the stable
 * Ikar bundle stays lean for every other page.
 */
async function mountDailyChitas(root, discovery) {
	// Mark the mount point so a retry never duplicates the study.
	if (root.querySelector('[data-chitas-daily-mount]')) return;
	const mount = document.createElement('div');
	mount.setAttribute('data-chitas-daily-mount', 'true');
	// Place the study before the (empty) discovery list for virtual series.
	if (discovery && discovery.parentNode === root) {
		root.insertBefore(mount, discovery);
	} else {
		root.append(mount);
	}
	try {
		const [{ loadChitasVirtualSeries }, { renderChitasWeek }] = await Promise.all([
			import('./modules/chitas/virtual-series.js?v=native-chitas-003'),
			import('./modules/ui/render/living-path/chitas-week.js?v=native-chitas-004')
		]);
		const virtual = await loadChitasVirtualSeries();
		const appState = {
			heichelId: 'ikar',
			currentSeriesData: virtual.seriesData,
			currentContent: virtual.content
		};
		renderChitasWeek(
			virtual.content?.posts || [],
			mount,
			null,
			appState
		);
		mount.setAttribute('data-chitas-daily-ready', 'true');
	} catch (error) {
		console.error('B"H — Daily Chitas mount failed:', error);
		mount.remove();
	}
}

/** Returns whether the current document belongs to the public Ikar library. */
function isIkarRoute() {
	return location.pathname === IKAR_ROOT
		|| location.pathname.startsWith(`${IKAR_ROOT}/`);
}

/** Reuses server navigation and creates it only when fallback markup is absent. */
function installNavigation(root) {
	const existing = root.querySelector('[data-ikar-stable-navigation], .ikar-first-actions');
	if (existing) return existing;

	const navigation = document.createElement('nav');
	navigation.className = 'ikar-first-actions';
	navigation.dataset.ikarStableNavigation = '';
	navigation.setAttribute('aria-label', 'Torah navigation');
	navigation.append(
		createLink('/', 'Home'),
		createSeparator(),
		createLink(IKAR_ROOT, 'Torah Library', location.pathname === IKAR_ROOT)
	);
	root.append(navigation);
	return navigation;
}

/** Builds one same-origin anchor and marks the exact active Torah surface. */
function createLink(href, label, isCurrent = false) {
	const link = document.createElement('a');
	link.href = href;
	link.textContent = label;
	if (isCurrent) link.setAttribute('aria-current', 'page');
	return link;
}

/** Builds the visible separator between Torah breadcrumb links. */
function createSeparator() {
	const separator = document.createElement('span');
	separator.className = 'ikar-first-separator';
	separator.setAttribute('aria-hidden', 'true');
	separator.textContent = ' / ';
	return separator;
}

/** Rewords discovery and attaches filtering to the already-painted search vessel. */
function enhanceDiscovery(root, discovery) {
	discovery.setAttribute('aria-label', 'Torah library');

	const heading = discovery.querySelector('h2');
	if (heading) {
		heading.textContent = location.pathname === IKAR_ROOT
			? 'Choose what to learn'
			: 'Choose a section';
	}

	const items = [...discovery.querySelectorAll('li')];
	updateReadyStatus(root, items.length);

	// B"H — resolve raw post IDs (e.g. "BH_POST_...") into human-readable
	// titles. Runs async after paint; never blocks rendering.
	resolvePostTitles(discovery, items);

	if (items.length >= 8) {
		installIkarSearch(root, discovery, items);
	}
}

/**
 * B"H — replaces raw post-ID labels with real titles.
 * Server-rendered series lists sometimes carry the post ID as the link text;
 * this upgrades them to human-readable titles without blocking first paint.
 */
function resolvePostTitles(discovery, items) {
	const links = items
		.map(li => li.querySelector('a'))
		.filter(a => a && /^BH_POST_[A-Za-z0-9_]+$/.test(a.textContent.trim()));
	if (!links.length) return;

	// Instant fallback: derive a readable label from the post ID so the user
	// never stares at a raw ID, even if the title fetch fails.
	for (const a of links) {
		const id = a.textContent.trim();
		const seq = id.match(/_(\d+)$/);
		a.textContent = seq ? `Teaching ${seq[1]}` : 'Teaching';
		a.dataset.rawPostId = id;
	}

	// Upgrade to real titles when the API responds.
	const pathParts = location.pathname.split('/').filter(Boolean);
	const seriesIdx = pathParts.indexOf('series');
	const seriesId = seriesIdx >= 0 ? decodeURIComponent(pathParts[seriesIdx + 1]) : null;
	const heichelIdx = pathParts.indexOf('heichelos');
	const heichelId = heichelIdx >= 0 ? decodeURIComponent(pathParts[heichelIdx + 1]) : 'ikar';
	if (!seriesId) return;

	fetch(`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/posts`, { cache: 'force-cache' })
		.then(r => r.ok ? r.json() : null)
		.then(data => {
			if (!data) return;
			const byId = Array.isArray(data)
				? Object.fromEntries(data.map(p => [p.postId || p.id, p]))
				: data;
			for (const a of links) {
				const id = a.dataset.rawPostId;
				const title = byId?.[id]?.title;
				if (title && title !== id) a.textContent = title;
			}
		})
		.catch(() => { /* fallback labels already in place */ });
}

/** Replaces transitional language with a truthful count from server-rendered links. */
function updateReadyStatus(root, count) {
	const status = root.querySelector('[role="status"]');
	if (!status) return;

	status.textContent = `${count} Torah ${count === 1 ? 'pathway' : 'pathways'} ready.`;
}
