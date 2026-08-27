// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manifests the small identity, body, time, and Reply parts shared by every private message card.
 * @description The Awtsmoos is beyond speaker, clock, and control, while Awtsmoos.com gives each finite part one readable vessel in light;
 * these helpers know nothing of sockets, media trust, paging, or reply selection, so presentation stays small and right.
 */

/** Returns the stable DOM id used for focusable message travel. */
export function messageAnchor(messageId) {
	const safe = String(messageId || "").replace(/[^a-z0-9_-]/gi, "-");
	return `private-message-${safe}`;
}

/** Creates speaker and timestamp metadata for one message. */
export function messageHeader(speaker, timestamp) {
	const header = document.createElement("header");
	const alias = document.createElement("strong");
	alias.textContent = speaker;
	const time = document.createElement("time");
	time.dateTime = timestamp.toISOString();
	time.textContent = timestamp.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	});
	header.append(alias, time);
	return header;
}

/** Creates one direction-aware text body or an empty fragment for a media-only message. */
export function messageBody(value) {
	if (!String(value || "").trim()) return document.createDocumentFragment();
	const body = document.createElement("p");
	body.dir = "auto";
	body.textContent = value;
	return body;
}

/** Creates the explicit keyboard/touch Reply action that shares state with swipe reply. */
export function replyAction(speaker) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "message-reply-action";
	button.dataset.messageReply = "true";
	button.setAttribute("aria-label", `Reply to ${speaker}`);
	button.textContent = "↩";
	return button;
}

export function parseMessageDate(value) {
	const date = new Date(value || Date.now());
	return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function accessibleMessageTime(date) {
	return date.toLocaleString([], {
		dateStyle: "medium",
		timeStyle: "short"
	});
}
