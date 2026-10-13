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

	// B"H — dream heichel: split bilingual titles, add category icons.
	if (location.pathname === IKAR_ROOT) {
		enhanceDreamCards(discovery, items);
	}

	// B"H — resolve raw post IDs (e.g. "BH_POST_...") into human-readable
	// titles. Runs async after paint; never blocks rendering.
	resolvePostTitles(discovery, items);

	if (items.length >= 8) {
		installIkarSearch(root, discovery, items);
	}
}

/**
 * B"H — Dream heichel card enhancement (Ikar root only).
 * Splits "עברית · English" link labels into luminous Hebrew + English spans,
 * and prefixes each card with its category icon. Icons are simple line SVGs;
 * never a menorah.
 */
function enhanceDreamCards(discovery, items) {
	const icons = {
		theWrittenTorah: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6"/><path d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2"/><path d="M9 8h7M9 12h7M9 16h5"/></svg>',
		theOralTorah: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 0 2 2h13"/><path d="M9 8h7"/></svg>',
		chassidus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 3-2 4.5-2 7a4 4 0 0 0 8 .5C18.5 7 14 6 12 3Z"/><path d="M12 21a7 7 0 0 1-7-7c0-2 1-3.5 2-5 .5 1.5 1.5 2 2.5 2C9 9 9 7 10 5c2 2 6 4.5 6 9a7 7 0 0 1-4 7Z"/></svg>',
		halacha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-2.5 6a3 3 0 0 0 5 0L5 7Z"/><path d="M19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z"/><path d="M8 21h8"/></svg>',
		midrash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2Z"/><path d="M12 6v14"/></svg>',
		kabbalah: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9Z"/></svg>',
		mussar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9Z"/></svg>',
		'torah-language-tools': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h9M8.5 3v2c0 3-2 5.5-4.5 7"/><path d="M6 9c1 2.5 3 4.5 5.5 5.5"/><path d="M13 21l4.5-10L22 21M14.8 17h5.4"/></svg>',
		'daily-chitas': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
	};
	const fallbackIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 0 2 2h13"/></svg>';

	for (const li of items) {
		const link = li.querySelector('a');
		if (!link || link.dataset.dreamEnhanced) continue;
		link.dataset.dreamEnhanced = 'true';

		// Split "עברית · English" into two spans.
		const raw = link.textContent.trim();
		const parts = raw.split(/\s*[·•|]\s*/);
		const titles = document.createElement('span');
		titles.className = 'dream-heichel-titles';
		if (parts.length >= 2) {
			const he = document.createElement('span');
			he.className = 'dream-heichel-he';
			he.lang = 'he';
			he.dir = 'rtl';
			he.textContent = parts[0];
			const en = document.createElement('span');
			en.className = 'dream-heichel-en';
			en.textContent = parts.slice(1).join(' · ');
			titles.append(he, en);
		} else {
			const en = document.createElement('span');
			en.className = 'dream-heichel-en';
			en.textContent = raw;
			titles.append(en);
		}
		link.textContent = '';
		link.append(titles);

		// Category icon from the href.
		const key = Object.keys(icons).find(k => link.getAttribute('href')?.includes(k));
		const icon = document.createElement('span');
		icon.className = 'dream-heichel-icon';
		icon.setAttribute('aria-hidden', 'true');
		icon.innerHTML = icons[key] || fallbackIcon;
		link.prepend(icon);

		// Chevron.
		const chevron = document.createElement('span');
		chevron.className = 'dream-heichel-chevron';
		chevron.setAttribute('aria-hidden', 'true');
		chevron.textContent = '›';
		link.append(chevron);
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
