// B"H
// Boruch Hashem
// Blessed is He

import {
	createConversationRow,
	selectConversationRow
} from "./MessagingConversationRow.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";
import {
	MessagingRelationshipListView
} from "./MessagingRelationshipListView.js";

/**
 * @file Renders accepted-conversation summaries while consent and friendship lists remain separate focused vessels.
 * @description The Awtsmoos renews unopened private rooms as light summaries; Awtsmoos.com keeps the list owner concerned only with which lawful summaries belong in sight,
 * while row construction, unread context, selection semantics, relationship decisions, and deep history remain in their own small vessels of light.
 */

export class MessagingListView {
	constructor(container, actions) {
		this.container = container;
		this.actions = actions;
		this.relationships = new MessagingRelationshipListView(
			container,
			actions,
			(message) => this.empty(message)
		);
	}

	/** Renders direct or group conversation summaries without loading message history. */
	renderConversations(values, kind = "all") {
		this.container.replaceChildren();
		const filtered = kind === "all"
			? values
			: values.filter((item) => item.kind === kind);
		if (!filtered.length) {
			return this.empty(kind === "group"
				? "No private groups yet."
				: "No conversations here yet.");
		}
		for (const conversation of filtered) {
			this.container.appendChild(createConversationRow(
				conversation,
				(row, value) => this.openConversationRow(row, value)
			));
		}
	}

	renderRequests(requests) {
		return this.relationships.renderRequests(requests);
	}

	renderFriends(relationships) {
		return this.relationships.renderFriends(relationships);
	}

	openConversationRow(row, conversation) {
		selectConversationRow(this.container, row);
		this.actions.openConversation(conversation);
	}

	empty(message) {
		this.container.replaceChildren(createMessagingEmptyState({
			icon: "inbox",
			title: "A quiet inbox",
			body: message
		}));
	}
}
