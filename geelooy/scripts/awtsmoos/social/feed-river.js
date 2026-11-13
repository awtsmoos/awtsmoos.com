// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedRiver
 * @description
 * Premium social feed river for Awtsmoos Social.
 * Yaakov 2026-10-13: For You / Latest / Popular toggle, infinite scroll,
 * pull-to-refresh, skeleton loaders, golden action icons.
 *
 * Endpoints (platform feed routes):
 *  - /api/social/feed/personalized — For You (reading-history ranked)
 *  - /api/social/feed/latest       — Latest (chronological)
 *  - /api/social/feed/popular      — Popular (engagement ranked)
 */

const ICON_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons';
const ICONS = {
	heart: { cls: 'gicon--heart', url: ICON_BASE + '/media-generation-icon-heart-0-5629aacd-4b69-455b-b1b1-f86479475807.webp' },
	comment: { cls: 'gicon--comment', url: ICON_BASE + '/gicon-comment.webp?v=c5d6b22649' },
	share: { cls: 'gicon--share', url: ICON_BASE + '/media-generation-icon-share-0-5961f07f-21a6-4ff0-abb1-31888cabdd28.webp' },
	bookmark: { cls: 'gicon--bookmark', url: ICON_BASE + '/media-generation-icon-bookmark-0-03bd3c64-fec6-49ab-a919-902a42f29850.webp' }
};
/** One golden action icon img with the shared gicon states. */
function actionIcon(vessel) {
	return `<img class="gicon ${vessel.cls}" src="${vessel.url}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="22" height="22">`;
}
const COVER_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/series';

const MODES = [
	{ key: 'personalized', label: 'For You', endpoint: 'personalized' },
	{ key: 'latest', label: 'Latest', endpoint: 'latest' },
	{ key: 'popular', label: 'Popular', endpoint: 'popular' }
];
const PAGE_SIZE = 12;

const state = {
	mode: 'personalized',
	items: [],
	offset: 0,
	nextOffset: 0,
	loading: false,
	done: false,
	modeDone: false,
	baseCursor: '',
	baseDone: false,
	baseNextRetry: 0,
	// B"H social fix 9 (defect 2): true while a reset came from a tab
	// switch or a retry (serve the first page from the cached pool);
	// false for pull-to-refresh (an explicit refresh must re-fetch).
	usePoolCache: false,
	liked: new Set(),
	saved: new Set(),
	// B"H social fix 3 (defect 2): dedupe the river LIST by postId AND
	// content key (title+alias+heichel+series), the same way the profile
	// list was deduped in fix 2. Persists across mode-item and top-up
	// appends so a post never appears twice in one river session.
	seenIds: new Set(),
	seenContent: new Set(),
	maamarLinks: null,
	maamarLinksLoading: false
};

// B"H social fix 9 (defect 2): the top-up pool is the same for every
// tab — the base scan is mode-independent; only rankTopUp differs,
// and it is a pure function of (pool, mode, need). Cache the
// first-page pool so a tab switch re-ranks rows already in memory
// instead of re-fetching the same 3 base pages (~8.5s of skeletons:
// mode fetch ~0.9s + 3 pages at ~1.8–3.0s each, measured 2026-11-13).
// TTL 120s; pull-to-refresh bypasses it and refreshes the cache.
// Only a scan that started at baseCursor '' (the first page) is
// cacheable — a Load More scan covers later pages and must never
// overwrite it.
let poolCache = null; // { pool, cursor, baseDone, at }
const POOL_CACHE_TTL_MS = 120000;

function snapshotPoolCache(pool, scanStartCursor) {
	if (!pool || !pool.length) return;
	if (scanStartCursor !== '') return;
	poolCache = { pool: pool.slice(), cursor: state.baseCursor, baseDone: state.baseDone, at: Date.now() };
}

// B"H — Load the social-post -> source-maamar link mappings from AwtsmoosDB
// (maamar-links-index-v1 post, kind=maamar-link-index). Per Yaakov's standing
// rule: NO static JSON files in production — DB only. Cached in state; fetched once.
async function loadMaamarLinks() {
	if (state.maamarLinks || state.maamarLinksLoading) return;
	state.maamarLinksLoading = true;
	try {
		const res = await fetch('/api/social/packed/read?shard=core&key=' + encodeURIComponent('/posts/chassidus/maamar-links-index-v1'), { credentials: 'same-origin' });
		if (res.ok) {
			const data = await res.json();
			const mappings = (data && data.success && data.success.value && data.success.value.mappings) || null;
			if (mappings) state.maamarLinks = mappings;
		}
	} catch (_) { /* link simply won't render */ }
	state.maamarLinksLoading = false;
}

// B"H — "Read the full maamar →" link for social posts derived from a maamar.
function deriveBasePostId(postId) {
	const id = String(postId || '');
	// MR: mr-social-mittler-rebbe-15823-001-article → mittler-rebbe-15823-001
	let m = /^mr-social-(mittler-rebbe-\d+-\d+)-/.exec(id);
	if (m) return m[1];
	// SHM: shm-social-15643-maamar-001-en-md-c00 → shm-maamar-15643-maamar-001-en-md
	m = /^shm-social-(\d+-maamar-\d+(?:-en-md)?)-c\d+/.exec(id);
	if (m) return 'shm-maamar-' + m[1];
	return '';
}
function maamarLinkHtml(post) {
	const base = post.basePostId || post.base_post_id || deriveBasePostId(post.postId) || '';
	if (!base || !state.maamarLinks) return '';
	const entry = state.maamarLinks[base];
	if (!entry || !entry.url) return '';
	const label = entry.title ? `Read the full maamar: ${esc(entry.title)}` : 'Read the full maamar';
	return `<a class="feed-card__maamar-link" href="${esc(entry.url)}" aria-label="${esc(label)}"><span aria-hidden="true">📖</span> Read the full maamar <span aria-hidden="true">→</span></a>`;
}

/** B"H social fix 2: base-feed rows carry seriesId inside source and
 * counts inside socialSummary. Flatten them to the river card shape so the
 * top-up posts link correctly and show real comment/reaction counts. */
function normalizeRiverPost(p = {}) {
	const src = p.source || {};
	const ss = p.socialSummary || {};
	return {
		postId: String(p.id || p.postId || ''),
		id: String(p.id || p.postId || ''),
		title: p.title || '',
		heichelId: p.heichelId || src.heichelId || 'ikar',
		seriesId: src.seriesId || p.seriesId || 'root',
		seriesTitle: src.seriesTitle || '',
		aliasId: p.aliasId || '',
		authorName: src.authorName || p.aliasId || '',
		excerpt: p.excerpt || src.excerpt || '',
		commentCount: Number((ss.comments || {}).total || p.commentCount || 0),
		reactionCount: Number((ss.reactions || {}).total || p.reactionCount || p.likes || 0),
		referenceCount: Number((ss.references || {}).total || 0),
		type: p.contentType || p.type || 'post',
		createdAt: p.createdAt || 0,
		updatedAt: p.updatedAt || p.createdAt || 0
	};
}

/* B"H social fix 3 (defects 1, 2): same content key as the feed river
   and the profile list — title+alias+heichel+series, lowercased. The
   two "Write-path test" records share it, so a postId-only dedupe shows
   the test post twice. Bench-speed rows are stress-test data (the base
   feed's first 40 rows are all "Benchmark post N"); they are skipped so
   the hub surfaces real content posts. */
function contentKey(post = {}) {
	return [
		String(post.title || '').trim().toLowerCase(),
		String(post.aliasId || post.author || '').trim().toLowerCase(),
		String(post.heichelId || post.heichel || '').trim().toLowerCase(),
		String(post.seriesId || post.series || '').trim().toLowerCase()
	].join('|');
}

function isBenchmarkPost(post = {}) {
	// B"H social fix 4 (defect 7): bench-speed is not the only test
	// source. The "Platform Proof" test post is heichel ikar, series
	// platform-proof-submissions, alias muse-audit-01 — Fix 3's
	// bench-speed check let it through. Skip it (and any other test
	// submission / bench-import row) here and in feed.js alike.
	const heichel = String(post.heichelId || post.heichel || '').toLowerCase();
	if (heichel === 'bench-speed') return true;
	if (String(post.seriesId || post.series || '').toLowerCase() === 'platform-proof-submissions') return true;
	if (String(post.aliasId || post.author || '').toLowerCase() === 'bench-import') return true;
	if (/test submission/i.test(String(post.title || post.postTitle || ''))) return true;
	return false;
}

/** B"H social fix 7 (defect 1): the two "Write-path test" records are
 * ORPHANED — they exist in the feed index but POST_NOT_FOUND in the
 * post store (verified live in every fix-1–6 check: their pages 404),
 * so their cards lead to "Post not found". The three tab endpoints
 * return exactly these 2 posts, and the hub renders mode items FIRST,
 * before the ranked top-up — so one of them tops EVERY tab, and the
 * For You offset fix (Fix 6) could never move it: the offset applies
 * to the top-up, not to the mode items. Hide them from the hub's
 * rendered LIST only (consistent with the profile list hiding Worker J
 * and the feed hiding benchmark posts): the records stay in the data,
 * they are simply not shown. NOT a deletion — the user has not answered
 * the deletion question yet. Matched by the two verified-orphaned
 * postIds, or by the test title + alias (either covers both records).
 * The base feed never carries them (0 of the live 150-row sample), so
 * the mode-item filter is the operative one; the pool-scan check is
 * belt-and-braces in case the base feed ever does. */
const ORPHANED_TEST_POST_IDS = new Set([
	'post_1794364379034_ikihjkqbvmf',
	'post_1794363158834_rm5osi5gr08'
]);
function isOrphanedTestPost(post = {}) {
	const id = String(post.postId || post.id || '');
	if (ORPHANED_TEST_POST_IDS.has(id)) return true;
	const title = String(post.title || post.postTitle || '').trim().toLowerCase();
	const alias = String(post.aliasId || post.author || '').trim().toLowerCase();
	return title === 'write-path test' && alias === 'asdf';
}

/** B"H social fix 5 (defect 2): the three hub tabs showed the IDENTICAL
 * 11-post list because the top-up was mode-blind — every mode's endpoint
 * returns the same 2 test posts, and the scan took the first N real rows
 * of the base feed in base order for every mode. The top-up now ranks its
 * pool by the tab's own rule:
 * - latest: newest first (createdAt desc — the base feed's own order).
 * - popular: most reactions/comments/references first. Every real post
 *   currently has 0 engagement (verified across the base feed's first 400
 *   rows), so the tie-break is series depth — how many of the pool's
 *   posts share the series, a proxy for a popular series — then AUTHOR
 *   depth (Fix 10: series depth is uniform on the live data, every post
 *   its own series, so author depth is the level where the data varies)
 *   — then newest. When real engagement exists, it ranks first; the
 *   proxies only break the all-zero ties.
 * - personalized ("For You"): no reading-history signal reaches the
 *   top-up (the mode endpoint returns only the 2 test posts), so rank
 *   for discovery diversity — one post per series, in first-appearance
 *   (newest-first) series order, starting at the FIFTH series (see
 *   rankTopUp: the four freshest series are Latest's head). The first
 *   page then shows 10 different series instead of 10 parts of 2–3
 *   series, and its top never duplicates Latest's top.
 * Each ranking is computed from real row data; nothing is invented. */
function engagementOf(post) {
	return Number(post.commentCount || 0) + Number(post.reactionCount || 0) + Number(post.referenceCount || 0);
}

/** B"H social fix 6 (defects 1, 2): the pool arrives in the API's row
 * order, and the API's order for equal createdAt values is not
 * guaranteed — base pages 2–3 carry createdAt ties (verified live:
 * 1792487016084 x2 and 1792486987309 x4 on page 2, 4 ties on page 3).
 * The ranking must be a pure function of the pool SET, not of the row
 * order it happened to arrive in. Canonical total order: createdAt
 * desc, postId asc as the tie-break (postIds are unique, so the order
 * is total). Every mode ranks from this order, so a tie can never flip
 * the output between loads. */
function canonicalPoolOrder(pool) {
	return [...pool].sort((a, b) => {
		const d = Number(b.createdAt || 0) - Number(a.createdAt || 0);
		if (d) return d;
		return String(a.postId || a.id || '').localeCompare(String(b.postId || b.id || ''));
	});
}

function rankTopUp(pool, mode, need) {
	const ordered = canonicalPoolOrder(pool);
	if (mode === 'latest') {
		return ordered.slice(0, need);
	}
	if (mode === 'popular') {
		const depth = new Map();
		const aliasDepth = new Map();
		for (const p of ordered) {
			const s = String(p.seriesId || p.series || '');
			depth.set(s, (depth.get(s) || 0) + 1);
			const a = String(p.aliasId || p.author || '');
			aliasDepth.set(a, (aliasDepth.get(a) || 0) + 1);
		}
		return [...ordered].sort((a, b) => {
			const e = engagementOf(b) - engagementOf(a);
			if (e) return e;
			const d = (depth.get(String(b.seriesId || b.series || '')) || 0)
				- (depth.get(String(a.seriesId || a.series || '')) || 0);
			if (d) return d;
			// B"H social fix 10 (defect 2): series depth is UNIFORM on
			// the live data — every post is its own series (verified
			// 2026-11-13: 150 rows, 150 distinct series, seriesId ==
			// postId), so the depth tie-break never fires and Popular
			// collapses to recency == Latest. The next tie-break is
			// AUTHOR depth — how many of the pool's posts share the
			// alias, a proxy for a popular author (same proxy family as
			// series depth, at the level where the data actually varies:
			// rashba 19, ritva 18, shiltei 18 in the live pool). Still a
			// proxy, not real engagement — the backend needs real
			// engagement (or mode endpoints returning real ranked posts)
			// for a true Popular ranking.
			const ad = (aliasDepth.get(String(b.aliasId || b.author || '')) || 0)
				- (aliasDepth.get(String(a.aliasId || a.author || '')) || 0);
			if (ad) return ad;
			const c = Number(b.createdAt || 0) - Number(a.createdAt || 0);
			if (c) return c;
			return String(a.postId || a.id || '').localeCompare(String(b.postId || b.id || ''));
		}).slice(0, need);
	}
	// B"H social fix 6 (defect 1): For You's round-robin used to start
	// at the first series in first-appearance order — but the newest
	// posts are spread across distinct series, so round 0's first picks
	// ARE Latest's top posts (verified live in the Fix 5 check: the top
	// three real posts were identical). For You now starts its
	// round-robin at the FIFTH series in first-appearance order. The
	// four freshest series are Latest's head — the four newest posts
	// span at most four distinct series, so skipping four guarantees no
	// overlap with Latest's first four — and For You discovers the next
	// tier instead of duplicating it. A FIXED offset (not a rotation by
	// content) is what keeps the ranking prefix-stable when the pool
	// grows: the series order is first-appearance, so a smaller pool's
	// series are a prefix of the full pool's, and the offset into them
	// is the same — a truncated pool (slow page, 15s watchdog abort)
	// renders a PREFIX of the full list, never a shuffle. Only round 0
	// is used (one post per series): dipping into round 1 on a thin
	// pool is what shuffled the tail in the Fix 5 check — with fewer
	// series than `need`, round 1 interleaves second posts of early
	// series where the full pool would put first posts of later series.
	// A thin pool therefore renders fewer posts (the river's Load More
	// fetches the rest), honestly, instead of a shuffled tail.
	const bySeries = new Map();
	for (const p of ordered) {
		const s = String(p.seriesId || p.series || '');
		if (!bySeries.has(s)) bySeries.set(s, []);
		bySeries.get(s).push(p);
	}
	const seriesLists = [...bySeries.values()];
	const FOR_YOU_SKIP = 4;
	const out = [];
	for (let i = FOR_YOU_SKIP; i < seriesLists.length && out.length < need; i++) {
		if (seriesLists[i][0]) out.push(seriesLists[i][0]);
	}
	return out;
}

function esc(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function postUrl(post) {
	const id = post.postId || post.id || '';
	const series = post.seriesId || post.series || '';
	const heichel = post.heichelId || post.heichel || 'ikar';
	if (series && id) return `/heichelos/${encodeURIComponent(heichel)}/series/${encodeURIComponent(series)}/post/${encodeURIComponent(id)}`;
	return '#';
}

function findPost(postId) {
	return state.items.find(p => String(p.postId || p.id || '') === String(postId)) || null;
}

function coverUrl(post) {
	if (post.coverImage) return post.coverImage;
	const sid = String(post.seriesId || post.series || '');
	// Series covers live at covers/series/series-<slug>.webp
	if (sid) return `${COVER_BASE}/series-${sid.replace(/([A-Z])/g, '-$1').toLowerCase()}.webp`;
	return '';
}

function whyText(post) {
	if (post._rankScore == null) return '';
	if (state.mode === 'personalized') {
		const sid = String(post.seriesId || post.series || '');
		if (sid) return `Because you read ${esc(sid)}`;
		return 'Picked for you';
	}
	return '';
}

/* B"H 2026-10-13 — mi-fade-up + --mi-i drive the shared staggered card entrance. */
function cardHtml(post, index = 0) {
	const id = esc(post.postId || post.id || '');
	const title = esc(post.title || post.postTitle || 'Untitled');
	const excerpt = esc(post.excerpt || post.summary || post.description || '');
	const kicker = esc(post.seriesTitle || post.seriesId || post.series || 'Awtsmoos');
	const author = esc(post.authorName || post.author || post.aliasId || 'Awtsmoos');
	const aliasId = String(post.aliasId || post.author || '').trim();
	const initial = (author.trim()[0] || 'A').toUpperCase();
	const likes = Number(post.reactionCount || post.likes || 0);
	const comments = Number(post.commentCount || 0);
	const cover = coverUrl(post);
	const why = whyText(post);
	const liked = state.liked.has(id);
	const isQuestion = String(post.type || post.postType || '').toLowerCase() === 'question';
	const answerCount = Number(post.answerCount || 0);
	const qBadge = isQuestion ? `<span class="feed-card__qbadge">❓ Question${answerCount ? ` · ${answerCount} answer${answerCount === 1 ? '' : 's'}` : ''}</span>` : '';

	return `
	<article class="feed-card mi-fade-up" data-post-id="${id}" style="--mi-i:${Math.max(0, index)}">
		${cover ? `<img class="feed-card__cover" src="${esc(cover)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
		<div class="feed-card__body">
			<p class="feed-card__kicker">${kicker}</p>
			${qBadge}
			<h2 class="feed-card__title"><a href="${esc(postUrl(post))}">${title}</a></h2>
			${excerpt ? `<p class="feed-card__excerpt">${excerpt}</p>` : ''}
			${maamarLinkHtml(post)}
			${why ? `<span class="feed-card__why">✦ ${why}</span>` : ''}
			<div class="feed-card__meta">
				<span class="feed-card__avatar" aria-hidden="true">${esc(initial)}</span>
				${aliasId ? `<a class="feed-card__author" href="/@${encodeURIComponent(aliasId)}">${author}</a>` : `<span>${author}</span>`}
			</div>
			<div class="feed-card__actions">
				<button class="feed-action ${liked ? 'feed-action--liked' : ''}" data-action="like" data-post="${id}" aria-pressed="${liked}" aria-label="${liked ? 'Unlike' : 'Like'} this post">
					${actionIcon(ICONS.heart)}<span>${likes} Like${likes === 1 ? '' : 's'}</span>
				</button>
				<button class="feed-action" data-action="comment" data-post="${id}" aria-label="Comment on this post">
					${actionIcon(ICONS.comment)}<span>${comments} Comment${comments === 1 ? '' : 's'}</span>
				</button>
				<button class="feed-action" data-action="share" data-post="${id}" aria-label="Share this post">
					${actionIcon(ICONS.share)}<span>Share</span>
				</button>
				<button class="feed-action" data-action="save" data-post="${id}" aria-pressed="${state.saved.has(id)}" aria-label="${state.saved.has(id) ? 'Unsave' : 'Save'} this post">
					${actionIcon(ICONS.bookmark)}<span>Save</span>
				</button>
			</div>
		</div>
	</article>`;
}

function skeletonHtml(n = 3) {
	let out = '';
	for (let i = 0; i < n; i++) {
		out += `<div class="feed-skeleton" aria-hidden="true">
			<div class="feed-skeleton__cover"></div>
			<div class="feed-skeleton__line feed-skeleton__line--title"></div>
			<div class="feed-skeleton__line"></div>
			<div class="feed-skeleton__line feed-skeleton__line--short"></div>
		</div>`;
	}
	return out;
}

function emptyHtml() {
	return `<div class="feed-empty">
		<div class="feed-empty__glyph">✦</div>
		<h2 class="feed-empty__title">Your river is waiting</h2>
		<p class="feed-empty__text">Read some Torah and your personalized feed will bloom here — posts chosen from what you love, plus beautiful discoveries.</p>
		<a class="feed-empty__cta" href="/heichelos/">Explore the Library</a>
	</div>`;
}

async function fetchPage() {
	if (state.loading || state.done) return;
	state.loading = true;
	renderSentinel(true);

	const mode = MODES.find(m => m.key === state.mode);
	// BH QA sweep2 SOCIAL-SKELETONS: bound the request so a hung feed can never leave infinite skeletons.
	const controller = new AbortController();
	const watchdog = setTimeout(() => controller.abort(), 20000);
	try {
		// B"H social fix 2: the tab endpoints (personalized/latest/popular)
		// only ever return the 2 "Write-path test" posts. Top up every page
		// from the base chronological feed so the hub shows real posts.
		// The mode source and the base source are consumed independently and
		// deduped by postId; the river is done only when both are exhausted.
		let items = [];
		if (!state.modeDone) {
			const url = `/api/social/feed/${mode.endpoint}?limit=${PAGE_SIZE}&offset=${state.nextOffset}`;
			const res = await fetch(url, { credentials: 'same-origin', signal: controller.signal });
			const data = await res.json();
			const payload = data.success || data;
			items = payload.items || [];
			state.nextOffset = payload.nextOffset;
			if (payload.nextOffset == null || items.length === 0) state.modeDone = true;
		}
		// B"H social fix 7 (defect 1): the mode endpoints return exactly
		// the 2 orphaned "Write-path test" posts, and the hub renders mode
		// items FIRST — so one of them tops every tab. Drop them from the
		// rendered list here (list-only, NOT a deletion), BEFORE the
		// top-up math: `need` is PAGE_SIZE - items.length, so filtering
		// first lets the ranked top-up fill the whole page with real
		// posts instead of leaving the orphaned card at position 1.
		items = items.filter((p) => !isOrphanedTestPost(p));
		// B"H social fix 2b: render the mode items NOW. The tab endpoints
			// respond; the base feed API can hang. The top-up must never block
			// the render, so it runs after, with a short 5s cap, and appends
			// whatever it returns. Until the backend is fixed the top-up will
			// time out and the river shows the tab posts — honest, and it renders.
		if (items.length) appendItems(items);
		// B"H social fix 9 (defect 2): serve a tab switch from the cached
		// first-page pool when it is fresh. The pool is mode-independent
		// and rankTopUp is pure, so the re-ranked list is IDENTICAL to
		// what a fresh 3-page scan would render — without the ~8.5s of
		// skeletons. The mode fetch above still runs (fast, ~0.9s) so mode
		// items keep their order ahead of the top-up; the skeleton shows
		// only for that fetch, not for the whole scan. If the cached rank
		// cannot fill a full page (thin pool, or overlap with mode items
		// already rendered), fall through to the normal scan.
		let servedFromCache = false;
		if (state.usePoolCache && poolCache && Date.now() - poolCache.at < POOL_CACHE_TTL_MS) {
			const cached = rankTopUp(poolCache.pool, state.mode, PAGE_SIZE - items.length)
				.filter((post) => {
					const id = String(post.postId || post.id || '');
					const ckey = contentKey(post);
					if (id && state.seenIds.has(id)) return false;
					if (ckey !== '|||' && state.seenContent.has(ckey)) return false;
					return true;
				});
			if (cached.length === PAGE_SIZE - items.length) {
				appendItems(cached);
				state.baseCursor = poolCache.cursor;
				state.baseDone = poolCache.baseDone;
				servedFromCache = true;
			}
		}
		if (!servedFromCache && items.length < PAGE_SIZE && !state.baseDone && Date.now() >= (state.baseNextRetry || 0)) {
			// B"H social fix 4 (defect 1): Fix 3's scan pre-added every real
			// row's postId to state.seenIds (and its content key to
			// state.seenContent) and only then called appendItems(extra) —
			// whose filter drops every post already in seenIds. The scan
			// therefore found 10 real posts and rendered 0 of them, and the
			// hub showed only the test post. The scan now dedupes within
			// itself (a LOCAL set) and lets appendItems own the global sets;
			// each page's extras append as they land, so an abort does not
			// discard them. The watchdog is 15s, not 5s: one base page takes
			// ~2.8s, so three pages cannot fit in 5s. A failed scan no longer
			// marks the base done (fail-once showed "caught up" with 1 post);
			// it sets a 10s retry backoff instead.
			try {
				const topController = new AbortController();
				const topWatchdog = setTimeout(() => topController.abort(), 15000);
				try {
					const need = PAGE_SIZE - items.length;
					let pagesScanned = 0;
					const scanSeen = new Set();
					const scanSeenContent = new Set();
					// B"H social fix 5 (defect 2): collect a POOL of real
					// posts first, then rank it by the tab's own rule
					// (rankTopUp) — the old code took the first N real rows
					// in base order for every mode, so all three tabs
					// showed the identical list. Latest stops early (its
					// ranking IS base order); Popular and For You scan the
					// full 3 pages so the ranking has a pool to work on.
					// Rows already shown (mode items) are excluded from
					// the pool up front, so the ranked top N are all new.
					const pool = [];
					const scanStartCursor = state.baseCursor;
					try {
						while (!state.baseDone && pagesScanned < 3) {
							if (state.mode === 'latest' && pool.length >= need) break;
							const qs = new URLSearchParams({ limit: '50' });
							if (state.baseCursor) qs.set('cursor', state.baseCursor);
							const baseRes = await fetch(`/api/social/feed?${qs}`, { credentials: 'same-origin', signal: topController.signal });
							if (!baseRes.ok) throw new Error('base feed ' + baseRes.status);
							const baseBody = await baseRes.json();
							const baseRows = Array.isArray(baseBody?.data) ? baseBody.data : (Array.isArray(baseBody?.success) ? baseBody.success : []);
							pagesScanned++;
							for (const row of baseRows.map(normalizeRiverPost)) {
								if (isBenchmarkPost(row)) continue;
								// B"H social fix 7 (defect 1): belt-and-braces —
								// the base feed never carries the orphaned test
								// posts (0 of the live 150-row sample), but if
								// it ever does they must not re-enter through
								// the top-up after being filtered from the mode
								// items.
								if (isOrphanedTestPost(row)) continue;
								const key = String(row.postId || row.id || '');
								const ckey = contentKey(row);
								if (!key) continue;
								if (scanSeen.has(key)) continue;
								if (ckey !== '|||' && scanSeenContent.has(ckey)) continue;
								if (state.seenIds.has(key)) continue;
								if (ckey !== '|||' && state.seenContent.has(ckey)) continue;
								scanSeen.add(key);
								if (ckey !== '|||') scanSeenContent.add(ckey);
								pool.push(row);
							}
							const pageInfo = baseBody?.meta?.pageInfo || {};
							state.baseCursor = pageInfo.nextCursor || '';
							if (!pageInfo.hasMore) state.baseDone = true;
						}
					} catch (scanError) {
						// A slow page must not discard the pool already
						// collected: rank and append what we have, then
						// rethrow so the backoff still applies.
						if (pool.length) appendItems(rankTopUp(pool, state.mode, need));
						snapshotPoolCache(pool, scanStartCursor);
						throw scanError;
					}
					if (pool.length) appendItems(rankTopUp(pool, state.mode, need));
					snapshotPoolCache(pool, scanStartCursor);
					if (pool.length === 0 && pagesScanned > 0) state.baseDone = true;
				} finally {
					clearTimeout(topWatchdog);
				}
			} catch (_) {
				// B"H social fix 4: a failed top-up (hang, abort, bad status)
				// must NOT mark the base done — that fail-once is what left
				// the hub showing 1 post with "caught up". Retry on the next
				// page fetch, after a 10s backoff.
				state.baseNextRetry = Date.now() + 10000;
				// B"H social fix 10 (defect 4): a failed scan on an EMPTY
				// river left the skeletons up FOREVER (rendered check
				// 2026-11-13: >87s of skeletons) — the mode fetch yields 0
				// renderable items (the 2 test posts are filtered), the
				// scan is the only source of cards, and a scan failure
				// only set a retry backoff without rendering anything.
				// Show the error/retry state when nothing has rendered
				// yet, so the hub is bounded (~16s worst case: mode fetch
				// + 15s scan watchdog) instead of infinite. showError()
				// is a no-op when cards already exist (offset > 0), and
				// appendItems() removes the .feed-empty error when a later
				// scan succeeds, so a retry can still fill the river.
				if (state.offset === 0) showError();
			}
		}
		if (state.modeDone && state.baseDone) state.done = true;
		if (!items.length && state.modeDone && state.baseDone) appendItems(items);
	} catch (err) {
		showError();
	} finally {
		clearTimeout(watchdog);
		state.loading = false;
		renderSentinel(false);
	}
}

function appendItems(items) {
	const river = document.getElementById('feed-river');
	if (!river) return;
	// B"H social fix 3 (defect 2): dedupe the LIST by postId AND content
	// key (title+alias+heichel+series). The mode items and the top-up
	// extras arrive through here separately, so the dedupe lives here —
	// the two "Write-path test" records (distinct postIds, identical
	// content) collapse to one. Never the underlying posts.
	items = (items || []).filter((post) => {
		const id = String(post.postId || post.id || '');
		const ckey = contentKey(post);
		if (id && state.seenIds.has(id)) return false;
		if (ckey !== '|||' && state.seenContent.has(ckey)) return false;
		if (id) state.seenIds.add(id);
		if (ckey !== '|||') state.seenContent.add(ckey);
		return true;
	});
	// Remove skeletons on first real content.
	river.querySelectorAll('.feed-skeleton').forEach(el => el.remove());
	// B"H social fix 2b: the river may be appended twice per page (mode items,
	// then the background top-up). If the first append showed the empty state
	// and the top-up later brings real items, drop the empty state first.
	if (items.length) river.querySelectorAll('.feed-empty').forEach(el => el.remove());
	if (state.offset === 0 && items.length === 0) {
		river.innerHTML = emptyHtml();
		return;
	}
	const html = items.map((post, i) => cardHtml(post, state.offset + i)).join('');
	river.insertAdjacentHTML('beforeend', html);
	state.offset += items.length;
	state.items.push(...items);
}

function isSignedIn() {
	// B"H social fix 3 (defect 5): the old check read only window.curAlias
	// (set asynchronously by the shell) or a ?alias= URL param — neither
	// is set on the hub page when a tab fetch fails, so a signed-in user
	// got the "Sign in to see your river" gate. Use the same alias
	// resolution as the feed page (window.curAlias, window.currentAlias,
	// body data-alias-id, localStorage), so the gate only shows for a
	// genuinely signed-out visitor; a signed-in user whose fetch fails
	// gets the "river paused" retry instead.
	try {
		const alias = window.curAlias || window.currentAlias
			|| document.body?.dataset?.aliasId
			|| localStorage.getItem('awtsmoos-alias')
			|| localStorage.getItem('awtsmoosAlias') || '';
		const clean = String(alias).trim().toLowerCase();
		if (!clean) return false;
		if (['seeker', 'anonymous', 'guest'].includes(clean)) return false;
		return true;
	} catch (_) { return !!window.curAlias; }
}

function signedOutHtml() {
	return '<div class="feed-empty">'
		+ '<div class="feed-empty__glyph">' + String.fromCharCode(10022) + '</div>'
		+ '<h2 class="feed-empty__title">Sign in to see your river</h2>'
		+ '<p class="feed-empty__text">Your personalized For You feed appears after you sign in — posts chosen from what you love, plus beautiful discoveries.</p>'
		+ '<a class="feed-empty__cta" href="/login/">Sign in</a>'
		+ '</div>';
}

function showError() {
	const river = document.getElementById('feed-river');
	if (!river) return;
	river.querySelectorAll('.feed-skeleton').forEach(el => el.remove());
	// BH QA sweep2 SOCIAL-SKELETONS: signed-out visitors get a sign-in prompt, never infinite skeletons.
	if (state.offset === 0 && !isSignedIn()) {
		river.innerHTML = signedOutHtml();
		return;
	}
	if (state.offset === 0) {
		river.innerHTML = `<div class="feed-empty">
			<div class="feed-empty__glyph">⚡</div>
			<h2 class="feed-empty__title">The river paused</h2>
			<p class="feed-empty__text">Something interrupted the feed. Take a breath and try again.</p>
			<button class="feed-empty__cta" id="feed-retry">Try Again</button>
		</div>`;
		document.getElementById('feed-retry')?.addEventListener('click', () => resetAndLoad());
	}
}

function renderSentinel(loading) {
	const s = document.getElementById('feed-sentinel');
	if (!s) return;
	s.innerHTML = loading
		? '<span class="feed-ptr__spinner"></span> Loading more…'
		: (state.done && state.offset > 0 ? '✦ You are all caught up' : '');
}

function resetAndLoad(useCache = true) {
	state.items = [];
	state.offset = 0;
	state.nextOffset = 0;
	state.done = false;
	state.modeDone = false;
	state.baseCursor = '';
	state.baseDone = false;
	state.baseNextRetry = 0;
	state.usePoolCache = useCache;
	state.seenIds = new Set();
	state.seenContent = new Set();
	const river = document.getElementById('feed-river');
	if (river) river.innerHTML = skeletonHtml(3);
	fetchPage();
}

function setMode(key) {
	if (state.mode === key) return;
	state.mode = key;
	document.querySelectorAll('.feed-mode-btn').forEach(btn => {
		btn.setAttribute('aria-selected', btn.dataset.mode === key ? 'true' : 'false');
	});
	try { localStorage.setItem('awtsmoos-feed-mode', key); } catch (_) {}
	resetAndLoad();
}

/* B"H 2026-10-13 — like-burst: re-trigger the shared mi-burst keyframes so the
   heart pops with a golden ring on every tap. */
function burstLike(btn) {
	btn.classList.remove('mi-burst');
	void btn.offsetWidth;
	btn.classList.add('mi-burst');
	btn.addEventListener('animationend', () => btn.classList.remove('mi-burst'), { once: true });
}

function onAction(e) {
	const btn = e.target.closest('.feed-action');
	if (!btn) return;
	const action = btn.dataset.action;
	const postId = btn.dataset.post;
	if (!action || !postId) return;

	if (action === 'like') {
		const liked = state.liked.has(postId);
		if (liked) state.liked.delete(postId); else state.liked.add(postId);
		btn.classList.toggle('feed-action--liked', !liked);
		btn.setAttribute('aria-pressed', String(!liked));
		burstLike(btn);
		const label = btn.querySelector('span');
		if (label) {
			const post = findPost(postId) || {};
			const base = Number(post.reactionCount || post.likes || 0);
			const next = liked ? Math.max(0, base - 1) : base + 1;
			post.reactionCount = next;
			label.textContent = `${next} Like${next === 1 ? '' : 's'}`;
		}
		// Fire-and-forget: record the reaction server-side.
		// B"H 2026-10-13: include heichelId — the endpoint requires it (MISSING_REACTION_TARGET otherwise).
		const post = findPost(postId) || {};
		fetch(`/api/social/reactions/post/${encodeURIComponent(postId)}`, {
			method: liked ? 'DELETE' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ emoji: '❤️', heichelId: post.heichelId || post.heichel || '' })
		}).catch(() => {});
	} else if (action === 'save') {
		const saved = state.saved.has(postId);
		if (saved) state.saved.delete(postId); else state.saved.add(postId);
		btn.setAttribute('aria-pressed', String(!saved));
		const label = btn.querySelector('span');
		if (label) label.textContent = !saved ? 'Saved' : 'Save';
	} else if (action === 'share') {
		const post = findPost(postId) || { postId };
		const url = `${location.origin}${postUrl(post)}`;
		if (navigator.share) {
			navigator.share({ title: 'Awtsmoos', url }).catch(() => {});
		} else if (navigator.clipboard) {
			navigator.clipboard.writeText(url).catch(() => {});
			const label = btn.querySelector('span');
			if (label) { label.textContent = 'Copied!'; setTimeout(() => label.textContent = 'Share', 1500); }
		}
	} else if (action === 'comment') {
		const post = findPost(postId) || { postId };
		location.href = postUrl(post) + '#comments';
	}
}

/** Pull-to-refresh on mobile: drag down at the top of the river. */
function initPullToRefresh() {
	const ptr = document.getElementById('feed-ptr');
	const river = document.getElementById('feed-river');
	if (!ptr || !river) return;
	let startY = 0, pulling = false;

	document.addEventListener('touchstart', e => {
		if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
	}, { passive: true });

	document.addEventListener('touchmove', e => {
		if (!pulling) return;
		const dy = e.touches[0].clientY - startY;
		if (dy > 70) ptr.setAttribute('data-active', 'true');
	}, { passive: true });

	document.addEventListener('touchend', () => {
		if (pulling && ptr.getAttribute('data-active') === 'true') {
			ptr.setAttribute('data-active', 'false');
			// B"H social fix 9 (defect 2): an explicit pull-to-refresh
			// must re-fetch — it bypasses the tab-switch pool cache
			// (and the fresh scan refreshes it).
			resetAndLoad(false);
		}
		pulling = false;
	}, { passive: true });
}

/** Infinite scroll via IntersectionObserver. */
function initInfiniteScroll() {
	const sentinel = document.getElementById('feed-sentinel');
	if (!sentinel || !('IntersectionObserver' in window)) return;
	new IntersectionObserver(entries => {
		if (entries[0].isIntersecting) fetchPage();
	}, { rootMargin: '600px' }).observe(sentinel);
}

export function initFeedRiver() {
	const mount = document.getElementById('feed-river-mount');
	if (!mount) return;

	// Restore preferred mode.
	try {
		const saved = localStorage.getItem('awtsmoos-feed-mode');
		if (saved && MODES.some(m => m.key === saved)) state.mode = saved;
	} catch (_) {}

	mount.innerHTML = `
		<div class="feed-mode-toggle" role="tablist" aria-label="Feed mode">
			${MODES.map(m => `
				<button class="feed-mode-btn" role="tab" data-mode="${m.key}"
					aria-selected="${m.key === state.mode}">${m.label}</button>`).join('')}
			<button class="feed-mode-btn feed-ask-btn" data-ask-question aria-label="Ask a question">❓ Ask</button>
		</div>
		<div class="feed-ptr" id="feed-ptr" aria-hidden="true">
			<span class="feed-ptr__spinner"></span> Refreshing…
		</div>
		<div class="feed-river" id="feed-river" aria-live="polite">
			${skeletonHtml(3)}
		</div>
		<div class="feed-sentinel" id="feed-sentinel"></div>`;

	mount.querySelectorAll('.feed-mode-btn').forEach(btn => {
		btn.addEventListener('click', () => setMode(btn.dataset.mode));
	});
	mount.addEventListener('click', onAction);

	initPullToRefresh();
	initInfiniteScroll();
	// B"H — fetch maamar links in background; re-render cards once loaded so
	// "Read the full maamar →" appears without blocking the feed.
	loadMaamarLinks().then(() => {
		if (!state.maamarLinks) return;
		const river = document.getElementById('feed-river');
		if (!river || !state.items.length) return;
		river.innerHTML = state.items.map((post, i) => cardHtml(post, i)).join('');
	});
	fetchPage();
}
