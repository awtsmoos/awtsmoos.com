// B"H
// Boruch Hashem
// Blessed is He

import { appendWhisperAction } from "./UniversalChatAuthorActions.js";
import { createUniversalSourceCard } from "./UniversalChatSourceCard.js";

/**
 * @file Renders source-only Public Torah discussion with readable channel/author hierarchy and consent-based whisper requests beside verified public aliases.
 * @description The Awtsmoos renews each public passage as Torah while private contact remains a separate consent action of light;
 * Awtsmoos.com keeps channel, author, time, roster, citation, and source destination legible without turning retrieved text or public identity into executable or unsolicited sight.
 */

export class UniversalChatMessageView {
	constructor(elements) {
		this.elements = elements;
	}

	/** Replaces the current feed with source-backed messages and a useful source-first empty state. */
	renderMessages(messages) {
		this.elements.messages.replaceChildren();
		for (const message of messages) {
			this.elements.messages.appendChild(this.createMessage(message));
		}
		if (!messages.length) {
			this.elements.messages.appendChild(emptyFeed());
		}
		this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
	}

	/** Creates one public message from its already-sanitized server projection. */
	createMessage(message) {
		const article = document.createElement("article");
		article.className = "universal-chat-message";
		const heading = document.createElement("header");
		const identity = document.createElement("div");
		identity.className = "universal-chat-message-identity";
		const channel = document.createElement("span");
		channel.className = "universal-chat-channel";
		channel.textContent = message.channel?.label || "Universal";
		const alias = document.createElement("strong");
		alias.className = "universal-chat-author";
		alias.textContent = message.author?.alias || "Ploni";
		identity.append(channel, alias);
		appendWhisperAction({
			container: identity,
			author: message.author,
			currentAlias: this.elements.identity.textContent,
			setStatus: (status) => this.setStatus(status)
		});
		const time = document.createElement("time");
		const createdAt = safeDate(message.createdAt);
		time.dateTime = createdAt.toISOString();
		time.textContent = createdAt.toLocaleTimeString([], {
			hour: "numeric",
			minute: "2-digit"
		});
		heading.append(identity, time);
		article.appendChild(heading);
		for (const source of message.sources || []) {
			article.appendChild(createUniversalSourceCard(source));
		}
		return article;
	}

	renderRoster(roster) {
		this.elements.roster.replaceChildren();
		if (!roster.length) {
			this.elements.roster.textContent = "No visible people in this feed yet.";
			return;
		}
		const label = document.createElement("span");
		label.className = "universal-chat-roster-label";
		label.textContent = "Visible now";
		this.elements.roster.appendChild(label);
		for (const member of roster) {
			const chip = document.createElement("span");
			chip.className = "universal-chat-roster-member";
			chip.textContent = member.alias || "Ploni";
			this.elements.roster.appendChild(chip);
		}
	}

	setIdentity(member) {
		this.elements.identity.textContent = member?.alias || "Ploni";
	}

	setStatus(message) {
		this.elements.status.textContent = String(message || "");
	}
}

function emptyFeed() {
	const empty = document.createElement("section");
	empty.className = "universal-chat-empty";
	const title = document.createElement("strong");
	title.textContent = "No source-backed Torah has been published here yet.";
	const copy = document.createElement("span");
	copy.textContent = "Search privately below, choose one to five returned sources, then deliberately publish those cards.";
	empty.append(title, copy);
	return empty;
}

function safeDate(value) {
	const candidate = new Date(value || Date.now());
	return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}
