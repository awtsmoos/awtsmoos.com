// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RelatedPosts
 * @description
 * Yaakov 2026-10-13: every post view gets a "Related" shelf below it —
 * automatically related, never curated by hand, never clickbait.
 *
 * Relatedness is scored in strict priority order:
 *   1. Same seriesId (same series) — strongest signal.
 *   2. Same basePostId (same source maamar) — for social posts.
 *   3. Same heichelId + overlapping hashtags/topics.
 *   4. Keyword similarity: simple TF-IDF cosine over title + description.
 *
 * Candidates are fetched through the existing feed API
 * (/api/social/feed/discover, /api/social/feed/heichel/:h, and the series
 * details route) and filtered/scored client-side; callers may also pass
 * already-loaded posts as candidates. Candidates below the relevance floor
 * never render — an honest empty state beats a clickbait shelf.
 *
 * Mount points:
 *   - Full post page: mountRelatedPostsForReader() (called from the reader
 *     boot; never breaks reading).
 *   - Any expanded inline view: render a <div data-related-posts> slot and
 *     call autoMountRelatedPosts(), or call mountRelatedPosts() directly.
 * Each related card links to the full post and carries an inline "Preview"
 * toggle that expands the card in place without navigating.
 */

import { escapeHtml, escapeAttr } from './icons.js';

/* ------------------------------------------------------------------ */
/* Scoring                                                              */
/* ------------------------------------------------------------------ */

export const RELATED_WEIGHTS = {
	sameSeries: 100,
	sameBasePost: 60,
	sameHeichel: 20,
	tagOverlapEach: 15,
	tagOverlapMax: 45,
	keyword: 40,
	recencyTiebreak: 0.5
};

/** Relevance floor: a candidate must show at least one genuine signal. */
export const MIN_RELATED_SCORE = 2;

export const RELATED_LIMIT = 5;

/** Common English + Hebrew glue words — never carry meaning. */
const STOP_WORDS = new Set([
	'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'by',
	'from', 'at', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'its',
	'this', 'that', 'these', 'those', 'he', 'she', 'they', 'we', 'you', 'i',
	'his', 'her', 'their', 'our', 'your', 'not', 'but', 'what', 'when', 'where',
	'who', 'how', 'why', 'which', 'all', 'any', 'can', 'will', 'just', 'than',
	'then', 'there', 'here', 'more', 'most', 'such', 'into', 'over', 'after',
	'before', 'between', 'through', 'also', 'about', 'both', 'each', 'other',
	'shalom',
	// Hebrew glue words
	'של', 'את', 'על', 'אל', 'עם', 'כי', 'זה', 'זאת', 'היא', 'הוא', 'הם', 'הן',
	'אשר', 'לא', 'כן', 'גם', 'או', 'אם', 'מה', 'מי', 'כל', 'בין', 'מן', 'כמו',
	'יש', 'אין', 'היה', 'היו', 'תהיה', 'יהיה', 'להיות', 'עד', 'רק', 'אבל', 'אז',
	'פה', 'שם', 'מאוד', 'יותר', 'הרי', 'הנה', 'אולי', 'כבר', 'עוד', 'גם', 'כך',
	'ככה', 'ולא', 'וגם', 'שהוא', 'שהיא', 'שלהם', 'שלו', 'שלה', 'בכל', 'לכל'
]);

/**
 * Identity of a post for scoring/dedup. Never surfaces raw ids to the UI.
 * @param {object} post
 * @returns {string}
 */
export function relatedKey(post = {}) {
	return String(post.postId || post.id || '');
}

/**
 * All text that describes a post for keyword comparison.
 * @param {object} post
 * @returns {string}
 */
export function relatedText(post = {}) {
	return [
		post.title || post.name || '',
		post.heTitle || '',
		post.excerpt || post.summary || post.description || ''
	].join(' ').trim();
}

/**
 * Lowercased keyword tokens, stopwords removed.
 * @param {string} text
 * @returns {string[]}
 */
export function extractKeywords(text = '') {
	return String(text)
		.toLowerCase()
		.replace(/[#@"'`"״״‘’“”«»]/g, ' ')
		.split(/[^\p{L}\p{N}]+/u)
		.map(t => t.trim())
		.filter(t => t.length > 1 && !/^\d+$/.test(t) && !STOP_WORDS.has(t));
}

/**
 * Tag/topic set: explicit tag fields plus #hashtags in the text.
 * @param {object} post
 * @returns {Set<string>}
 */
export function tagSet(post = {}) {
	const tags = new Set();
	const fields = ['hashtags', 'tags', 'topics', 'keywords', 'categories'];
	for (const field of fields) {
		const val = post[field];
		if (Array.isArray(val)) {
			for (const t of val) {
				const clean = String(t).replace(/^#/, '').trim().toLowerCase();
				if (clean) tags.add(clean);
			}
		}
	}
	const textTags = String(relatedText(post)).match(/#[\p{L}\p{N}_-]+/gu) || [];
	for (const t of textTags) tags.add(t.slice(1).toLowerCase());
	return tags;
}

function termFreq(tokens) {
	const tf = new Map();
	for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
	if (tokens.length) for (const [k, v] of tf) tf.set(k, v / tokens.length);
	return tf;
}

function buildIdf(tokenLists) {
	const n = Math.max(1, tokenLists.length);
	const df = new Map();
	for (const tokens of tokenLists) {
		for (const t of new Set(tokens)) df.set(t, (df.get(t) || 0) + 1);
	}
	const idf = new Map();
	for (const [t, d] of df) idf.set(t, Math.log(n / d));
	return idf;
}

function cosineSim(tfA, tfB, idf) {
	let dot = 0;
	let magA = 0;
	let magB = 0;
	for (const [t, a] of tfA) {
		const w = a * (idf.get(t) || 0);
		magA += w * w;
		const b = tfB.get(t);
		if (b) dot += w * b * (idf.get(t) || 0);
	}
	for (const [t, b] of tfB) {
		const w = b * (idf.get(t) || 0);
		magB += w * w;
	}
	if (!magA || !magB) return 0;
	return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Scores one candidate against the source post.
 * @param {object} source The post being viewed.
 * @param {object} candidate A related-post candidate.
 * @param {Map<string,number>} [idf] Prebuilt inverse document frequencies.
 * @returns {{ score: number, reasons: string[] }}
 */
export function scoreRelatedPair(source = {}, candidate = {}, idf = null) {
	const reasons = [];
	let score = 0;
	const same = (a, b) => a && b && String(a) === String(b);

	if (same(source.seriesId || source.series, candidate.seriesId || candidate.series)) {
		score += RELATED_WEIGHTS.sameSeries;
		reasons.push('Same series');
	}
	if (same(source.basePostId || source.base_post_id, candidate.basePostId || candidate.base_post_id)) {
		score += RELATED_WEIGHTS.sameBasePost;
		reasons.push('Same maamar');
	}
	if (same(source.heichelId || source.heichel, candidate.heichelId || candidate.heichel)) {
		score += RELATED_WEIGHTS.sameHeichel;
		const shared = [...tagSet(candidate)].filter(t => tagSet(source).has(t));
		if (shared.length) {
			score += Math.min(RELATED_WEIGHTS.tagOverlapMax, shared.length * RELATED_WEIGHTS.tagOverlapEach);
			reasons.push(shared.length === 1 ? 'Shared topic' : 'Shared topics');
		}
	}
	if (idf) {
		const sim = cosineSim(
			termFreq(extractKeywords(relatedText(source))),
			termFreq(extractKeywords(relatedText(candidate))),
			idf
		);
		if (sim > 0) {
			score += sim * RELATED_WEIGHTS.keyword;
			if (sim > 0.25) reasons.push('Similar subject');
		}
	}
	// Tiny recency tiebreak so ordering is stable and fresh voices surface.
	const ageDays = Math.max(0, (Date.now() - (Number(candidate.updatedAt || candidate.createdAt) || 0)) / 86400000);
	score += (1 - Math.min(1, ageDays / 365)) * RELATED_WEIGHTS.recencyTiebreak;

	return { score, reasons: reasons.slice(0, 2) };
}

/**
 * Finds the most related posts for a source post.
 * @param {object} source The post being viewed.
 * @param {object[]} candidates Candidate posts.
 * @param {object} [opts]
 * @param {number} [opts.limit=5]
 * @returns {{ post: object, score: number, reasons: string[] }[]}
 */
export function findRelatedPosts(source = {}, candidates = [], { limit = RELATED_LIMIT } = {}) {
	const sourceKey = relatedKey(source);
	const pool = (Array.isArray(candidates) ? candidates : [])
		.filter(c => c && relatedKey(c) && relatedKey(c) !== sourceKey);
	if (!pool.length) return [];
	const tokenLists = [extractKeywords(relatedText(source))];
	for (const c of pool) tokenLists.push(extractKeywords(relatedText(c)));
	const idf = buildIdf(tokenLists);
	return pool
		.map(post => ({ post, ...scoreRelatedPair(source, post, idf) }))
		.filter(entry => entry.score >= MIN_RELATED_SCORE)
		.sort((a, b) => b.score - a.score)
		.slice(0, Math.max(1, limit));
}

/* ------------------------------------------------------------------ */
/* Candidate fetching                                                   */
/* ------------------------------------------------------------------ */

async function fetchFeedJson(url) {
	const res = await fetch(url, { credentials: 'same-origin' });
	if (!res.ok) throw new Error(`related fetch ${res.status}`);
	const body = await res.json().catch(() => null);
	const data = body?.success ?? body ?? {};
	return Array.isArray(data.items) ? data.items
		: Array.isArray(data.posts) ? data.posts
		: [];
}

function dedupePosts(lists) {
	const seen = new Set();
	const out = [];
	for (const list of lists) {
		for (const post of list || []) {
			const key = relatedKey(post);
			if (!key || seen.has(key)) continue;
			seen.add(key);
			out.push(post);
		}
	}
	return out;
}

/**
 * Fetches related-post candidates through the existing feed API.
 * Best effort: any failing source is skipped, the rest still score.
 * @param {object} source The post being viewed.
 * @param {object} [opts]
 * @returns {Promise<object[]>}
 */
export async function fetchRelatedCandidates(source = {}, { discoverLimit = 100 } = {}) {
	const jobs = [
		fetchFeedJson(`/api/social/feed/discover?limit=${discoverLimit}&offset=0`).catch(() => [])
	];
	const heichelId = source.heichelId || source.heichel;
	if (heichelId) {
		jobs.push(fetchFeedJson(`/api/social/feed/heichel/${encodeURIComponent(heichelId)}?limit=50&offset=0`).catch(() => []));
		const seriesId = source.seriesId || source.series;
		if (seriesId && String(seriesId) !== 'root') {
			// Same-series posts, straight from the series route (best effort).
			jobs.push(fetchFeedJson(
				`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/details`
			).then(items => items.map(p => ({ ...p, seriesId: p.seriesId || seriesId, heichelId: p.heichelId || heichelId }))).catch(() => []));
		}
	}
	const pages = await Promise.all(jobs);
	const sourceKey = relatedKey(source);
	return dedupePosts(pages).filter(p => relatedKey(p) !== sourceKey);
}

/* ------------------------------------------------------------------ */
/* Rendering                                                            */
/* ------------------------------------------------------------------ */

const STYLES_ID = 'related-posts-styles';

function authorName(post = {}) {
	return post.authorName || post.aliasName || post.aliasId || post.author || 'Awtsmoos';
}

function excerptOf(post = {}, length = 140) {
	const text = post.excerpt || post.summary || post.description || '';
	return String(text).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, length);
}

function postHref(post = {}) {
	const h = post.heichelId || post.heichel || 'ikar';
	const s = post.seriesId || post.series || 'root';
	const p = relatedKey(post);
	return `/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}/${encodeURIComponent(p)}`;
}

function ensureStyles() {
	if (document.getElementById(STYLES_ID)) return;
	const style = document.createElement('style');
	style.id = STYLES_ID;
	style.textContent = `
/* B"H — Related Posts shelf. Scoped, token-colored, no forced overrides. */
.related-posts {
	margin: 40px auto 24px;
	max-width: 860px;
	padding: 0 20px;
	color: var(--aw-text, #f5efe2);
}
.related-posts-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 14px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--aw-line, rgba(212, 169, 78, 0.28));
}
.related-posts-title {
	margin: 0;
	font-size: 20px;
	font-weight: 800;
	letter-spacing: 0.01em;
	color: var(--aw-text, #f5efe2);
}
.related-posts-sub {
	margin: 0;
	font-size: 13px;
	color: var(--aw-text-soft, #b8a88f);
}
[data-theme="light"] .related-posts { color: var(--aw-text, #241a05); }
[data-theme="light"] .related-posts-title { color: var(--aw-text, #241a05); }
[data-theme="light"] .related-posts-sub { color: var(--aw-text-soft, #6b5c40); }
.related-posts-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
	gap: 14px;
}
.related-post-card {
	position: relative;
	display: flex;
	flex-direction: column;
	padding: 14px 14px 12px;
	border: 1px solid var(--aw-line, rgba(212, 169, 78, 0.28));
	border-radius: 0;
	background: var(--aw-surface, rgba(255, 255, 255, 0.03));
	transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
[data-theme="light"] .related-post-card {
	background: var(--aw-surface, rgba(255, 255, 255, 0.65));
}
.related-post-card:hover {
	transform: translateY(-2px);
	border-color: var(--aw-accent, #d4a94e);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.related-post-why {
	display: inline-flex;
	align-self: flex-start;
	margin-bottom: 8px;
	padding: 3px 9px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--aw-accent, #d4a94e);
	border: 1px solid var(--aw-line, rgba(212, 169, 78, 0.4));
	border-radius: 0;
}
.related-post-title {
	margin: 0 0 6px;
	font-size: 15px;
	line-height: 1.35;
	font-weight: 700;
}
.related-post-title a {
	color: var(--aw-text, #f5efe2);
	text-decoration: none;
}
[data-theme="light"] .related-post-title a { color: var(--aw-text, #241a05); }
.related-post-title a:hover { color: var(--aw-accent, #d4a94e); }
.related-post-title a:focus-visible {
	outline: 2px solid var(--aw-focus-ring, #5bddff);
	outline-offset: 2px;
	border-radius: 0;
}
.related-post-author {
	margin: 0 0 8px;
	font-size: 12px;
	color: var(--aw-text-soft, #b8a88f);
}
[data-theme="light"] .related-post-author { color: var(--aw-text-soft, #6b5c40); }
.related-post-excerpt {
	margin: 0 0 10px;
	font-size: 13px;
	line-height: 1.5;
	color: var(--aw-text, #f5efe2);
	opacity: 0.85;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
[data-theme="light"] .related-post-excerpt { color: var(--aw-text, #2c2110); }
.related-post-foot {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 8px;
}
.related-post-expand {
	appearance: none;
	padding: 7px 12px;
	font-size: 12px;
	font-weight: 700;
	color: var(--aw-text, #f5efe2);
	background: transparent;
	border: 1px solid var(--aw-line, rgba(212, 169, 78, 0.4));
	border-radius: 0;
	cursor: pointer;
	transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
}
[data-theme="light"] .related-post-expand { color: var(--aw-text, #241a05); }
.related-post-expand:hover {
	border-color: var(--aw-accent, #d4a94e);
	color: var(--aw-accent, #d4a94e);
}
.related-post-expand:active { transform: translateY(1px); }
.related-post-expand:focus-visible {
	outline: 2px solid var(--aw-focus-ring, #5bddff);
	outline-offset: 2px;
}
.related-post-open {
	font-size: 12px;
	font-weight: 700;
	color: var(--aw-accent, #d4a94e);
	text-decoration: none;
}
.related-post-open:hover { text-decoration: underline; }
.related-post-open:focus-visible {
	outline: 2px solid var(--aw-focus-ring, #5bddff);
	outline-offset: 2px;
	border-radius: 0;
}
.related-post-more {
	display: none;
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px dashed var(--aw-line, rgba(212, 169, 78, 0.35));
	font-size: 13px;
	line-height: 1.55;
	color: var(--aw-text, #f5efe2);
	opacity: 0.9;
}
[data-theme="light"] .related-post-more { color: var(--aw-text, #2c2110); }
.related-post-card.is-expanded .related-post-more { display: block; }
.related-post-card.is-expanded .related-post-excerpt { -webkit-line-clamp: 8; }
.related-post-meta {
	margin: 8px 0 0;
	font-size: 12px;
	color: var(--aw-text-soft, #b8a88f);
}
[data-theme="light"] .related-post-meta { color: var(--aw-text-soft, #6b5c40); }
.related-posts-empty {
	padding: 18px;
	font-size: 14px;
	color: var(--aw-text-soft, #b8a88f);
	border: 1px dashed var(--aw-line, rgba(212, 169, 78, 0.35));
	border-radius: 0;
	text-align: center;
}
[data-theme="light"] .related-posts-empty { color: var(--aw-text-soft, #6b5c40); }
.related-posts-loading .rp-skel {
	height: 12px;
	margin: 10px 0;
	border-radius: 0;
	background: linear-gradient(90deg, rgba(212,169,78,0.08), rgba(212,169,78,0.22), rgba(212,169,78,0.08));
	background-size: 200% 100%;
	animation: rp-shimmer 1.2s ease-in-out infinite;
}
@keyframes rp-shimmer {
	0% { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
	.related-post-card { transition: none; }
	.related-posts-loading .rp-skel { animation: none; }
}
`;
	document.head.append(style);
}

function skeletonHtml() {
	return `<div class="related-posts-loading" aria-hidden="true">
		<div class="rp-skel" style="width:60%"></div>
		<div class="rp-skel" style="width:85%"></div>
		<div class="rp-skel" style="width:70%"></div>
	</div>`;
}

/**
 * Builds one compact related-post card. The card links to the full post;
 * the Preview button expands the card inline without navigating.
 * @param {{ post: object, score: number, reasons: string[] }} entry
 * @returns {HTMLElement}
 */
export function renderRelatedCard(entry) {
	const { post, reasons } = entry;
	const href = postHref(post);
	const why = reasons.length ? reasons[0] : 'Related';
	const longExcerpt = excerptOf(post, 600);
	const heichelName = post.heichelName || post.heichelId || post.heichel || '';
	const card = document.createElement('article');
	card.className = 'related-post-card';
	card.dataset.postId = relatedKey(post);
	card.setAttribute('aria-label', `Related: ${post.title || post.name || 'Post'}`);
	card.innerHTML = `
		<span class="related-post-why">${escapeHtml(why)}</span>
		<h4 class="related-post-title" dir="auto"><a href="${escapeAttr(href)}">${escapeHtml(post.title || post.name || 'Untitled')}</a></h4>
		<p class="related-post-author">by ${escapeHtml(authorName(post))}</p>
		${excerptOf(post) ? `<p class="related-post-excerpt" dir="auto">${escapeHtml(excerptOf(post))}</p>` : ''}
		<div class="related-post-foot">
			<button type="button" class="related-post-expand" aria-expanded="false">Preview</button>
			<a class="related-post-open" href="${escapeAttr(href)}">Open full post</a>
		</div>
		<div class="related-post-more" dir="auto">
			${longExcerpt ? `<p>${escapeHtml(longExcerpt)}</p>` : '<p>No excerpt available.</p>'}
			${heichelName ? `<p class="related-post-meta">From ${escapeHtml(heichelName)}</p>` : ''}
		</div>`;

	const expandBtn = card.querySelector('.related-post-expand');
	expandBtn.addEventListener('click', () => {
		const open = card.classList.toggle('is-expanded');
		expandBtn.setAttribute('aria-expanded', String(open));
		expandBtn.textContent = open ? 'Close preview' : 'Preview';
	});
	return card;
}

/**
 * Renders the Related section into a container.
 * @param {object} opts
 * @param {HTMLElement} opts.container Where the section renders.
 * @param {object} opts.post The post being viewed.
 * @param {object[]} [opts.candidates] Already-loaded posts; when omitted the
 *   module fetches from the feed API.
 * @param {number} [opts.limit=5]
 * @param {string} [opts.title='Related posts']
 * @returns {Promise<{ post: object, score: number, reasons: string[] }[]>}
 */
export async function mountRelatedPosts({ container, post, candidates = null, limit = RELATED_LIMIT, title = 'Related posts' } = {}) {
	if (!container || !post) return [];
	ensureStyles();
	const section = document.createElement('section');
	section.className = 'related-posts';
	section.setAttribute('aria-label', title);
	const headingId = `related-posts-title-${Math.random().toString(36).slice(2, 8)}`;
	section.innerHTML = `
		<div class="related-posts-head">
			<h3 class="related-posts-title" id="${headingId}">${escapeHtml(title)}</h3>
			<p class="related-posts-sub">Automatically related — no curation, no clickbait.</p>
		</div>
		<div class="related-posts-body">${skeletonHtml()}</div>`;
	section.setAttribute('aria-labelledby', headingId);
	container.append(section);
	const body = section.querySelector('.related-posts-body');

	let pool = candidates;
	if (!pool) {
		try {
			pool = await fetchRelatedCandidates(post);
		} catch (_) {
			pool = [];
		}
	}
	const related = findRelatedPosts(post, pool, { limit });
	body.innerHTML = '';
	if (!related.length) {
		body.innerHTML = `<p class="related-posts-empty">Nothing closely related yet — new voices join the river every day.</p>`;
		return [];
	}
	const grid = document.createElement('div');
	grid.className = 'related-posts-grid';
	for (const entry of related) grid.append(renderRelatedCard(entry));
	body.append(grid);
	return related;
}

/* ------------------------------------------------------------------ */
/* Reader + inline-view hooks                                             */
/* ------------------------------------------------------------------ */

/**
 * Reads the current post's identity from the reader page: window.post,
 * body dataset, then the /heichelos/:h/series/:s/:p URL.
 * @returns {object}
 */
export function readSourceFromReaderPage() {
	const win = typeof window !== 'undefined' ? window : {};
	const doc = typeof document !== 'undefined' ? document : null;
	const p = win.post || {};
	const dataset = (doc && doc.body && doc.body.dataset) || {};
	let heichelId = p.heichelId || p.heichel || dataset.heichelId || '';
	let seriesId = p.seriesId || p.series || dataset.seriesId || '';
	let postId = p.postId || p.id || dataset.postId || '';
	try {
		const m = String(win.location?.pathname || '').match(/\/heichelos\/([^/]+)\/series\/([^/]+)\/([^/?#]+)/);
		if (m) {
			heichelId = heichelId || decodeURIComponent(m[1]);
			seriesId = seriesId || decodeURIComponent(m[2]);
			postId = postId || decodeURIComponent(m[3]);
		}
	} catch (_) { /* pathname unreadable */ }
	const metaDesc = doc?.querySelector('meta[name="description"]')?.getAttribute('content') || '';
	const h1 = doc?.querySelector('h1')?.textContent || '';
	return {
		postId,
		seriesId,
		heichelId,
		basePostId: p.basePostId || p.base_post_id || dataset.basePostId || '',
		title: p.title || p.name || h1 || (doc ? doc.title : ''),
		heTitle: p.heTitle || '',
		excerpt: p.excerpt || p.summary || p.description || metaDesc,
		hashtags: p.hashtags || p.tags || p.topics || []
	};
}

/**
 * Mounts the Related section below the post on the full post (reader) page.
 * Safe to call any time after the reader content exists; never throws.
 * @returns {Promise<array>}
 */
export async function mountRelatedPostsForReader() {
	try {
		const doc = typeof document === 'undefined' ? null : document;
		if (!doc) return [];
		if (doc.querySelector('.related-posts')) return [];
		const content = doc.getElementById('realPost');
		const anchor = content || doc.querySelector('.main') || doc.body;
		if (!anchor) return [];
		const slot = doc.createElement('div');
		slot.className = 'related-posts-slot';
		if (content && content.parentNode) content.after(slot);
		else anchor.append(slot);
		const source = readSourceFromReaderPage();
		if (!relatedKey(source)) return [];
		return await mountRelatedPosts({ container: slot, post: source });
	} catch (_) {
		return [];
	}
}

/**
 * Mounts every declarative slot: <div data-related-posts
 * data-related-source='{"postId":"…","seriesId":"…",…}'></div>.
 * Expanded inline views can drop this markup under an open card and call
 * this — no import coupling required.
 */
export function autoMountRelatedPosts() {
	if (typeof document === 'undefined') return;
	for (const slot of document.querySelectorAll('[data-related-posts]')) {
		if (slot.dataset.relatedMounted === 'true') continue;
		slot.dataset.relatedMounted = 'true';
		let source = {};
		try {
			source = JSON.parse(slot.dataset.relatedSource || '{}');
		} catch (_) { /* fall through to article dataset */ }
		const host = slot.closest('[data-post-id]') || slot;
		const ds = host.dataset || {};
		source = {
			postId: source.postId || ds.postId || '',
			seriesId: source.seriesId || ds.seriesId || '',
			heichelId: source.heichelId || ds.heichelId || '',
			basePostId: source.basePostId || ds.basePostId || '',
			title: source.title || ds.postTitle || '',
			heTitle: source.heTitle || '',
			excerpt: source.excerpt || source.description || '',
			hashtags: source.hashtags || []
		};
		if (!relatedKey(source)) continue;
		mountRelatedPosts({ container: slot, post: source }).catch(() => { /* silent */ });
	}
}
