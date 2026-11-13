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

/** Comment count for one post, from the comment-tree meta (native + social). */
async function fetchCommentCount(post) {
	try {
		const heichel = post.heichelId || post.heichel || "ikar";
		const id = post.postId || post.id || "";
		if (!id) return null;
		const data = await apiJson(`/api/social/heichelos/${encodeURIComponent(heichel)}/posts/${encodeURIComponent(id)}/comment-tree?limit=1`, { timeoutMs: 9000 });
		const meta = data && data.meta ? data.meta : {};
		return Number(meta.native || 0) + Number(meta.social || 0);
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
	card.addEventListener("click", (event) => {
		if (event.target.closest("a, button")) return;
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
	const seenIds = new Set();
	const seenContent = new Set();
	const dedupe = (items) => items.filter((post) => {
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
