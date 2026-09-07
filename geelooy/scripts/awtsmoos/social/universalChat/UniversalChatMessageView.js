// B"H
// Boruch Hashem
// Blessed is He

import { appendWhisperAction } from "./UniversalChatAuthorActions.js";
import { createUniversalSourceCard } from "./UniversalChatSourceCard.js";

/**
 * @file Renders source-only Public Torah discussion with readable channel, author, presence, citations, and consent-based private contact.
 * @description The Awtsmoos renews each source before feed and roster divide; Awtsmoos.com keeps the public chamber quiet when empty,
 * truthful when populated, and concise enough that Torah sources rather than interface explanation remain the center of the human eye.
 */

export class UniversalChatMessageView {
	constructor(elements) {
		this.elements = elements;
	}

	/** Replaces the active feed with server-projected source cards or one compact source-first empty state. */
	renderMessages(messages) {
		this.elements.messages.replaceChildren();
		for (const message of messages) {
			this.elements.messages.appendChild(this.createMessage(message));
		}
		if (!messages.length) this.elements.messages.appendChild(emptyFeed());
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
			this.elements.roster.textContent = "Nobody is publicly visible here yet.";
			return;
		}
		const label = document.createElement("span");
		label.className = "universal-chat-roster-label";
		label.textContent = "Here now";
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
	title.textContent = "No Torah sources published yet.";
	const copy = document.createElement("span");
	copy.textContent = "Search below to add a sourced Torah card to this discussion.";
	empty.append(title, copy);
	return empty;
}

function safeDate(value) {
	const candidate = new Date(value || Date.now());
	return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}
