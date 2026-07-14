// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module InfiniteFeed
 * @description
 * Coordinates truthful, loader-driven pagination. The Awtsmoos may reveal more
 * observed posts through Awtsmoos.com, but this vessel never invents people,
 * comments, reactions, or stories merely to make a quiet feed look busy.
 */

/**
 * Creates an infinite-feed coordinator around real objects.
 * @param {object} options Configuration.
 * @param {Array<object>} [options.initial] Already rendered objects.
 * @param {(context: object) => Promise<Array<object>>} [options.loadNext] Real page loader.
 * @param {(items: Array<object>, context: object) => void} [options.render] Append renderer.
 * @param {(all: Array<object>, next: Array<object>) => void} [options.onAppend] State callback.
 * @returns {object} Feed state and controls.
 */
export function createInfiniteFeed({ initial = [], loadNext, render, onAppend } = {}) {
	const state = {
		objects: uniqueObjects(initial),
		page: 0,
		loading: false,
		done: typeof loadNext !== 'function',
		sentinel: null,
		observer: null
	};
	async function appendNext(reason = 'manual') {
		if (state.loading || state.done) return [];
		state.loading = true;
		setStatus(state.sentinel, 'Loading more live posts…', true);
		try {
			const loaded = await loadNext({
				page: state.page + 1,
				reason,
				seenIds: state.objects.map(objectId).filter(Boolean)
			});
			const next = uniqueObjects(loaded).filter(item => !hasObject(state.objects, item));
			if (!next.length) {
				finish(state);
				return [];
			}
			state.page += 1;
			state.objects.push(...next);
			render?.(next, { append: true, page: state.page, reason });
			onAppend?.([...state.objects], next);
			setStatus(state.sentinel, 'Load more live posts', false);
			return next;
		} catch (error) {
			setStatus(state.sentinel, error?.message || 'More posts could not be loaded.', false);
			throw error;
		} finally {
			state.loading = false;
		}
	}
	function attach(root) {
		if (!root || state.sentinel) return;
		state.sentinel = createSentinel(state.done);
		root.append(state.sentinel);
		if (state.done) return;
		state.sentinel.addEventListener('click', () => appendNext('click'));
		if ('IntersectionObserver' in window) {
			state.observer = new IntersectionObserver(entries => {
				if (entries.some(entry => entry.isIntersecting)) appendNext('observer');
			}, { root: null, threshold: 0, rootMargin: '600px 0px 600px 0px' });
			state.observer.observe(state.sentinel);
		}
	}
	function destroy() {
		state.observer?.disconnect();
		state.sentinel?.remove();
		state.observer = null;
		state.sentinel = null;
	}
	return { state, attach, appendNext, destroy };
}

function createSentinel(done) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = 'geelooy-feed-sentinel';
	element.dataset.infiniteFeedSentinel = 'true';
	element.disabled = done;
	element.textContent = done ? 'You are caught up' : 'Load more live posts';
	return element;
}

function finish(state) {
	state.done = true;
	state.observer?.disconnect();
	if (state.sentinel) state.sentinel.disabled = true;
	setStatus(state.sentinel, 'You are caught up', false);
}

function setStatus(element, text, busy) {
	if (!element) return;
	element.textContent = text;
	element.setAttribute('aria-busy', String(busy));
}

function uniqueObjects(items) {
	const unique = new Map();
	for (const item of Array.isArray(items) ? items : []) {
		const id = objectId(item);
		if (id) unique.set(id, item);
	}
	return [...unique.values()];
}

function hasObject(items, candidate) {
	const wanted = objectId(candidate);
	return Boolean(wanted && items.some(item => objectId(item) === wanted));
}

function objectId(item) {
	return String(item?.id || item?.postId || item?.contentId || '').trim();
}
