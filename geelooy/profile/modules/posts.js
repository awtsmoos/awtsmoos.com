//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfilePosts
 * @description Every post an alias published, as real links to the live posts.
 */
import { one, replaceWith, cleanText } from "./dom.js";
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

async function loadPostsForAlias(alias) {
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
	replaceWith(list, emptyCard("Loading posts…", "loading"));
	const groups = await Promise.all(state.aliases.map(loadPostsForAlias));
	const items = groups.flat();
	if (!items.length) {
		replaceWith(list, emptyCard("No posts yet. Publish from the social composer to see them here."));
		return;
	}
	replaceWith(list, ...items.map(postCard));
}
