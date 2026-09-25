// B"H
// Boruch Hashem
// Blessed is He
/** Reveals remembered routes and shortcut/account help inside the existing search lens. */
import { favoriteRoutes, recentRoutes } from './routeMemory.js';

export function createPowerSuggestions(documentRoot, query) {
	const normalized = String(query || '').trim().toLowerCase();
	if (normalized === '?') return createHelpSection(documentRoot);
	if (normalized) return null;
	const favorites = favoriteRoutes().slice(0, 4);
	const recents = recentRoutes().filter(route => !favorites.some(item => item.href === route.href)).slice(0, 4);
	if (!favorites.length && !recents.length) return createFirstRunSection(documentRoot);
	const section = documentRoot.createElement('section');
	section.className = 'g-search-power-results';
	section.append(createHeading(documentRoot, 'Remembered places'));
	for (const route of [...favorites, ...recents]) {
		section.append(createRouteLink(documentRoot, route, favorites.includes(route) ? 'Favorite' : 'Recent'));
	}
	return section;
}

function createHelpSection(documentRoot) {
	const section = documentRoot.createElement('section');
	section.className = 'g-search-power-results';
	section.append(createHeading(documentRoot, 'Shortcuts & account'));
	const rows = [
		['⌘/Ctrl + K or /', 'Focus this search doorway', '#'],
		['⌘/Ctrl + Shift + F', 'Favorite or unfavorite this route', '#'],
		['Profile', 'Identity, aliases, and settings', '/profile'],
		['Signals', 'Notifications and activity', '/notifications'],
		['Sign out', 'End the current browser session safely', '/logout']
	];
	for (const [label, description, href] of rows) section.append(createAction(documentRoot, label, description, href));
	return section;
}

function createFirstRunSection(documentRoot) {
	const section = documentRoot.createElement('section');
	section.className = 'g-search-power-results';
	section.append(createHeading(documentRoot, 'Power without clutter'));
	section.append(createAction(documentRoot, '?', 'Show keyboard shortcuts and account actions', '#'));
	return section;
}

function createHeading(documentRoot, text) {
	const heading = documentRoot.createElement('strong');
	heading.className = 'g-search-power-heading';
	heading.textContent = text;
	return heading;
}

function createRouteLink(documentRoot, route, kind) {
	return createAction(documentRoot, `${route.icon} ${route.label}`, `${kind} · ${route.description}`, route.href);
}

function createAction(documentRoot, label, description, href) {
	const link = documentRoot.createElement('a');
	link.href = href;
	link.dataset.searchResult = 'power';
	link.className = 'g-search-power-link';
	const title = documentRoot.createElement('strong');
	title.textContent = label;
	const detail = documentRoot.createElement('small');
	detail.textContent = description;
	link.append(title, detail);
	return link;
}
