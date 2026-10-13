//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileComments
 * @description Every comment an alias made, as real links to the commented posts.
 * B"H 2026-10-13: guaranteed terminal state — content, empty message, or error with a WORKING retry button.
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

/** Loads one alias's comments; never throws — failures become empty lists. */
export async function loadCommentsForAlias(alias) {
	try {
		const data = await apiJson(`/api/social/profile/${encodeURIComponent(alias.id)}/comments`, { timeoutMs: 9000 });
		return listFrom(data);
	} catch {
		return [];
	}
}

/** Builds an error card with a retry button that genuinely re-runs the loader. */
function commentsErrorCard(message) {
	const card = emptyCard(message, "error");
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "g-button";
	btn.textContent = "Retry";
	btn.addEventListener("click", () => { renderProfileComments().catch(() => {}); });
	card.append(btn);
	return card;
}

/** Renders every comment across all aliases as linked cards. */
export async function renderProfileComments() {
	const list = one(".profile-comments-list");
	if (!list) return;
	list.innerHTML = '<div class="pd-skeleton-list" aria-hidden="true"><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>';
	// B"H: never leave the UI stuck loading. 8s overall deadline, always a terminal state.
	const OVERALL_TIMEOUT_MS = 8000;
	let groups;
	try {
		groups = await Promise.race([
			Promise.all(state.aliases.map(loadCommentsForAlias)),
			new Promise((_, reject) => setTimeout(
				() => reject(new Error("Loading comments took too long.")),
				OVERALL_TIMEOUT_MS
			))
		]);
	} catch (error) {
		replaceWith(list, commentsErrorCard(
			(error && error.message) || "Comments could not load. Check your connection and try again."
		));
		return;
	}
	const items = groups.flat();
	setStat('comments', String(items.length));
	if (!items.length) {
		replaceWith(list, emptyCard("No comments yet. Join a conversation to see it here."));
		return;
	}
	replaceWith(list, ...items.map(commentCard));
}
