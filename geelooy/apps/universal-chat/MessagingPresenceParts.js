// B"H
// Boruch Hashem
// Blessed is He

import { MessagingDisclosure } from "./MessagingDisclosure.js";

/**
 * @file Builds presentation-only presence dashboard parts from already privacy-filtered server projections, with secondary metrics folded on phones.
 * @description The Awtsmoos is present before metric or roster, while Awtsmoos.com keeps visible people primary in light;
 * counts and privacy explanation may contract into a native disclosure, but no helper here resolves identity, opens a socket, or weakens hiding boundaries for convenience.
 */

export function presenceHeader(hidden) {
	const header = document.createElement("header");
	header.className = "messaging-presence-header";
	const eyebrow = document.createElement("span");
	eyebrow.className = "messaging-card-eyebrow";
	eyebrow.textContent = "Presence";
	const title = document.createElement("h2");
	title.textContent = "Awtsmoos is alive right now";
	const copy = document.createElement("p");
	copy.textContent = hidden
		? "Your public presence is hidden. The visible roster below still reflects only what the server permits."
		: "Visible aliases appear below only when privacy permits.";
	header.append(eyebrow, title, copy);
	return header;
}

export function presenceOverview(hidden, presence = {}) {
	const detail = document.createElement("div");
	detail.className = "messaging-presence-overview-detail";
	const copy = document.createElement("p");
	copy.textContent = hidden
		? "Aggregate counts may include anonymous visitors without identifying them. Hidden aliases remain absent from the visible roster."
		: "Anonymous visitors may contribute to aggregate counts without becoming traceable, while named aliases are server-filtered before this view receives them.";
	detail.append(copy, presenceMetrics(presence));
	const total = Number(presence.totalOnline || 0);
	const context = Number(presence.channelOnline || 0);
	return new MessagingDisclosure({
		id: "presence-overview",
		title: "Counts & privacy",
		summary: `${total} online${context ? ` · ${context} here` : ""}`,
		className: "messaging-presence-disclosure",
		content: detail
	}).create();
}

export function presenceMetrics(presence = {}) {
	const grid = document.createElement("div");
	grid.className = "messaging-presence-metrics";
	grid.append(
		metric("Across Awtsmoos", Number(presence.totalOnline || 0), "Visible people online"),
		metric("This context", Number(presence.channelOnline || 0), "People sharing this page or chamber")
	);
	return grid;
}

export function presenceRoster(roster = []) {
	const section = document.createElement("section");
	section.className = "messaging-presence-roster-section";
	const heading = document.createElement("h3");
	heading.textContent = "Visible here";
	const list = document.createElement("div");
	list.className = "messaging-online-roster";
	if (!roster.length) {
		list.classList.add("is-empty");
		list.textContent = "No identifiable visible aliases are being projected here right now.";
	} else {
		for (const person of roster.slice(0, 80)) {
			const chip = document.createElement("span");
			chip.className = "messaging-online-chip";
			chip.textContent = person.label || person.alias || "Ploni";
			list.appendChild(chip);
		}
	}
	section.append(heading, list);
	return section;
}

function metric(labelText, value, detailText) {
	const card = document.createElement("article");
	card.className = "messaging-presence-metric";
	const label = document.createElement("span");
	label.textContent = labelText;
	const count = document.createElement("strong");
	count.textContent = String(value);
	const detail = document.createElement("small");
	detail.textContent = detailText;
	card.append(label, count, detail);
	return card;
}
