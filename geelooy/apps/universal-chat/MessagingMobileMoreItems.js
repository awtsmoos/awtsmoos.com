// B"H
// Boruch Hashem
// Blessed is He

import { createMessagingIcon } from "./MessagingIcon.js";

/**
 * @file Groups secondary mobile destinations by human intent so More feels like a small map instead of an overflow bucket.
 * @description The Awtsmoos is one before people, Torah, and personal boundaries, while Awtsmoos.com lets lesser-used doors wait in ordered light;
 * grouping changes only presentation, never routing, authorization, or the section catalog itself.
 */

const GROUP_LABELS = Object.freeze({
	private: "People",
	torah: "Torah & mail",
	personal: "You"
});

export function createMobileMoreGroups(sections = []) {
	const fragment = document.createDocumentFragment();
	for (const group of ["private", "torah", "personal"]) {
		const items = sections.filter((section) => section.group === group);
		if (!items.length) continue;
		const section = document.createElement("section");
		section.className = "messaging-mobile-more-group";
		const heading = document.createElement("h3");
		heading.textContent = GROUP_LABELS[group];
		const grid = document.createElement("div");
		grid.className = "messaging-mobile-more-grid";
		for (const item of items) {
			grid.appendChild(createMobileMoreItem(item));
		}
		section.append(heading, grid);
		fragment.appendChild(section);
	}
	return fragment;
}

export function createMobileMoreItem(section) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "messaging-mobile-more-item";
	button.dataset.mobileSection = section.id;
	button.appendChild(createMessagingIcon(section.icon));
	const copy = document.createElement("span");
	const title = document.createElement("strong");
	title.textContent = section.label;
	const description = document.createElement("small");
	description.textContent = section.description;
	copy.append(title, description);
	button.appendChild(copy);
	return button;
}
