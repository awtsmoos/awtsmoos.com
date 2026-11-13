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
import { icon, escapeHtml } from './icons.js';
import { logActivity } from './activity.js';
import { recordLearningDay } from './streaks.js';
import { globalTheme } from './themes.js';
import { t, onLangChange } from './i18n.js';
import {
	loadFilters, saveFilters, hasActiveFilters, collectFacets, itemMatchesFilters,
	filterQueryParams, filterPanelHtml, wireFilterPanel, repaintFilterPanel, paintHeichelThemeDots
} from './filters.js';

const PAGE_SIZE = 14;
const PREFETCH_PAGES = 1;

/* B"H — Yaakov 2026-10-13 (TRACK E): tab labels are UI chrome, translated
   via i18n. `key` points at the locale string; never hardcode English here. */
const TABS = [
	{ id: 'home', key: 'tabs.home', icon: 'spark', endpoint: 'home' },
	{ id: 'following', key: 'tabs.following', icon: 'users', endpoint: 'discover' },
	{ id: 'trending', key: 'tabs.trending', icon: 'flame', endpoint: 'trending' },
	{ id: 'discover', key: 'tabs.discover', icon: 'compass', endpoint: 'discover' }
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

/* ============ fallback sources (B"H social fix 1) ============ */
/* The tab endpoints (home/discover/trending) only surface the handful of
   posts written through the social write path — in practice the 2 duplicated
   "Write-path test" posts, or nothing for trending — while the base
   chronological feed holds the real corpus posts and the simulation series
   holds 501,629 posts. The river tops up from those sources so it never
   runs dry and never shows only test posts. Shapes differ per source, so
   each is normalized to the card shape here. */

function normalizeBasePost(p = {}) {
	const src = p.source || {};
	const ss = p.socialSummary || {};
	const comments = ss.comments || {};
	const reactions = ss.reactions || {};
	return {
		postId: String(p.id || p.postId || ''),
		id: String(p.id || p.postId || ''),
		title: p.title || '',
		heTitle: p.heTitle || '',
		heichelId: p.heichelId || src.heichelId || 'ikar',
		heichelName: src.heichelName || p.heichelName || '',
		seriesId: src.seriesId || p.seriesId || 'root',
		aliasId: p.aliasId || '',
		authorName: src.authorName || p.authorName || '',
		excerpt: p.excerpt || '',
		createdAt: p.createdAt || 0,
		updatedAt: p.updatedAt || p.createdAt || 0,
		commentCount: Number(comments.total || 0),
		comments: Number(comments.total || 0),
		shareCount: 0,
		reactionSummary: {
			counts: (reactions.counts && typeof reactions.counts === 'object') ? reactions.counts : {},
			viewerEmoji: reactions.viewerEmoji || ''
		},
		_rankScore: 0
	};
}

/* B"H social fix 3 (defects 1, 2): the two "Write-path test" records are
   distinct rows with the same title, author, heichel and series — the
   profile list dedupes them by this content key (fix 2), but the feed
   river only deduped by postId, so the test post showed twice. And the
   base feed's first 40 rows are ALL "Benchmark post N" (bench-speed
   stress-test data, 22d old), so a top-up that takes the first page
   shows only benchmark posts and never real content. Bench-speed rows
   are skipped (the data still needs server-side cleanup) and the top-up
   scans forward until it finds real posts. */
function contentKey(item = {}) {
	return [
		String(item.title || '').trim().toLowerCase(),
		String(item.aliasId || item.author || '').trim().toLowerCase(),
		String(item.heichelId || item.heichel || '').trim().toLowerCase(),
		String(item.seriesId || item.series || '').trim().toLowerCase()
	].join('|');
}

function isBenchmarkPost(item = {}) {
	// B"H social fix 4 (defect 7): same extended skip as the hub —
	// bench-speed, the ikar Platform Proof test post, bench-import
	// rows, and any "test submission" title. The feed passed with
	// the bench-speed check alone only because the Platform Proof
	// post is the first real base row; it must not render.
	const heichel = String(item.heichelId || item.heichel || '').toLowerCase();
	if (heichel === 'bench-speed') return true;
	if (String(item.seriesId || item.series || '').toLowerCase() === 'platform-proof-submissions') return true;
	if (String(item.aliasId || item.author || '').toLowerCase() === 'bench-import') return true;
	if (/test submission/i.test(String(item.title || item.postTitle || ''))) return true;
	return false;
}

/* B"H social fix 8 (defect 2): the two "Write-path test" records are
   orphaned (POST_NOT_FOUND in the post store — their pages 404), and
   Fix 7 hid them from the hub only. They still top the FEED as its
   first card (the tab endpoints return exactly those 2 rows). Hide them
   from the feed's rendered LIST too — same check as the hub's
   isOrphanedTestPost, same two verified-orphaned postIds, or title
   "Write-path test" + alias asdf. LIST-ONLY, NOT a deletion: the records
   stay in the data, they are simply not shown. */
const ORPHANED_TEST_POST_IDS = new Set([
	'post_1794364379034_ikihjkqbvmf',
	'post_1794363158834_rm5osi5gr08'
]);

function isOrphanedTestPost(item = {}) {
	const id = String(item.postId || item.id || '');
	if (ORPHANED_TEST_POST_IDS.has(id)) return true;
	const title = String(item.title || item.postTitle || '').trim().toLowerCase();
	const alias = String(item.aliasId || item.author || '').trim().toLowerCase();
	return title === 'write-path test' && alias === 'asdf';
}

async function fetchBaseFeedPage(cursor, limit) {
	const qs = new URLSearchParams({ limit: String(limit) });
	if (cursor) qs.set('cursor', cursor);
	// B"H social fix 2b: the base feed API can HANG (single request, 30s
	// timeout, 0 bytes). Never let it block the river — bound it to 8s and
	// let the caller fall through to the next source on timeout.
	const controller = new AbortController();
	const watchdog = setTimeout(() => controller.abort(), 8000);
	let res;
	try {
		res = await fetch(`/api/social/feed?${qs}`, { credentials: 'same-origin', signal: controller.signal });
	} finally {
		clearTimeout(watchdog);
	}
	if (!res.ok) throw new Error(`Feed base answered ${res.status}`);
	const body = await res.json();
	const rows = Array.isArray(body?.data) ? body.data : (Array.isArray(body?.success) ? body.success : []);
	const pageInfo = body?.meta?.pageInfo || {};
	return {
		items: rows.map(normalizeBasePost),
		nextCursor: pageInfo.nextCursor || '',
		hasMore: pageInfo.hasMore === true,
		total: pageInfo.total ?? null
	};
}

function normalizeSimPost(p = {}) {
	const content = String(p.content || '');
	// B"H social fix 6 (defect 3): sim records carry NO timestamp —
	// verified live (the detail record has postId/title/content/
	// heichelId/seriesId/parentSeriesId/id only, no createdAt of any
	// kind). Stamping Date.now() here made every sim post read "1s"
	// ago — a fabricated date. Use the record's real timestamp when
	// one exists, else 0: the card renders no time for a dateless post
	// rather than a fake "now".
	const stamp = Number(p.createdAt || p.updatedAt || p.timestamp || p.publishedAt) || 0;
	return {
		postId: String(p.postId || p.id || ''),
		id: String(p.postId || p.id || ''),
		title: p.title || '',
		heichelId: p.heichelId || 'ikar',
		heichelName: '',
		seriesId: p.seriesId || 'simulation',
		aliasId: '',
		authorName: '',
		excerpt: content.slice(0, 240),
		createdAt: stamp,
		updatedAt: stamp,
		commentCount: 0,
		comments: 0,
		shareCount: 0,
		reactionSummary: { counts: {}, viewerEmoji: '' },
		_rankScore: 0
	};
}

async function fetchSimPage(offset, limit) {
	const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
	const res = await fetch(`/api/social/heichelos/ikar/series/simulation/posts?${qs}`, { credentials: 'same-origin' });
	if (!res.ok) throw new Error(`Feed simulation answered ${res.status}`);
	const body = await res.json();
	const ids = Array.isArray(body) ? body : (Array.isArray(body?.success) ? body.success : (Array.isArray(body?.data) ? body.data : []));
	const wanted = ids.slice(0, limit);
	const details = [];
	for (let i = 0; i < wanted.length; i += 5) {
		const batch = wanted.slice(i, i + 5);
		const rows = await Promise.all(batch.map(async (id) => {
			try {
				// B"H social fix 2b: bound each detail read (5s) so one slow
				// post cannot stall the whole batch.
				const c = new AbortController();
				const w = setTimeout(() => c.abort(), 5000);
				try {
					const r = await fetch(`/api/social/heichelos/ikar/series/simulation/post/${encodeURIComponent(String(id))}`, { credentials: 'same-origin', signal: c.signal });
					if (!r.ok) return null;
					return await r.json();
				} finally {
					clearTimeout(w);
				}
			} catch { return null; }
		}));
		for (const row of rows) if (row) details.push(row);
	}
	return { items: details.map(normalizeSimPost), fetched: wanted.length, exhausted: ids.length < limit };
}

async function fetchFeed(endpoint, { limit, offset, aliasId, filters, fallback }) {
	const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
	if (endpoint === 'home') qs.set('aliasId', aliasId);
	// B"H — Yaakov 2026-10-13: filter params travel to the server (best effort).
	if (filters && hasActiveFilters(filters)) {
		for (const [k, v] of Object.entries(filterQueryParams(filters))) qs.set(k, v);
	}
	const t0 = performance.now();
	const res = await fetch(`/api/social/feed/${endpoint}?${qs}`, { credentials: 'same-origin' });
	const ms = performance.now() - t0;
	if (!res.ok) throw new Error(`Feed ${endpoint} answered ${res.status}`);
	const body = await res.json();
	const data = body?.success ?? body ?? {};
	perfLedger.markApi(endpoint, ms, Number(res.headers.get('content-length')) || 0);
	let items = Array.isArray(data.items) ? data.items : [];
	const nextOffset = data.nextOffset ?? null;
	const total = data.total ?? null;
	// B"H social fix 1: top up from the base feed + the simulation series when
	// the tab endpoint returns fewer than a page (it only ever returns the 2
	// test posts, or 0 for trending). `fallback` carries the cursors across
	// pages so each source is consumed once, in order, and never repeated.
	const fb = fallback || null;
	const seen = new Set();
	const seenContent = new Set();
	// B"H social fix 3 (defect 2): dedupe the TAB items too — the two
	// "Write-path test" records arrive here as tab items, distinct postIds
	// with identical content. Drop the later duplicate from the list
	// (never the underlying post). A key of '|||' means the item carries
	// no title/author/heichel/series at all, so it is never collapsed.
	items = items.filter((it) => {
		// B"H social fix 8 (defect 2): the orphaned "Write-path test"
		// records arrive here as tab items — filter them from the
		// feed's list (never the underlying posts), before the dedupe.
		if (isOrphanedTestPost(it)) return false;
		const id = String(it.postId || it.id || '');
		if (id) {
			if (seen.has(id)) return false;
			seen.add(id);
		}
		const ckey = contentKey(it);
		if (ckey !== '|||' && seenContent.has(ckey)) return false;
		if (ckey !== '|||') seenContent.add(ckey);
		return true;
	});
	if (fb && items.length < limit && !fb.baseDone && Date.now() >= (fb.baseNextRetry || 0)) {
		// B"H social fix 3 (defect 1): scan the base feed forward — fetch
		// pages of 50, skip bench-speed, keep real posts — until this river
		// page is full or 3 base pages are scanned. One 14-row page only
		// ever returned benchmark posts (the first 40 base rows are all
		// bench-speed). If a scan finds no real post at all, the base is
		// done for this river (it is not yielding real content), so the
		// river does not spin re-fetching it.
		try {
			let foundReal = 0;
			let pagesScanned = 0;
			while (items.length < limit && !fb.baseDone && pagesScanned < 3) {
				const base = await fetchBaseFeedPage(fb.baseCursor, 50);
				pagesScanned++;
				for (const it of base.items) {
					if (isBenchmarkPost(it)) continue;
					if (isOrphanedTestPost(it)) continue;
					const key = String(it.postId || it.id || '');
					const ckey = contentKey(it);
					if (key && !seen.has(key) && (ckey === '|||' || !seenContent.has(ckey))) {
						seen.add(key);
						if (ckey !== '|||') seenContent.add(ckey);
						items.push(it);
						foundReal++;
					}
					if (items.length >= limit) break;
				}
				fb.baseCursor = base.nextCursor || '';
				if (!base.hasMore) fb.baseDone = true;
			}
			if (foundReal === 0) fb.baseDone = true;
		} catch (_) {
			// B"H social fix 4: a failed base scan (hang, abort, bad
			// status) must not mark the base done for the session —
			// that fail-once left the feed with only test + sim posts
			// after one slow fetch. Retry on the next page load,
			// after a 10s backoff.
			fb.baseNextRetry = Date.now() + 10000;
		}
	}
	if (fb && items.length < limit && !fb.simDone) {
		try {
			const sim = await fetchSimPage(fb.simOffset, limit - items.length);
			for (const it of sim.items) {
				const key = String(it.postId || it.id || '');
				const ckey = contentKey(it);
				if (key && !seen.has(key) && (ckey === '|||' || !seenContent.has(ckey))) {
					seen.add(key);
					if (ckey !== '|||') seenContent.add(ckey);
					items.push(it);
				}
			}
			fb.simOffset += sim.fetched;
			if (sim.exhausted) fb.simDone = true;
		} catch (_) { fb.simDone = true; }
	}
	// B"H social fix 3 (defect 3): the simulation series is effectively
	// infinite (501,629 posts; its `exhausted` flag only trips on a short
	// page, which never happens), so requiring simDone made `done`
	// unreachable — the river auto-fetched forever (the sentinel sits
	// within the observer's 700px margin while the river is short, and
	// each load re-armed it), re-entering "status.loading" and disabling
	// Load more. The sim is a bonus top-up for a page, not a source the
	// river must exhaust: the river is done when the tab endpoint and the
	// base feed (the real sources) are both exhausted.
	const done = nextOffset === null && (!fb || fb.baseDone);
	return { items, nextOffset, total, done };
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
			// B"H — Yaakov 2026-10-14: a genuinely read card (50%+ visible)
			// marks the day for the learning streak.
			recordLearningDay();
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
		skeletons: [],
		filters: loadFilters(),
		allItems: [],
		fallback: { baseCursor: '', baseDone: false, baseNextRetry: 0, simOffset: 0, simDone: false }
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
		setStatus(t('status.loading'), true);
		showSkeletons(3);
		const tab = TABS.find(t => t.id === state.tab);
		try {
			const { items, nextOffset, done } = await fetchFeed(tab.endpoint, {
				limit: PAGE_SIZE, offset: state.nextOffset, aliasId: state.aliasId, filters: state.filters, fallback: state.fallback
			});
			clearSkeletons();
			// B"H — client-side filtering is authoritative: the server may
			// ignore unknown params, the river never shows filtered-out posts.
			const visible = items.filter(item => itemMatchesFilters(item, state.filters));
			for (const item of visible) state.allItems.push(item);
			refreshFilterPanel();
			if (!visible.length) {
				// This page was fully filtered out — keep paging, don't stall.
				state.nextOffset = nextOffset ?? (state.nextOffset + items.length);
				state.loading = false;
				if (done) {
					state.done = true;
					if (!river.querySelector('.feed-card')) river.append(renderEmpty(''));
					setStatus(t('status.caughtUp'), false);
				} else {
					appendNext('filtered');
				}
				return;
			}
			const ranked = state.tab === 'home' ? clientRerank(visible, state.aliasId, state.followed) : visible;
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
					onAction: (act, it) => {
						const a0 = performance.now();
						perfLedger.markAction(act, performance.now() - a0);
						/* B"H — TRACK E: cards pass the stable data-act key, not the translated label. */
						if (act === 'share') logActivity('share', activityDetail(it));
					},
					fetchComments: fetchCommentTree,
					submitComment
				}));
			}
			const newCards = [...frag.children];
			river.append(frag);
			for (const card of newCards) {
				card._feedCandidates = ranked;
				observeCardView(card);
			}
			perfLedger.markRender(performance.now() - t0, ranked.length);
			rememberSeen(ranked);
			state.nextOffset = nextOffset ?? (state.nextOffset + items.length);
			if (done) state.done = true;
			setStatus(state.done ? t('status.caughtUp') : t('status.scrollMore'), false);
			// Prefetch one page ahead while idle.
			if (!state.done && 'requestIdleCallback' in window) {
				requestIdleCallback(() => prefetch(tab), { timeout: 4000 });
			}
		} catch (error) {
			clearSkeletons();
			setStatus(error.message || t('status.stalled'), false);
		} finally {
			state.loading = false;
		}
	}

	const prefetchCache = new Map();
	async function prefetch(tab) {
		const key = `${tab.id}:${state.nextOffset}`;
		if (prefetchCache.has(key) || state.done) return;
		try {
			const page = await fetchFeed(tab.endpoint, { limit: PAGE_SIZE, offset: state.nextOffset, aliasId: state.aliasId, filters: state.filters });
			prefetchCache.set(key, page);
		} catch (_) { /* best effort */ }
	}

	/* ============ filter panel (Yaakov 2026-10-13) ============ */

	const sideEl = document.getElementById('feed-side');
	const sidePanel = document.getElementById('feed-filter-panel');

	function refreshFilterPanel() {
		if (!sidePanel) return;
		const facets = collectFacets(state.allItems);
		repaintFilterPanel(sidePanel, facets, state.filters);
		updateFilterBadge();
	}

	function updateFilterBadge() {
		const badge = document.getElementById('feed-filter-count');
		if (!badge) return;
		const n = state.filters.authors.size + state.filters.heichels.size + state.filters.topics.size;
		badge.textContent = n > 0 ? String(n) : '';
		badge.hidden = n === 0;
	}

	function applyFiltersAndReload() {
		state.nextOffset = 0;
		state.done = false;
		state.allItems = [];
		state.fallback = { baseCursor: '', baseDone: false, baseNextRetry: 0, simOffset: 0, simDone: false };
		prefetchCache.clear();
		river.replaceChildren();
		sentinel.textContent = t('status.loadMore');
		updateFilterBadge();
		appendNext('filter');
	}

	function initFilterPanel() {
		if (!sidePanel) return;
		sidePanel.innerHTML = filterPanelHtml(collectFacets(state.allItems), state.filters);
		wireFilterPanel(sidePanel, {
			getFilters: () => state.filters,
			onChange: (themeOnly) => {
				if (themeOnly) {
					paintHeichelThemeDots(sidePanel);
					return;
				}
				applyFiltersAndReload();
			}
		});
		paintHeichelThemeDots(sidePanel);
		updateFilterBadge();
	}

	/* ============ retractable sidebar (Yaakov 2026-10-13) ============ */

	const SIDEBAR_KEY = 'awtsmoos-feed-sidebar';

	function setSidebar(open) {
		if (!sideEl) return;
		sideEl.classList.toggle('is-collapsed', !open);
		sideEl.setAttribute('aria-hidden', String(!open));
		const toggle = document.getElementById('feed-filter-toggle');
		toggle?.setAttribute('aria-expanded', String(open));
		try { localStorage.setItem(SIDEBAR_KEY, open ? 'open' : 'closed'); } catch (_) {}
	}

	function initSidebar() {
		let open = true;
		try { open = localStorage.getItem(SIDEBAR_KEY) !== 'closed'; } catch (_) {}
		if (window.innerWidth < 900) open = false;
		setSidebar(open);
		document.getElementById('feed-filter-toggle')?.addEventListener('click', () => {
			setSidebar(sideEl.classList.contains('is-collapsed'));
		});
		document.getElementById('feed-side-close')?.addEventListener('click', () => setSidebar(false));
	}

	function switchTab(id) {
		if (state.tab === id || state.loading) return;
		state.tab = id;
		state.offset = 0;
		state.nextOffset = 0;
		state.done = false;
		state.allItems = [];
		state.fallback = { baseCursor: '', baseDone: false, baseNextRetry: 0, simOffset: 0, simDone: false };
		prefetchCache.clear();
		river.replaceChildren();
		tabsEl.querySelectorAll('[role="tab"]').forEach(el => {
			const active = el.dataset.tab === id;
			el.classList.toggle('is-active', active);
			el.setAttribute('aria-selected', String(active));
		});
		sentinel.textContent = t('status.loadMore');
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
			btn.innerHTML = `${icon(tab.icon)}<span>${escapeHtml(t(tab.key))}</span>`;
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
		initSidebar();
		initFilterPanel();
		/* B"H — Yaakov 2026-10-13 (TRACK E): switching the UI language
		   retranslates the chrome and rebuilds the river so every card
		   re-renders with translated labels. */
		onLangChange(() => {
			tabsEl.replaceChildren();
			buildTabs();
			refreshFilterPanel();
			applyFiltersAndReload();
		});
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
