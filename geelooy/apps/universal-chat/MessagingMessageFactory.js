// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives accepted private history a human conversational rhythm through date boundaries and repeated-speaker grouping.
 * @description The Awtsmoos contains every word and interval before chronology appears; Awtsmoos.com therefore preserves protocol order exactly,
 * while finite presentation lets adjacent words from one speaker gather like a single breath without erasing authorship, time, or private provenance.
 */

const RUN_WINDOW_MS = 5 * 60 * 1000;

/** Appends ordered message nodes while exposing grouping only as presentation metadata. */
export function appendMessageHistory(container, messages, actorAlias) {
	let previous = null;
	for (const message of messages) {
		if (!previous || !sameDay(previous.createdAt, message.createdAt)) {
			container.appendChild(dateDivider(message.createdAt));
		}
		const continuation = isContinuation(previous, message);
		container.appendChild(messageCard(message, actorAlias, continuation));
		previous = message;
	}
}

function messageCard(message, actorAlias, continuation) {
	const article = document.createElement("article");
	article.className = "private-message";
	article.classList.toggle("is-mine", message.alias === actorAlias);
	article.classList.toggle("is-continuation", continuation);
	const timestamp = parseDate(message.createdAt);
	const speaker = message.alias === actorAlias ? "You" : message.alias || "Alias";
	article.setAttribute("aria-label", `${speaker} · ${accessibleTime(timestamp)}`);
	const header = document.createElement("header");
	const alias = document.createElement("strong");
	alias.textContent = speaker;
	const time = document.createElement("time");
	time.dateTime = timestamp.toISOString();
	time.textContent = shortTime(timestamp);
	header.append(alias, time);
	const body = document.createElement("p");
	body.textContent = message.text || "";
	article.append(header, body);
	return article;
}

function dateDivider(value) {
	const date = parseDate(value);
	const divider = document.createElement("div");
	divider.className = "messaging-date-divider";
	divider.setAttribute("role", "separator");
	const label = document.createElement("time");
	label.dateTime = date.toISOString().slice(0, 10);
	label.textContent = dateLabel(date);
	divider.appendChild(label);
	return divider;
}

function isContinuation(previous, current) {
	if (!previous || previous.alias !== current.alias) {
		return false;
	}
	const before = parseDate(previous.createdAt).getTime();
	const after = parseDate(current.createdAt).getTime();
	return sameDay(previous.createdAt, current.createdAt)
		&& after >= before
		&& after - before <= RUN_WINDOW_MS;
}

function sameDay(left, right) {
	return parseDate(left).toDateString() === parseDate(right).toDateString();
}

function parseDate(value) {
	const date = new Date(value || Date.now());
	return Number.isNaN(date.getTime()) ? new Date() : date;
}

function shortTime(date) {
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function accessibleTime(date) {
	return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function dateLabel(date) {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (date.toDateString() === today.toDateString()) return "Today";
	if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
	return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
