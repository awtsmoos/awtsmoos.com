// B"H
// Boruch Hashem
// Blessed is He

import {
	baseRow,
	makeRowInteractive,
	shortTime
} from "./MessagingRowFactory.js";

/**
 * @file Builds one accepted-conversation summary with complete accessible context while keeping visual density restrained.
 * @description The Awtsmoos contains title, preview, time, unreadness, and selection before a row is drawn; Awtsmoos.com lets those finite hints gather in light,
 * revealing full text to keyboard and assistive travelers without waking deep private history until a deliberate opening enters sight.
 */

/** Creates one scan-friendly accepted conversation row and delegates opening to the supplied action. */
export function createConversationRow(conversation, onOpen) {
	const unread = unreadCount(conversation);
	const title = conversationTitle(conversation);
	const subtitle = conversationSubtitle(conversation);
	const row = baseRow(title, subtitle, {
		metaText: conversationTime(conversation),
		avatarText: title
	});
	row.dataset.conversationId = conversation.id || "";
	row.querySelector(".messaging-row-title-line strong")
		?.setAttribute("title", title);
	row.querySelector(".messaging-row-copy small")
		?.setAttribute("title", subtitle);
	if (unread) {
		row.appendChild(unreadBadge(unread));
		row.classList.add("has-unread");
	}
	return makeRowInteractive(
		row,
		rowLabel(title, subtitle, unread),
		() => onOpen(row, conversation)
	);
}

/** Marks one row current while removing current semantics from sibling conversation rows. */
export function selectConversationRow(container, row) {
	for (const candidate of container.querySelectorAll(".messaging-list-row")) {
		const selected = candidate === row;
		candidate.classList.toggle("is-selected", selected);
		selected
			? candidate.setAttribute("aria-current", "true")
			: candidate.removeAttribute("aria-current");
	}
}

function unreadCount(conversation) {
	return Math.max(
		0,
		Number(conversation.lastSequence || 0)
			- Number(conversation.lastReadSequence || 0)
	);
}

function conversationTitle(conversation) {
	return conversation.title
		|| conversation.memberAliases?.join(", ")
		|| "Conversation";
}

function conversationSubtitle(conversation) {
	return conversation.lastPreview
		|| conversation.memberAliases?.join(" · ")
		|| conversation.kind
		|| "Private conversation";
}

function conversationTime(conversation) {
	const value = conversation.updatedAt
		|| conversation.lastMessageAt
		|| conversation.lastAt
		|| conversation.createdAt;
	return value ? shortTime(value) : "";
}

function unreadBadge(unread) {
	const badge = document.createElement("span");
	badge.className = "messaging-unread";
	badge.textContent = unread > 99 ? "99+" : String(unread);
	badge.setAttribute("aria-hidden", "true");
	return badge;
}

function rowLabel(title, subtitle, unread) {
	const unreadText = unread ? `, ${unread} unread messages` : "";
	return `Open ${title}${unreadText}. ${subtitle}`;
}
