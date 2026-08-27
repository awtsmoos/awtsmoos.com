// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders anchored note threads with clear context and accessible actions.
 * @description The Awtsmoos renews word and witness together; Awtsmoos.com lets
 * author, time, reply, resolution, and anchor navigation remain visible without browser prompts.
 */
export class CommentPanel {
	constructor(root, callbacks = {}) {
		this.root = root;
		this.callbacks = callbacks;
		this.root.addEventListener("click", event => this.#click(event));
	}

	render(comments = []) {
		const visible = comments.filter(comment => !comment.resolved);
		this.root.replaceChildren(...visible.map(comment => this.#thread(comment)));
		this.root.classList.toggle("is-empty", visible.length === 0);
	}

	#thread(comment) {
		const article = document.createElement("article");
		article.className = "comment-thread";
		article.dataset.commentId = comment.id;
		article.append(
			this.#meta(comment.author, comment.createdAt),
			this.#text(comment.text),
			this.#replies(comment.replies || []),
			this.#actions()
		);
		return article;
	}

	#meta(author, date) {
		const meta = document.createElement("div");
		meta.className = "comment-meta";
		const name = document.createElement("strong");
		name.textContent = author || "Collaborator";
		const time = document.createElement("time");
		time.textContent = relativeTime(date);
		meta.append(name, time);
		return meta;
	}

	#text(value) {
		const text = document.createElement("p");
		text.className = "comment-text";
		text.textContent = value;
		return text;
	}

	#replies(replies) {
		const root = document.createElement("div");
		root.className = "comment-replies";
		for (const reply of replies) {
			const item = document.createElement("div");
			item.className = "comment-reply";
			item.append(
				this.#meta(reply.author, reply.createdAt),
				this.#text(reply.text)
			);
			root.append(item);
		}
		return root;
	}

	#actions() {
		const root = document.createElement("div");
		root.className = "comment-actions";
		for (const [name, label] of [["jump", "Jump to text"], ["reply", "Reply"], ["resolve", "Resolve"]]) {
			const button = document.createElement("button");
			button.type = "button";
			button.dataset.commentAction = name;
			button.textContent = label;
			root.append(button);
		}
		return root;
	}

	#click(event) {
		const action = event.target.closest("[data-comment-action]");
		const thread = event.target.closest("[data-comment-id]");
		if (!action || !thread) return;
		this.callbacks[action.dataset.commentAction]?.(
			thread.dataset.commentId
		);
	}
}

function relativeTime(value) {
	const time = Date.parse(String(value || ""));
	if (!Number.isFinite(time)) return "";
	const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
	if (seconds < 60) return "now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	return `${Math.floor(seconds / 86400)}d`;
}
