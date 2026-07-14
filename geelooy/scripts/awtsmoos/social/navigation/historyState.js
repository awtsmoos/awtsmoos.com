// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHybridHistory
 * @description
 * Browser history remains the honest memory of Awtsmoos.com. The Awtsmoos gives
 * each enhanced entry its own URL and scroll coordinate without owning the web.
 */

const STATE_KEY = 'geelooyHybrid';
const boundViews = new WeakSet();
let sequence = 0;

/** Ensures the directly loaded page has a history entry with scroll memory. */
export function initializeHistory(view = window) {
	const state = objectState(view.history.state);
	if (!state[STATE_KEY]) {
		state[STATE_KEY] = createEntry(view.location.href, currentScroll(view));
		view.history.replaceState(state, '', view.location.href);
	}
	bindScrollTracking(view);
}

/** Captures the current entry before a forward hybrid navigation. */
export function saveCurrentHistoryScroll(view = window) {
	const state = objectState(view.history.state);
	const prior = state[STATE_KEY] || createEntry(view.location.href, currentScroll(view));
	state[STATE_KEY] = { ...prior, url: view.location.href, scroll: currentScroll(view) };
	view.history.replaceState(state, '', view.location.href);
}

/** Pushes a real URL only after its replacement content has been validated. */
export function pushRouteHistory(url, view = window) {
	view.history.pushState({
		[STATE_KEY]: createEntry(String(url), { x: 0, y: 0 })
	}, '', String(url));
}

/** Reads a finite scroll coordinate from a traversed history state. */
export function scrollFromHistory(state) {
	const scroll = state?.[STATE_KEY]?.scroll;
	if (!Number.isFinite(scroll?.x) || !Number.isFinite(scroll?.y)) return null;
	return { x: scroll.x, y: scroll.y };
}

function bindScrollTracking(view) {
	if (boundViews.has(view)) return;
	boundViews.add(view);
	let frame = 0;
	view.addEventListener('scroll', () => {
		if (frame) return;
		frame = view.requestAnimationFrame(() => {
			frame = 0;
			saveCurrentHistoryScroll(view);
		});
	}, { passive: true });
}

function createEntry(url, scroll) {
	sequence += 1;
	return { key: `${Date.now()}-${sequence}`, url: String(url), scroll };
}

function currentScroll(view) {
	return { x: view.scrollX || 0, y: view.scrollY || 0 };
}

function objectState(value) {
	return value && typeof value === 'object' ? { ...value } : {};
}
