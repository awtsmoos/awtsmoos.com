// B"H
// Boruch Hashem
// Blessed is He

// B"H social fix 4 (defect 5): pin the CommentCard import so the
// Fix 3 author-link code cannot be served stale from any cache
// layer — the SW is cache-first for ?v= URLs and network-first
// for unpinned ones (fetch failure falls back to the cached
// pre-Fix-3 copy). A new URL is a cache miss everywhere.
import { createCommentCard } from "./CommentCard.js?v=aafdf6e831";
import { commentAuthor } from "./CommentText.js";

/**
 * @file Mounts the canonical Heichel discussion beneath a post while each comment keeps its own safe social and Torah layers.
 * @description The Awtsmoos gathers every voice before tree or reply, while Awtsmoos.com lets community speech remain readable in light;
 * fetched aliases enter only text nodes, empty states stay calm, and the section itself never becomes an alternate private or public messaging right.
 */

/** Mounts one discussion tree from the existing server-authoritative Heichel comment endpoint. */
export async function mountDiscussion(viewport) {
	document.getElementById("awtsmoos-social-discussion")?.remove();
	const section = discussionSection();
	viewport.appendChild(section);
	const thread = section.querySelector(".awtsmoos-social-thread");
	try {
		const comments = await fetchCommentTree();
		if (!comments.length) {
			thread.appendChild(emptyState());
			return section;
		}
		// B"H social fix 5 (defect 3): the commenter names ARE links now,
		// but a link to an alias that does not exist lands on "Profile
		// unavailable" — the meluket translation rows are authored by the
		// import alias meluket_translation_en, which has no profile
		// (the alias endpoint answers NO_ALIAS for it). Verify the
		// distinct authors once, up front, and link only the ones that
		// exist; the rest render as plain text. One bounded check per
		// distinct author (usually one), never one per card. A check
		// that fails or times out leaves the author unlinked — a missing
		// link is a nicety lost, a dead link is a defect.
		const existingAliases = await fetchExistingAliases(comments);
		for (const comment of comments) {
			thread.appendChild(await createCommentCard(comment, 0, existingAliases));
		}
	} catch (error) {
		// A failed load is NOT an empty thread: show an honest error state
		// with a retry, never the calm "be the first" empty message.
		thread.appendChild(errorState(error?.message || "Discussion could not be loaded.", viewport));
	}
	return section;
}

/**
 * Appends one freshly created comment to the mounted discussion thread
 * without refetching the tree. Returns false when no discussion is
 * mounted (or the comment is already there), so callers can fall back to
 * their refresh paths.
 */
export async function appendDiscussionComment(comment) {
	const thread = document.querySelector("#awtsmoos-social-discussion .awtsmoos-social-thread");
	if (!thread || !comment?.id) {
		return false;
	}
	if (thread.querySelector(`[id="social-comment-${comment.id}"]`)) {
		return true;
	}
	thread.querySelector(".awtsmoos-social-empty")?.remove();
	thread.appendChild(await createCommentCard({ replies: [], ...comment }));
	return true;
}

function discussionSection() {
	const section = document.createElement("section");
	section.id = "awtsmoos-social-discussion";
	section.className = "awtsmoos-social-discussion";
	const header = document.createElement("header");
	const kicker = document.createElement("span");
	kicker.textContent = "Community";
	const title = document.createElement("h2");
	title.textContent = "Continue the conversation";
	const copy = document.createElement("p");
	copy.textContent = "Insights, questions, replies, reactions, consent requests, and related Torah from the Awtsmoos community.";
	header.append(kicker, title, copy);
	const thread = document.createElement("div");
	thread.className = "awtsmoos-social-thread";
	section.append(header, thread);
	return section;
}

/** B"H social fix 5 (defect 3): which of the thread's distinct authors
 * actually have a profile? The alias endpoint answers 200 + NO_ALIAS for
 * a missing alias (e.g. the import alias meluket_translation_en) and a
 * record for a real one. Returns the set of authors that exist; an
 * author whose check fails or times out is left out (plain text, never
 * a dead link). Replies share their parent's author in practice, so
 * only the top-level authors are checked. */
async function fetchExistingAliases(comments) {
	const authors = [...new Set((comments || []).map(c => commentAuthor(c)).filter(a => a && a !== 'anonymous'))];
	const found = new Set();
	if (!authors.length) return found;
	await Promise.all(authors.map(async (alias) => {
		try {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 5000);
			try {
				const res = await fetch(`/api/social/alias/${encodeURIComponent(alias)}`, { credentials: 'same-origin', signal: controller.signal });
				if (!res.ok) return;
				const data = await res.json();
				if (data && data.error) return;
				found.add(alias);
			} finally {
				clearTimeout(timer);
			}
		} catch (_) { /* unknown — do not link */ }
	}));
	return found;
}

async function fetchCommentTree() {
	// One bounded retry: a single slow read must not present as a broken
	// discussion on an otherwise healthy thread.
	let lastError = null;
	for (let attempt = 1; attempt <= 2; attempt++) {
		try {
			const response = await fetch(`${apiRoot()}/comment-tree`);
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.error?.message || "Discussion could not be loaded.");
			}
			return Array.isArray(data?.success) ? data.success : [];
		} catch (error) {
			lastError = error;
			if (attempt < 2) {
				await new Promise(resolve => setTimeout(resolve, 600));
			}
		}
	}
	throw lastError || new Error("Discussion could not be loaded.");
}

function emptyState(text = "Be the first to open a new line of thought.") {
	const empty = document.createElement("p");
	empty.className = "awtsmoos-social-empty";
	empty.textContent = text;
	return empty;
}

function errorState(text, viewport) {
	const wrap = document.createElement("div");
	wrap.className = "awtsmoos-social-error";
	const message = document.createElement("p");
	message.textContent = text;
	const retry = document.createElement("button");
	retry.type = "button";
	retry.className = "btn awtsmoos-social-retry";
	retry.textContent = "Retry";
	retry.addEventListener("click", () => mountDiscussion(viewport));
	wrap.append(message, retry);
	return wrap;
}

function apiRoot() {
	return `/api/social/heichelos/${encodeURIComponent(window.post.heichel.id)}/posts/${encodeURIComponent(window.post.id)}`;
}
