//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileComments
 * @description Every comment an alias made, as real links to the commented posts.
 */
import { one, replaceWith, cleanText, setStat } from "./dom.js";
import { emptyCard } from "./cards.js";
import { apiJson, listFrom } from "./api.js";
import { state } from "./state.js";

/** Builds one comment card linking to the post it was made on. */
function commentCard(comment = {}) {
	const text = cleanText(comment.body || comment.text || comment.content || "");
	const postId = comment.postId || comment.post_id || comment.entityId || "";
	const postTitle = cleanText(comment.postTitle || comment.post_title || postId || "a post");
	const url = postId ? `/heichelos/ikar/post/${encodeURIComponent(postId)}` : "";
	const card = document.createElement("article");
	card.className = "social-comment-card";
	const quote = document.createElement("p");
	quote.className = "social-comment-text";
	quote.textContent = text.length > 220 ? text.slice(0, 220) + "…" : text;
	card.append(quote);
	if (url) {
		const link = document.createElement("a");
		link.className = "social-comment-link";
		link.href = url;
		link.textContent = `On: ${postTitle}`;
		card.append(link);
	}
	if (comment.createdAt) {
		const meta = document.createElement("small");
		meta.className = "social-comment-meta";
		try { meta.textContent = new Date(comment.createdAt).toLocaleDateString(); }
		catch { meta.textContent = cleanText(String(comment.createdAt)); }
		card.append(meta);
	}
	return card;
}

async function loadCommentsForAlias(alias) {
	try {
		const data = await apiJson(`/api/social/profile/${encodeURIComponent(alias.id)}/comments`, { timeoutMs: 9000 });
		return listFrom(data);
	} catch {
		return [];
	}
}

/** Renders every comment across all aliases as linked cards. */
export async function renderProfileComments() {
	const list = one(".profile-comments-list");
	if (!list) return;
	replaceWith(list, emptyCard("Loading comments…", "loading"));
	const groups = await Promise.all(state.aliases.map(loadCommentsForAlias));
	const items = groups.flat();
	setStat('comments', String(items.length));
	if (!items.length) {
		replaceWith(list, emptyCard("No comments yet. Join a conversation to see it here."));
		return;
	}
	replaceWith(list, ...items.map(commentCard));
}
