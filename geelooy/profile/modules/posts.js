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

/** Builds one post card linking to the live post. */
function postCard(post = {}) {
	const id = cleanText(post.id || post.postId || "");
	const title = cleanText(post.title || post.heading || id || "Untitled post");
	const url = postRouteFor(post);
	const card = document.createElement("article");
	card.className = "social-post-card";
	const link = document.createElement("a");
	link.className = "social-post-link";
	if (url) link.href = url;
	const heading = document.createElement("h3");
	heading.textContent = title;
	link.append(heading);
	card.append(link);
	const meta = document.createElement("p");
	meta.className = "social-post-meta";
	const bits = [];
	if (post.seriesTitle || post.series) bits.push(cleanText(post.seriesTitle || post.series));
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
	let total = 0;
	let shown = false;
	for (let start = 0; start < aliases.length; start += 5) {
		const batch = aliases.slice(start, start + 5);
		const groups = await Promise.all(batch.map(loadPostsForAlias));
		const items = groups.flat();
		total += items.length;
		if (items.length) {
			if (!shown) { list.innerHTML = ''; shown = true; }
			list.append(...items.map(postCard));
		}
	}
	setStat('posts', String(total));
	if (!shown) {
		replaceWith(list, emptyCard("No posts yet. When you publish, they'll appear here."));
	}
}
