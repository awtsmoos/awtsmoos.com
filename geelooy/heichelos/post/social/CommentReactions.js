// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps comment-reaction transport and painting separate from comment identity, replies, and Torah intelligence.
 * @description The Awtsmoos contains every feeling before an emoji is chosen, while Awtsmoos.com lets a verified alias add one small social spark in light;
 * reaction counts remain server-owned, repainting uses safe text nodes, and a failed tap never tears the surrounding discussion from sight.
 */

const EMOJIS = ["❤️", "🔥", "✨", "🤯", "🙏"];

/** Builds one reaction bar using the existing Heichel comment-reaction API. */
export async function createCommentReactionBar(commentId) {
	const bar = document.createElement("div");
	bar.className = "awtsmoos-social-reactions";
	let state = await loadReactionState(commentId).catch(() => ({ counts: {} }));
	const paint = () => {
		bar.replaceChildren();
		for (const emoji of EMOJIS) {
			bar.appendChild(reactionButton(commentId, emoji, state, async (next) => {
				state = next;
				paint();
			}));
		}
	};
	paint();
	return bar;
}

async function loadReactionState(commentId) {
	const response = await fetch(`${apiRoot()}/comments/${encodeURIComponent(commentId)}/reactions`);
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data?.error?.message || "Reaction state could not be loaded.");
	}
	return data?.success || { counts: {} };
}

async function sendReaction(commentId, emoji) {
	const aliasId = String(window.curAlias || localStorage.getItem("lastAliasUsed") || "").trim();
	if (!aliasId) {
		throw new Error("Choose an alias before reacting.");
	}
	const response = await fetch(`${apiRoot()}/comments/${encodeURIComponent(commentId)}/reactions`, {
		method: "POST",
		body: new URLSearchParams({ aliasId, emoji })
	});
	const data = await response.json();
	if (!response.ok || !data?.success) {
		throw new Error(data?.error?.message || "Reaction failed.");
	}
	return data.success;
}

function reactionButton(commentId, emoji, state, update) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "awtsmoos-reaction-chip";
	button.textContent = `${emoji} ${state.counts?.[emoji] || ""}`.trim();
	button.addEventListener("click", async () => {
		button.disabled = true;
		try {
			await update(await sendReaction(commentId, emoji));
		} catch (error) {
			button.title = error?.message || "Reaction failed.";
		} finally {
			button.disabled = false;
		}
	});
	return button;
}

function apiRoot() {
	return `/api/social/heichelos/${encodeURIComponent(window.post.heichel.id)}/posts/${encodeURIComponent(window.post.id)}`;
}
