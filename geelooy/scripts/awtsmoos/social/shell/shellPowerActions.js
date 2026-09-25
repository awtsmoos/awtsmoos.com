// B"H
// Boruch Hashem
// Blessed is He
/** Adds remembered routes, shortcut help, and connection truth without duplicate shell chrome. */
import { announceGeelooy } from './notifications.js';
import { focusHeaderSearch } from './headerSearch.js';
import { recordCurrentRoute, toggleFavoriteRoute } from './routeMemory.js';

const ONBOARDING_KEY = 'geelooy.shell.powerSeen.v1';

export function bindShellPowerActions(root = document) {
	recordCurrentRoute(root.location?.pathname || location.pathname);
	if (root.documentElement.dataset.shellPowerBound === 'true') return;
	root.documentElement.dataset.shellPowerBound = 'true';
	bindNetworkState(root);
	showFirstRunHint(root);
	root.addEventListener('keydown', event => handlePowerKey(event, root));
}

function handlePowerKey(event, root) {
	if (isTypingTarget(event.target)) return;
	if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
		event.preventDefault();
		openHelp(root);
		return;
	}
	if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
		event.preventDefault();
		const result = toggleFavoriteRoute(root.location?.pathname || location.pathname);
		if (result.route) announceGeelooy(`${result.favorite ? 'Favorited' : 'Unfavorited'} ${result.route.label}.`, 'success');
	}
}

function openHelp(root) {
	focusHeaderSearch();
	const input = root.querySelector('[data-header-search-input], [data-header-search] input[type="search"]');
	if (!input) return;
	input.value = '?';
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

function bindNetworkState(root) {
	const update = () => {
		const online = navigator.onLine !== false;
		root.documentElement.dataset.networkState = online ? 'online' : 'offline';
		announceGeelooy(online ? 'Connection restored.' : 'You are offline. Local work remains available.', online ? 'success' : 'warning');
	};
	root.defaultView?.addEventListener('online', update);
	root.defaultView?.addEventListener('offline', update);
	root.documentElement.dataset.networkState = navigator.onLine === false ? 'offline' : 'online';
}

function showFirstRunHint(root) {
	try {
		if (root.defaultView?.localStorage.getItem(ONBOARDING_KEY)) return;
		root.defaultView?.localStorage.setItem(ONBOARDING_KEY, '1');
		announceGeelooy('Tip: press ? for shortcuts, account actions, recents, and favorites.', 'info');
	} catch {
		// First-run persistence is optional when storage is unavailable.
	}
}

function isTypingTarget(target) {
	return Boolean(target?.matches?.('input, textarea, select, [contenteditable="true"]'));
}
