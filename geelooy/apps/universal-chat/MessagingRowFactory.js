// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds text-safe communication rows with avatar marks, readable copy, optional metadata, keyboard parity, and styled nested actions.
 * @description The Awtsmoos renews every social summary as safe plain text while Awtsmoos.com gives each row one calm human-scale rhythm in light;
 * identity, preview, time, unread state, and deliberate actions remain visually distinct without turning a relationship summary into hidden authority.
 */

export function baseRow(titleText, subtitleText, options = {}) {
	const row = document.createElement("article");
	row.className = "messaging-list-row";
	row.setAttribute("role", "listitem");
	const avatar = document.createElement("span");
	avatar.className = "messaging-row-avatar";
	avatar.textContent = initials(options.avatarText || titleText);
	const copy = document.createElement("div");
	copy.className = "messaging-row-copy";
	const titleLine = document.createElement("div");
	titleLine.className = "messaging-row-title-line";
	const title = document.createElement("strong");
	title.textContent = titleText;
	titleLine.appendChild(title);
	if (options.metaText) {
		titleLine.appendChild(metaNode(options.metaText));
	}
	const subtitle = document.createElement("small");
	subtitle.textContent = subtitleText;
	copy.append(titleLine, subtitle);
	row.append(avatar, copy);
	return row;
}

/** Gives one whole-row navigation target keyboard parity with its pointer click behavior. */
export function makeRowInteractive(row, label, action) {
	row.classList.add("is-clickable");
	row.tabIndex = 0;
	row.setAttribute("role", "button");
	row.setAttribute("aria-label", label);
	row.addEventListener("click", action);
	row.addEventListener("keydown", (event) => {
		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}
		event.preventDefault();
		action();
	});
	return row;
}

/** Builds a nested row action whose visual variant never changes the protocol action it delegates to. */
export function actionButton(label, action, variant = "secondary") {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `messaging-row-action is-${variant}`;
	button.textContent = label;
	button.addEventListener("click", (event) => {
		event.stopPropagation();
		action();
	});
	return button;
}

export function requestLabel(kind) {
	const labels = {
		chat: "Private chat request",
		whisper: "Whisper request",
		friend: "Friend request",
		"group-invite": "Group invitation",
		mail: "Email contact request"
	};
	return labels[kind] || "Private request";
}

export function shortTime(value) {
	const date = new Date(value || Date.now());
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	const today = new Date();
	if (date.toDateString() === today.toDateString()) {
		return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
	}
	return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function metaNode(text) {
	const meta = document.createElement("span");
	meta.className = "messaging-row-meta";
	meta.textContent = text;
	return meta;
}

function initials(value) {
	const words = String(value || "A").trim().split(/\s+/).filter(Boolean);
	return words.slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase() || "A";
}
