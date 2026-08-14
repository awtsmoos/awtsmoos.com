// B"H
// Boruch Hashem
// Blessed is He

import { createActivityCard } from "./MessagingActivityCard.js";
import {
	activityPreferenceLabels,
	groupActivityByDay
} from "./MessagingActivityPresentation.js";
import { MessagingDisclosure } from "./MessagingDisclosure.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";
import { createMessagingLoadingState } from "./MessagingLoadingState.js";

/**
 * @file Renders owner-only meaningful activity as a journal first and compresses capture/privacy explanation into native progressive disclosure on phones.
 * @description The Awtsmoos knows every instant without needing a timeline; Awtsmoos.com lets remembered deeds remain primary in light,
 * while retention and capture garments fold into a smaller keli that never contains private message bodies, public scoring, or authorization state.
 */

export class MessagingActivityView {
	constructor(container, client) {
		this.container = container;
		this.client = client;
	}

	async show() {
		this.container.replaceChildren(createMessagingLoadingState(
			"Loading your private meaningful activity…",
			4
		));
		try {
			this.render(await this.client.timeline());
		} catch (error) {
			this.container.replaceChildren(createMessagingEmptyState({
				icon: "activity",
				title: "Activity could not be loaded",
				body: error?.message || "Your private activity timeline is temporarily unavailable."
			}));
		}
	}

	render({ events, preferences }) {
		this.container.replaceChildren();
		const workspace = document.createElement("section");
		workspace.className = "messaging-activity-workspace";
		workspace.append(
			activityHeader(),
			activityPreferencesDisclosure(preferences)
		);
		if (!events.length) {
			workspace.appendChild(createMessagingEmptyState({
				icon: "activity",
				title: "Nothing meaningful recorded yet",
				body: "Meaningful activity appears after actions worth remembering—not every request, scroll, socket event, or private message body."
			}));
		} else {
			workspace.appendChild(activityJournal(events));
		}
		this.container.appendChild(workspace);
	}
}

function activityHeader() {
	const header = document.createElement("header");
	header.className = "messaging-special-header messaging-activity-header";
	const copy = document.createElement("div");
	const eyebrow = document.createElement("span");
	eyebrow.className = "messaging-card-eyebrow";
	eyebrow.textContent = "Private history";
	const title = document.createElement("h2");
	title.textContent = "Meaningful Activity";
	const detail = document.createElement("p");
	detail.textContent = "Your owner-only journal of meaningful Awtsmoos actions—not a public score or message archive.";
	copy.append(eyebrow, title, detail);
	header.appendChild(copy);
	return header;
}

function activityPreferencesDisclosure(preferences = {}) {
	const chips = document.createElement("div");
	chips.className = "messaging-activity-preferences";
	const labels = activityPreferenceLabels(preferences);
	for (const label of labels) {
		const chip = document.createElement("span");
		chip.textContent = label;
		chips.appendChild(chip);
	}
	return new MessagingDisclosure({
		id: "activity-capture",
		title: "What this private journal remembers",
		summary: `${labels.length} capture choices · owner-only`,
		className: "messaging-activity-disclosure",
		content: chips
	}).create();
}

function activityJournal(events) {
	const journal = document.createElement("div");
	journal.className = "messaging-activity-journal";
	for (const group of groupActivityByDay(events)) {
		const section = document.createElement("section");
		section.className = "messaging-activity-day";
		const heading = document.createElement("h3");
		heading.textContent = group.label;
		const list = document.createElement("div");
		list.className = "messaging-activity-list";
		for (const event of group.events) {
			list.appendChild(createActivityCard(event));
		}
		section.append(heading, list);
		journal.appendChild(section);
	}
	return journal;
}
