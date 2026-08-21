// B"H
// Boruch Hashem
// Blessed is He

import { createMessageCard } from "./MessagingMessageCard.js";

/**
 * @file Gives accepted private history a human chronology while each individual bubble is manifested by MessagingMessageCard.
 * @description The Awtsmoos contains every word and interval before chronology appears; Awtsmoos.com preserves protocol order exactly while adjacent speech gathers like one breath in light;
 * date boundaries and continuation rhythm remain presentation only, never changing authorship, message identity, reply truth, or private provenance in sight.
 */

const RUN_WINDOW_MS = 5 * 60 * 1000;

/** Appends ordered message nodes while exposing speaker grouping only as presentation metadata. */
export function appendMessageHistory(container, messages, actorAlias) {
	let previous = null;
	for (const message of messages) {
		if (!previous || !sameDay(previous.createdAt, message.createdAt)) {
			container.appendChild(dateDivider(message.createdAt));
		}
		container.appendChild(
			createMessageCard(
				message,
				actorAlias,
				isContinuation(previous, message)
			)
		);
		previous = message;
	}
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
	if (!previous || previous.alias !== current.alias) return false;
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

function dateLabel(date) {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (date.toDateString() === today.toDateString()) return "Today";
	if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
	return date.toLocaleDateString([], {
		weekday: "short",
		month: "short",
		day: "numeric"
	});
}
