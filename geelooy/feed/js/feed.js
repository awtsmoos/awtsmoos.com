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
					onReaction: (it, on) => perfLedger.markAction('reaction', 0),
					onSave: (it, on) => perfLedger.markAction('save', 0),
					onAction: (label) => { const a0 = performance.now(); perfLedger.markAction(label, performance.now() - a0); }
				}));
			}
			river.append(frag);
			perfLedger.markRender(performance.now() - t0, ranked.length);
			rememberSeen(ranked);
			state.nextOffset = nextOffset ?? (state.nextOffset + ranked.length);
			if (nextOffset === null || nextOffset === undefined) state.done = nextOffset === null && ranked.length < PAGE_SIZE;
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
		loadFollowed().finally(() => appendNext('init'));
	}

	function destroy() {
		state.observer?.disconnect();
	}

	return { state, attach, destroy, switchTab, perfLedger };
}
