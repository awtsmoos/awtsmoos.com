//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfilePosts
 * @description Every post an alias published, as real links to the live posts.
 */
import { one, replaceWith, cleanText, setStat } from "./dom.js";
import { emptyCard } from "./cards.js";
import { apiJson, listFrom } from "./api.js";
import { postRouteFor } from "./postRoute.js";
import { state } from "./state.js";

/** Counts by postId, from the base feed's socialSummary (one call).
 * The profile posts endpoint carries no comment/reaction counts, so they are
 * filled from the feed API, which does. Posts the base feed does not cover
 * get their comment count from the comment-tree meta (see enrichCounts). */
const countsByPostId = new Map();
let countsLoaded = false;
async function loadCounts() {
	if (countsLoaded) return;
	countsLoaded = true;
	try {
		const data = await apiJson("/api/social/feed?limit=200", { timeoutMs: 12000 });
		const rows = listFrom(data);
		for (const row of rows) {
			const key = String(row.id || row.postId || "");
			if (!key) continue;
			const ss = row.socialSummary || {};
			countsByPostId.set(key, {
				comments: Number((ss.comments || {}).total || 0),
				reactions: Number((ss.reactions || {}).total || 0)
			});
		}
	} catch { /* counts stay unknown; cards render without them */ }
}

/** Comment count for one post, from the comment-tree ROWS (genuine comments only).
 * B"H social fix 12 (defect 3): meta.native is NOT a total — it equals the
 * page limit (limit=1 → native=1, limit=5 → native=5, limit=100 →
 * native=100, proven live on the meluket post, whose 100 rows are ALL
 * imported translation phrases with zero genuine comments). Counting meta
 * therefore showed "1 Comment" on a post with no real comments, while the
 * header Comments stat (comments the user WROTE, via the per-alias
 * /comments endpoint) correctly read 0. The rows are the ground truth: a
 * row without importedAt is a genuine user comment; rows WITH importedAt
 * are imported translation phrases, not comments. */
async function fetchCommentCount(post) {
	try {
		const heichel = post.heichelId || post.heichel || "ikar";
		const id = post.postId || post.id || "";
		if (!id) return null;
		const data = await apiJson(`/api/social/heichelos/${encodeURIComponent(heichel)}/posts/${encodeURIComponent(id)}/comment-tree?limit=100`, { timeoutMs: 9000 });
		const rows = listFrom(data);
		return rows.filter((row) => !row.importedAt).length;
	} catch { return null; }
}

/** Fills in comment counts for rendered cards the base feed did not cover.
 * Runs in the background, 5 at a time, and updates the card in place. */
async function enrichCounts(cards) {
	const pending = cards.filter((c) => c && !countsByPostId.has(String(c.dataset.postId || "")));
	for (let start = 0; start < pending.length; start += 5) {
		const batch = pending.slice(start, start + 5);
		await Promise.all(batch.map(async (card) => {
			const post = card.__post || {};
			const n = await fetchCommentCount(post);
			if (n == null) return;
			countsByPostId.set(String(card.dataset.postId || ""), { comments: n, reactions: 0 });
			const el = card.querySelector(".social-post-counts");
			if (el) el.textContent = countsText({ comments: n, reactions: 0 });
		}));
	}
}

function countsText(counts) {
	if (!counts) return "";
	const c = Number(counts.comments || 0);
	const r = Number(counts.reactions || 0);
	return `💬 ${c} Comment${c === 1 ? "" : "s"} · ❤️ ${r} Reaction${r === 1 ? "" : "s"}`;
}

/** B"H social fix 5 (defect 4): test posts are never shown in the
 * profile Posts list (the underlying posts are NOT deleted). Same
 * markers as the feed's isBenchmarkPost (feed.js, feed-river.js) plus
 * the Worker J submission series, whose posts arrive here through the
 * per-alias posts endpoint rather than the base feed. */
function isTestPost(post = {}) {
	const heichel = String(post.heichelId || post.heichel || '').toLowerCase();
	if (heichel === 'bench-speed') return true;
	const series = String(post.seriesId || post.series || '').toLowerCase();
	if (series === 'platform-proof-submissions') return true;
	if (series === 'submissions-test-j') return true;
	if (String(post.aliasId || post.author || '').toLowerCase() === 'bench-import') return true;
	if (/test submission/i.test(String(post.title || post.postTitle || ''))) return true;
	if (/^worker j\b/i.test(String(post.title || post.postTitle || '').trim())) return true;
	return false;
}

/** Builds one post card linking to the live post. */
function postCard(post = {}) {
	const id = cleanText(post.id || post.postId || "");
	const title = cleanText(post.title || post.heading || id || "Untitled post");
	const url = postRouteFor(post);
	const card = document.createElement("article");
	card.className = "social-post-card";
	card.dataset.postId = id;
	card.__post = post;
	const link = document.createElement("a");
	link.className = "social-post-link";
	if (url) link.href = url;
	const heading = document.createElement("h3");
	heading.textContent = title;
	link.append(heading);
	card.append(link);
	const meta = document.createElement("p");
	meta.className = "social-post-meta";
	// B"H social fix 2: the records carry heichelId/heichelName and seriesId
	// (not seriesTitle/series), so the old code showed no label at all.
	const bits = [];
	const heichel = cleanText(post.heichelName || post.heichelId || "");
	if (heichel) bits.push(heichel);
	const series = cleanText(post.seriesTitle || post.seriesId || post.series || "");
	if (series) bits.push(series);
	if (post.createdAt) {
		try { bits.push(new Date(post.createdAt).toLocaleDateString()); } catch { /* keep raw */ }
	}
	if (post.excerpt || post.summary) {
		const ex = document.createElement("p");
		ex.className = "social-post-excerpt";
		ex.textContent = cleanText(post.excerpt || post.summary).slice(0, 180);
		card.append(ex);
	}
	meta.textContent = bits.join(" · ");
	if (bits.length) card.append(meta);
	const counts = countsByPostId.get(id);
	const countsEl = document.createElement("p");
	countsEl.className = "social-post-counts";
	countsEl.textContent = counts ? countsText(counts) : "";
	card.append(countsEl);
	// B"H social fix 3 (defect 10): make the whole card open the post.
	// The title is a real <a href> (postRouteFor) and no handler in the
	// profile code intercepts it, so a plain title click SHOULD navigate;
	// the rendered check still saw it not navigate, which no code-level
	// cause explains (no interceptor, no pointer-events block, no
	// :active transform on the link). The card-level handler below
	// guarantees a click anywhere on the card — title included — opens
	// the post even if the anchor's own default is somehow swallowed,
	// and it is the normal card affordance anyway. Clicks on a link or
	// button inside the card keep their own behavior.
	// B"H social fix 5 (defect 1): the click itself is the failure, so a
	// click-only fallback cannot fix it. A pointerdown on the card arms a
	// 2s timer to navigate to the link; a pointermove (a drag/scroll) or
	// a pointerup or a click on the card cancels it, so a normal tap
	// navigates by its own click and a drag never navigates. The timer
	// only fires when the pointer went down on a link and then NOTHING
	// followed on the card for 2s — the exact signature of a swallowed
	// click (the element moved between pointerdown and pointerup, e.g. a
	// focus scroll, so the pointerup and the click land elsewhere).
	// Same-origin links only.
	let pendingNavTimer = null;
	const cancelPendingNav = () => {
		if (pendingNavTimer !== null) {
			clearTimeout(pendingNavTimer);
			pendingNavTimer = null;
		}
	};
	card.addEventListener('pointerdown', (event) => {
		const link = event.target.closest('a');
		if (!link || !link.href || link.origin !== window.location.origin || link.href.endsWith('#')) return;
		cancelPendingNav();
		const href = link.href;
		const before = window.location.href;
		pendingNavTimer = setTimeout(() => {
			pendingNavTimer = null;
			if (window.location.href !== before) return;
			window.location.assign(href);
		}, 2000);
	});
	card.addEventListener('pointermove', cancelPendingNav);
	card.addEventListener('pointerup', cancelPendingNav);
	card.addEventListener('click', (event) => {
		cancelPendingNav();
		const link = event.target.closest('a');
		if (link) {
			// B"H social fix 4 (defect 3): the title link is a real <a> and
			// its native navigation is the path — but the rendered check saw
			// a plain title click hang with a stuck progress bar (the SPA
			// navigation never committing). If the URL has not changed ~3s
			// after the click, force a full load of the link. A healthy
			// navigation (native or SPA) changes the URL first, so the timer
			// then does nothing. Same-origin links only.
			if (link.href && link.origin === window.location.origin && !link.href.endsWith('#')) {
				const href = link.href;
				const before = window.location.href;
				setTimeout(() => {
					if (window.location.href !== before) return;
					window.location.assign(href);
				}, 3000);
			}
			return;
		}
		if (event.target.closest('button')) return;
		if (url) window.location.assign(url);
	});
	card.style.cursor = url ? "pointer" : "";
	return card;
}

/** Loads one alias's posts; never throws — failures become empty lists. */
export async function loadPostsForAlias(alias) {
	try {
		const data = await apiJson(`/api/social/profile/${encodeURIComponent(alias.id)}/posts`, { timeoutMs: 9000 });
		return listFrom(data);
	} catch {
		return [];
	}
}

/** B"H social fix 2 (defect 8): the same post can arrive twice — the two
 * "Write-path test" records are distinct rows with the same title, author,
 * heichel and series. Dedupe the LIST (never the underlying posts) by
 * postId and by that content key, so the list shows each post once.
 * B"H social fix 5 (defect 4): test posts are not shown in the list at
 * all (the underlying posts are untouched).
 * B"H social fix 11 (defect 2): the hero Posts stat and the Posts list
 * counted DIFFERENT things — the list drops test posts + duplicates while
 * loadStatsEagerly counted the raw per-alias rows, so the stat flickered
 * 502 vs 500 across loads (whichever writer finished last won). The
 * dedupe is now ONE shared factory so both paths count exactly the same
 * set: the list total and the stat total agree by construction. One
 * deduper instance must be shared across all batches/groups of a single
 * count, so cross-batch duplicates are caught. */
export function createProfilePostDeduper() {
	const seenIds = new Set();
	const seenContent = new Set();
	return (items) => (items || []).filter((post) => {
		if (isTestPost(post)) return false;
		const id = String(post.postId || post.id || "");
		if (id) {
			if (seenIds.has(id)) return false;
			seenIds.add(id);
		}
		const key = [
			cleanText(post.title || "").toLowerCase(),
			String(post.aliasId || post.author || "").toLowerCase(),
			String(post.heichelId || post.heichel || "").toLowerCase(),
			String(post.seriesId || post.series || "").toLowerCase()
		].join("|");
		if (seenContent.has(key)) return false;
		seenContent.add(key);
		return true;
	});
}

/** Renders every post across all aliases as linked cards. */
export async function renderProfilePosts() {
	const list = one(".profile-posts-list");
	if (!list) return;
	// B"H: show a proper loading skeleton, not a confusing "Nothing here yet".
	list.innerHTML = '<div class="pd-skeleton-list" aria-hidden="true"><div class="pd-skeleton"></div><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>';
	// B"H social fix 1: batched + progressive. The old code fired one request
	// per alias at once (~40) behind an 8s overall deadline, so a loaded server
	// tripped the deadline and the tab showed "Loading posts took too long."
	// Aliases now load 5 at a time and each batch's cards append as they land,
	// so the tab shows posts within ~1s and never stalls on one slow alias.
	// (loadPostsForAlias never throws — a failure is an empty list.)
	const aliases = state.aliases || [];
	// B"H social fix 2: counts come from the base feed's socialSummary.
	// Load them once, in the background, so cards can show real counts.
	const countsPromise = loadCounts();
	let total = 0;
	let shown = false;
	// B"H social fix 2 (defect 8): the same post can arrive twice — the two
	// "Write-path test" records are distinct rows with the same title, author,
	// heichel and series. Dedupe the LIST (never the underlying posts) by
	// postId and by that content key, so the list shows each post once.
	// B"H social fix 11 (defect 2): the dedupe lives in ONE shared factory
	// (createProfilePostDeduper, above) so the hero Posts stat counts
	// exactly the same set the list shows — the stat used to count the raw
	// per-alias rows (502) while the list shows 500, and the stat flickered
	// between the two depending on which writer finished last.
	const dedupe = createProfilePostDeduper();
	for (let start = 0; start < aliases.length; start += 5) {
		const batch = aliases.slice(start, start + 5);
		const groups = await Promise.all(batch.map(loadPostsForAlias));
		const items = dedupe(groups.flat());
		total += items.length;
		if (items.length) {
			if (!shown) { list.innerHTML = ''; shown = true; }
			// B"H social fix 2b: render the cards NOW. The counts come from
			// /api/social/feed, which can hang — awaiting it before appending
			// left the whole list blank. Fill the counts in when/if it returns.
			const cards = items.map(postCard);
			list.append(...cards);
			countsPromise.then(() => {
				for (const card of cards) {
					const c = countsByPostId.get(String(card.dataset.postId || ""));
					if (!c) continue;
					const el = card.querySelector(".social-post-counts");
					if (el) el.textContent = countsText(c);
				}
			}).catch(() => {});
			enrichCounts(cards).catch(() => {});
		}
	}
	setStat('posts', String(total));
	if (!shown) {
		replaceWith(list, emptyCard("No posts yet. When you publish, they'll appear here."));
	}
}
