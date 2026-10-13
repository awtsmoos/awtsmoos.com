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
import { state } from "./state.js";

/** Builds one post card linking to the live post. */
function postCard(post = {}) {
	const id = cleanText(post.id || post.postId || "");
	const title = cleanText(post.title || post.heading || id || "Untitled post");
	const url = post.url || (id ? `/heichelos/ikar/post/${encodeURIComponent(id)}` : "");
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
	// B"H: never leave the UI stuck loading. 8s overall deadline.
	const OVERALL_TIMEOUT_MS = 8000;
	let groups;
	try {
		groups = await Promise.race([
			Promise.all(state.aliases.map(loadPostsForAlias)),
			new Promise((_, reject) => setTimeout(
				() => reject(new Error("Loading posts took too long.")),
				OVERALL_TIMEOUT_MS
			))
		]);
	} catch (error) {
		const retry = emptyCard(
			(error && error.message) || "Posts could not load. Check your connection and try again.",
			"error"
		);
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "g-button";
		btn.textContent = "Retry";
		btn.addEventListener("click", () => { renderProfilePosts().catch(() => {}); });
		retry.append(btn);
		replaceWith(list, retry);
		return;
	}
	const items = groups.flat();
	setStat('posts', String(items.length));
	if (!items.length) {
		replaceWith(list, emptyCard("No posts yet. When you publish, they'll appear here."));
		return;
	}
	replaceWith(list, ...items.map(postCard));
}
