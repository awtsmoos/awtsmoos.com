// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosFeed
 * @description
 * Yaakov 2026-10-11: the river controller. Tabbed smart feeds (For You /
 * Following / Trending / Discover), offset-paginated infinite scroll with
 * skeleton shimmer and prefetch, client-side affinity re-rank, and a
 * built-in performance ledger (render ms, scroll fps, action latency) that
 * powers the benchmark harness.
 */

import { renderFeedCard, renderSkeleton, renderEmpty } from './cards.js';
import { icon } from './icons.js';
import { logActivity } from './activity.js';

const PAGE_SIZE = 14;
const PREFETCH_PAGES = 1;

const TABS = [
	{ id: 'home', label: 'For You', icon: 'spark', endpoint: 'home' },
	{ id: 'following', label: 'Following', icon: 'users', endpoint: 'discover' },
	{ id: 'trending', label: 'Trending', icon: 'flame', endpoint: 'trending' },
	{ id: 'discover', label: 'Discover', icon: 'compass', endpoint: 'discover' }
];

export const perfLedger = {
	renders: [],
	scrollSamples: [],
	actions: [],
	apiCalls: [],
	markRender(ms, count) { this.renders.push({ ms, count, at: Date.now() }); },
	markScroll(fps) { this.scrollSamples.push({ fps, at: Date.now() }); },
	markAction(kind, ms) { this.actions.push({ kind, ms, at: Date.now() }); },
	markApi(endpoint, ms, bytes) { this.apiCalls.push({ endpoint, ms, bytes, at: Date.now() }); },
	summary() {
		const avg = (arr, key) => arr.length ? arr.reduce((s, x) => s + x[key], 0) / arr.length : 0;
		return {
			renderAvgMs: +avg(this.renders, 'ms').toFixed(2),
			renderMaxMs: this.renders.length ? +Math.max(...this.renders.map(r => r.ms)).toFixed(2) : 0,
			cardsRendered: this.renders.reduce((s, r) => s + r.count, 0),
			scrollAvgFps: +avg(this.scrollSamples, 'fps').toFixed(1),
			actionAvgMs: +avg(this.actions, 'ms').toFixed(2),
			apiAvgMs: +avg(this.apiCalls, 'ms').toFixed(2),
			apiCalls: this.apiCalls.length
		};
	}
};

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

/**
 * Fetches one post's comment tree lazily, on user demand — never for the
 * whole river at once (Yaakov 2026-10-13: comments live in the store but the
 * feed never asked for them, so every card showed 0).
 * GET /api/social/heichelos/:heichel/posts/:post/comment-tree
 * @returns {Promise<{comments: Array, meta: object|null}>}
 */
export async function fetchCommentTree(heichelId, postId, { limit = 20, maxDepth = 4, replyLimit = 20 } = {}) {
	const qs = new URLSearchParams({
		limit: String(limit), maxDepth: String(maxDepth), replyLimit: String(replyLimit)
	});
	const t0 = performance.now();
	const res = await fetch(
		`/api/social/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}/comment-tree?${qs}`,
		{ credentials: 'same-origin' }
	);
	const ms = performance.now() - t0;
	if (!res.ok) throw new Error(`Comments answered ${res.status}`);
	const body = await res.json();
	perfLedger.markApi('comment-tree', ms, Number(res.headers.get('content-length')) || 0);
	const data = body?.success ?? body ?? {};
	const comments = Array.isArray(data) ? data : (Array.isArray(data.success) ? data.success : []);
	return { comments, meta: data && typeof data === 'object' ? (data.meta || null) : null };
}

/**
 * Posts a comment to a post, or a reply when parentCommentId is given.
 * POST /api/social/heichelos/:heichel/posts/:post/comment-tree (root)
 * POST /api/social/heichelos/:heichel/posts/:post/comments/:comment/replies
 */
export async function submitComment(heichelId, postId, parentCommentId, content, aliasId) {
	const base = `/api/social/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}`;
	const url = parentCommentId
		? `${base}/comments/${encodeURIComponent(parentCommentId)}/replies`
		: `${base}/comment-tree`;
	const t0 = performance.now();
	const res = await fetch(url, {
		method: 'POST',
		credentials: 'same-origin',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ content, aliasId: aliasId || currentAlias() })
	});
	perfLedger.markAction('comment-submit', performance.now() - t0);
	if (!res.ok) throw new Error(`Comment submit answered ${res.status}`);
	const body = await res.json().catch(() => null);
	return body?.success ?? body;
}

async function fetchFeed(endpoint, { limit, offset, aliasId }) {
	const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
	if (endpoint === 'home') qs.set('aliasId', aliasId);
	const t0 = performance.now();
	const res = await fetch(`/api/social/feed/${endpoint}?${qs}`, { credentials: 'same-origin' });
	const ms = performance.now() - t0;
	if (!res.ok) throw new Error(`Feed ${endpoint} answered ${res.status}`);
	const body = await res.json();
	const data = body?.success ?? body ?? {};
	perfLedger.markApi(endpoint, ms, Number(res.headers.get('content-length')) || 0);
	return {
		items: Array.isArray(data.items) ? data.items : [],
		nextOffset: data.nextOffset ?? null,
		total: data.total ?? null
	};
}

function clientRerank(items, aliasId, followedSet) {
	// Gentle client pass: followed voices float, seen posts sink.
	const seen = new Set(JSON.parse(sessionStorage.getItem('awtsmoos-feed-seen') || '[]'));
	return items
		.map(item => {
			let boost = 0;
			const alias = String(item.aliasId || item.author || '');
			if (followedSet.has(alias)) boost += 0.12;
			if (seen.has(String(item.postId || item.id))) boost -= 0.2;
			return { item, score: (item._rankScore || item._trendScore || 0) + boost };
		})
		.sort((a, b) => b.score - a.score)
		.map(x => x.item);
}

function rememberSeen(items) {
	try {
		const seen = new Set(JSON.parse(sessionStorage.getItem('awtsmoos-feed-seen') || '[]'));
		for (const it of items) seen.add(String(it.postId || it.id));
		sessionStorage.setItem('awtsmoos-feed-seen', JSON.stringify([...seen].slice(-600)));
	} catch (_) { /* private mode */ }
}

/* ============ activity tracking (Yaakov 2026-10-13) ============ */
/* B"H — every genuine reader action lands in the local activity record:
   reactions, comments, shares, saves, and posts actually viewed (50%+ of a
   card visible). Server sync is OFF — see activity.js for why. */

function activityDetail(item = {}) {
	return {
		targetType: 'post',
		targetId: String(item.postId || item.id || ''),
		targetTitle: String(item.title || item.heTitle || ''),
		url: ''
	};
}

function installViewObserver(state) {
	if (!('IntersectionObserver' in window) || state.viewObserver) return;
	state.viewObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
			const card = entry.target;
			try { state.viewObserver.unobserve(card); } catch (_) { /* noop */ }
			logActivity('view', {
				targetType: 'post',
				targetId: card.dataset?.postId || '',
				targetTitle: card.getAttribute('aria-label') || ''
			});
		}
	}, { threshold: 0.5 });
}

export function createFeedRiver({ river, sentinel, tabsEl, statusEl }) {
	const state = {
		tab: 'home',
		aliasId: currentAlias(),
		followed: new Set(),
		offset: 0,
		nextOffset: 0,
		loading: false,
		done: false,
		observer: null,
		skeletons: []
	};

	async function loadFollowed() {
		if (state.aliasId === 'anonymous') return;
		try {
			const res = await fetch(`/api/social/follows/${encodeURIComponent(state.aliasId)}?limit=200`, { credentials: 'same-origin' });
			const body = await res.json().catch(() => null);
			const list = body?.success ?? body ?? [];
			for (const f of (Array.isArray(list) ? list : [])) {
				const id = f.targetId || f.toAlias || f.to || f.id;
				if (id) state.followed.add(String(id));
			}
		} catch (_) { /* logged-out or offline */ }
	}

	function setStatus(text, busy) {
		if (!statusEl) return;
		statusEl.textContent = text;
		statusEl.setAttribute('aria-busy', String(!!busy));
		sentinel.disabled = !!busy || state.done;
	}

	function showSkeletons(n) {
		clearSkeletons();
		for (let i = 0; i < n; i++) {
			const sk = renderSkeleton();
			state.skeletons.push(sk);
			river.append(sk);
		}
	}

	function clearSkeletons() {
		for (const sk of state.skeletons) sk.remove();
		state.skeletons = [];
	}

	async function appendNext(reason) {
		if (state.loading || state.done) return;
		state.loading = true;
		setStatus('Loading more live posts…', true);
		showSkeletons(3);
		const tab = TABS.find(t => t.id === state.tab);
		try {
			const { items, nextOffset } = await fetchFeed(tab.endpoint, {
				limit: PAGE_SIZE, offset: state.nextOffset, aliasId: state.aliasId
			});
			clearSkeletons();
			if (!items.length) {
				state.done = true;
				if (!river.querySelector('.feed-card')) river.append(renderEmpty(''));
				setStatus('You are caught up', false);
				sentinel.textContent = 'You are caught up';
				return;
			}
			const ranked = state.tab === 'home' ? clientRerank(items, state.aliasId, state.followed) : items;
			const t0 = performance.now();
			const frag = document.createDocumentFragment();
			for (const item of ranked) {
				frag.append(renderFeedCard(item, {
					viewerAlias: state.aliasId,
					onReaction: (it, emoji, active) => {
						perfLedger.markAction('reaction', 0);
						logActivity('reaction', { ...activityDetail(it), emoji: emoji || '', removed: !active });
					},
					onSave: (it, on) => {
						perfLedger.markAction('save', 0);
						logActivity('save', { ...activityDetail(it), removed: !on });
					},
					onComment: (it) => {
						perfLedger.markAction('comment', 0);
						logActivity('comment', activityDetail(it));
					},
					onAction: (label, it) => {
						const a0 = performance.now();
						perfLedger.markAction(label, performance.now() - a0);
						if (label === 'Share') logActivity('share', activityDetail(it));
					},
					fetchComments: fetchCommentTree,
					submitComment
				}));
			}
			const newCards = [...frag.children];
			river.append(frag);
			for (const card of newCards) observeCardView(card);
			perfLedger.markRender(performance.now() - t0, ranked.length);
			rememberSeen(ranked);
			state.nextOffset = nextOffset ?? (state.nextOffset + ranked.length);
			if (nextOffset === null || ranked.length < PAGE_SIZE) state.done = true;
			setStatus(state.done ? 'You are caught up' : 'Scroll for more', false);
			// Prefetch one page ahead while idle.
			if (!state.done && 'requestIdleCallback' in window) {
				requestIdleCallback(() => prefetch(tab), { timeout: 4000 });
			}
		} catch (error) {
			clearSkeletons();
			setStatus(error.message || 'The river stalled. Tap to retry.', false);
		} finally {
			state.loading = false;
		}
	}

	const prefetchCache = new Map();
	async function prefetch(tab) {
		const key = `${tab.id}:${state.nextOffset}`;
		if (prefetchCache.has(key) || state.done) return;
		try {
			const page = await fetchFeed(tab.endpoint, { limit: PAGE_SIZE, offset: state.nextOffset, aliasId: state.aliasId });
			prefetchCache.set(key, page);
		} catch (_) { /* best effort */ }
	}

	function switchTab(id) {
		if (state.tab === id || state.loading) return;
		state.tab = id;
		state.offset = 0;
		state.nextOffset = 0;
		state.done = false;
		prefetchCache.clear();
		river.replaceChildren();
		tabsEl.querySelectorAll('[role="tab"]').forEach(el => {
			const active = el.dataset.tab === id;
			el.classList.toggle('is-active', active);
			el.setAttribute('aria-selected', String(active));
		});
		sentinel.textContent = 'Load more live posts';
		appendNext('tab');
	}

	function buildTabs() {
		tabsEl.setAttribute('role', 'tablist');
		for (const tab of TABS) {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'feed-tab' + (tab.id === state.tab ? ' is-active' : '');
			btn.dataset.tab = tab.id;
			btn.setAttribute('role', 'tab');
			btn.setAttribute('aria-selected', String(tab.id === state.tab));
			btn.innerHTML = `${icon(tab.icon)}<span>${tab.label}</span>`;
			btn.addEventListener('click', () => switchTab(tab.id));
			tabsEl.append(btn);
		}
	}

	/** Observes one card for the 50%-visible "view" activity event. */
	function observeCardView(card) {
		if (!card || !card.dataset || !card.dataset.postId) return;
		if (!state.viewObserver) return;
		try { state.viewObserver.observe(card); } catch (_) { /* observing must never break the river */ }
	}

	function watchScrollFps() {
		let frames = 0;
		let last = performance.now();
		let ticking = false;
		function loop(now) {
			frames++;
			if (now - last >= 1000) {
				perfLedger.markScroll(Math.round(frames * 1000 / (now - last)));
				frames = 0;
				last = now;
			}
			if (ticking) requestAnimationFrame(loop);
		}
		window.addEventListener('scroll', () => {
			if (!ticking) { ticking = true; requestAnimationFrame(loop); }
			clearTimeout(watchScrollFps._t);
			watchScrollFps._t = setTimeout(() => { ticking = false; }, 1200);
		}, { passive: true });
	}

	function attach() {
		buildTabs();
		sentinel.addEventListener('click', () => appendNext('click'));
		if ('IntersectionObserver' in window) {
			state.observer = new IntersectionObserver(entries => {
				if (entries.some(e => e.isIntersecting)) appendNext('observer');
			}, { root: null, rootMargin: '700px 0px 700px 0px', threshold: 0 });
			state.observer.observe(sentinel);
		}
		watchScrollFps();
		installViewObserver(state);
		loadFollowed().finally(() => appendNext('init'));
	}

	function destroy() {
		state.observer?.disconnect();
		state.viewObserver?.disconnect();
	}

	return { state, attach, destroy, switchTab, perfLedger };
}
