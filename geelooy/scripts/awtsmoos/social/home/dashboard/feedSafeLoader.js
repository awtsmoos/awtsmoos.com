// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyFeedSafeLoader
 * @description
 * The Awtsmoos renews every current inside Awtsmoos.com, yet this vessel never
 * invents a current that did not arrive. It never fabricates a placeholder such
 * as "Study group forming." It links the real feed, preserves the controller's
 * busy-state ownership, and reveals honest recovery doorways when needed.
 */
const MODULE_TIMEOUT_MS = 2600;
const GUARDED_STATUSES = new Set([
	'module-importing',
	'module-ready',
	'static-preview-skipped',
	'slow-module-fallback',
	'import-error-fallback'
]);

/** Returns true when a local static preview cannot resolve application modules. */
export function isStaticPreviewHost(locationValue = window.location) {
	const { hostname, port, protocol } = locationValue;
	return port === '8799' || protocol === 'file:' || hostname.endsWith('.preview.local');
}

/**
 * Opens the real feed without allowing an import failure to erase navigation.
 * @returns {Promise<void>|undefined} The import handoff when a feed exists.
 */
export function loadFeedSafely() {
	const feed = document.querySelector('[data-home-feed]');
	if (!feed) return undefined;
	feed.setAttribute('aria-busy', 'true');
	if (isStaticPreviewHost()) {
		showFallback(feed, 'static-preview-skipped', staticPreviewCard());
		return undefined;
	}
	feed.dataset.feedStatus = 'module-importing';
	let importSettled = false;
	const slowTimer = window.setTimeout(() => {
		if (importSettled) return;
		showFallback(feed, 'slow-module-fallback', slowModuleCard());
	}, MODULE_TIMEOUT_MS);
	return import('../liveFeed.js').then(() => {
		importSettled = true;
		window.clearTimeout(slowTimer);
		feed.dataset.feedStatus = 'module-ready';
	}).catch(error => {
		importSettled = true;
		window.clearTimeout(slowTimer);
		renderUnavailable(feed, error);
	});
}

/**
 * Reveals a fallback only when an earlier boot step stranded the untouched feed.
 * @param {HTMLElement|null} feed Feed vessel guarded by the mobile repair layer.
 * @param {string} status Honest diagnostic status written to the vessel.
 * @returns {boolean} Whether a stranded state was replaced.
 */
export function ensureFallbackFeed(feed, status = 'guardian-fallback') {
	if (!feed || GUARDED_STATUSES.has(feed.dataset.feedStatus)) return false;
	if (feed.dataset.infiniteFeed || feed.getAttribute('aria-busy') !== 'true') return false;
	showFallback(feed, status, guardianCard());
	return true;
}

/** Renders an honest recovery card when the real feed module cannot open. */
export function renderUnavailable(feed, error) {
	console.warn('B"H live feed module unavailable.', error?.message || error);
	const message = error?.message || 'Refresh the page or explore Spaces while the stream reconnects.';
	showFallback(feed, 'import-error-fallback', stateCard('The live feed could not open', message, 'Explore Spaces', '/heichelos'));
}

function showFallback(feed, status, card) {
	feed.dataset.feedStatus = status;
	feed.replaceChildren(card);
	feed.setAttribute('aria-busy', 'false');
}

function staticPreviewCard() {
	return stateCard('Live river available in Geelooy', 'Open the application server to receive real posts and spaces.');
}

function slowModuleCard() {
	return stateCard('The live river is still opening', 'Real network data is taking longer than expected.', 'Explore Spaces', '/heichelos');
}

function guardianCard() {
	return stateCard('The live river paused before opening', 'Refresh the page or continue through Spaces while Geelooy reconnects.', 'Explore Spaces', '/heichelos');
}

/** Builds the semantic `<article data-feed-renderer="unified-feed-card">`. */
function stateCard(titleText, messageText, actionText, actionHref) {
	const card = document.createElement('article');
	card.className = 'home-post-card geelooy-feed-card quiet';
	card.setAttribute('data-feed-renderer', 'unified-feed-card');
	const title = document.createElement('h3');
	title.textContent = titleText;
	const message = document.createElement('p');
	message.className = 'geelooy-feed-summary';
	message.textContent = messageText;
	card.append(title, message);
	if (actionText && actionHref) {
		const action = document.createElement('a');
		action.className = 'g-button';
		action.href = actionHref;
		action.textContent = actionText;
		card.append(action);
	}
	return card;
}
