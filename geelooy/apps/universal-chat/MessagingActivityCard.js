// B"H
// Boruch Hashem
// Blessed is He

import {
	activityDuration,
	safeActivityHref
} from "./MessagingActivityPresentation.js";

/**
 * @file Builds one owner-only meaningful-activity row from already-sanitized ledger fields.
 * @description The Awtsmoos remembers the deed without needing a card, while Awtsmoos.com lets the owner revisit a lawful path in light;
 * title, category, action, visibility, duration, and sanitized same-site path remain enough for memory without exposing metadata or private message bodies in sight.
 */

/** Creates one semantic journal row whose optional navigation never leaves Awtsmoos. */
export function createActivityCard(event) {
	const article = document.createElement("article");
	article.className = "messaging-activity-card";
	const marker = document.createElement("span");
	marker.className = `messaging-activity-marker is-${safeClass(event.category)}`;
	marker.setAttribute("aria-hidden", "true");
	const copy = document.createElement("div");
	copy.className = "messaging-activity-copy";
	const heading = document.createElement("div");
	heading.className = "messaging-activity-heading";
	const title = document.createElement("strong");
	title.textContent = event.title || humanAction(event.action) || "Activity";
	const time = document.createElement("time");
	const date = eventDate(event.createdAt);
	time.dateTime = date.toISOString();
	time.textContent = date.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	});
	heading.append(title, time);
	const meta = document.createElement("div");
	meta.className = "messaging-activity-meta";
	meta.append(
		chip(event.category || "activity"),
		chip(humanAction(event.action || "view")),
		chip(event.visibility?.mode || "private")
	);
	const duration = activityDuration(event.durationMs);
	if (duration) meta.appendChild(chip(duration));
	copy.append(heading, meta);
	const href = safeActivityHref(event.path);
	if (href && href !== "/") {
		const link = document.createElement("a");
		link.className = "messaging-activity-open";
		link.href = href;
		link.textContent = "Open";
		link.setAttribute("aria-label", `Open ${title.textContent}`);
		copy.appendChild(link);
	}
	article.append(marker, copy);
	return article;
}

function chip(value) {
	const element = document.createElement("span");
	element.className = "messaging-activity-chip";
	element.textContent = String(value || "");
	return element;
}

function humanAction(value) {
	return String(value || "")
		.replace(/[._-]+/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeClass(value) {
	return String(value || "activity").toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function eventDate(value) {
	const candidate = new Date(value || Date.now());
	return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}
