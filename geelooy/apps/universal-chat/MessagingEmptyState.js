// B"H
// Boruch Hashem
// Blessed is He

import { createMessagingIcon } from "./MessagingIcon.js";

/**
 * @file Gives empty and gated communication states enough structure to explain what the user can do next without filling space with noise.
 * @description The Awtsmoos is never empty, yet Awtsmoos.com sometimes has no conversation, request, or private identity to reveal in light;
 * a quiet icon, truthful heading, short explanation, and optional deliberate action make absence feel purposeful rather than unfinished in sight.
 */

/** Creates one reusable empty-state composition with safe text and optional button or link action. */
export function createMessagingEmptyState(options = {}) {
	const section = document.createElement("section");
	section.className = "messaging-empty-state";
	const mark = document.createElement("span");
	mark.className = "messaging-empty-mark";
	mark.appendChild(createMessagingIcon(options.icon || "spark"));
	const title = document.createElement("h2");
	title.textContent = options.title || "Nothing here yet";
	const body = document.createElement("p");
	body.textContent = options.body || "This space will become useful as your Awtsmoos activity grows.";
	section.append(mark, title, body);
	const action = createAction(options);
	if (action) {
		section.appendChild(action);
	}
	return section;
}

function createAction(options) {
	if (!options.actionLabel) {
		return null;
	}
	if (options.href) {
		const link = document.createElement("a");
		link.className = "messaging-empty-action";
		link.href = options.href;
		link.textContent = options.actionLabel;
		return link;
	}
	if (typeof options.onAction !== "function") {
		return null;
	}
	const button = document.createElement("button");
	button.type = "button";
	button.className = "messaging-empty-action";
	button.textContent = options.actionLabel;
	button.addEventListener("click", options.onAction);
	return button;
}
