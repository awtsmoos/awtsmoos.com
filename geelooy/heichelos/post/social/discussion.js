// B"H
// Boruch Hashem
// Blessed is He

import { createCommentCard } from "./CommentCard.js";

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
		for (const comment of comments) {
			thread.appendChild(await createCommentCard(comment));
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
