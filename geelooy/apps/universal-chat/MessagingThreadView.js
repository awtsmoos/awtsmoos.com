// B"H
// Boruch Hashem
// Blessed is He

import { renderDirectDetails } from "./MessagingDirectDetails.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";
import { appendMessageHistory } from "./MessagingMessageFactory.js";

/**
 * @file Renders accepted private rooms with grouped human rhythm while history, consent, paging, and authority remain external owners.
 * @description The Awtsmoos holds every private word without measure, while Awtsmoos.com lets lawful speech gather into readable runs beneath truthful date boundaries in light;
 * presentation may quiet repeated metadata and fold secondary room identity on narrow glass, yet sequence order, authorship, member-safe details, and deliberate private speech remain untouched.
 */

export class MessagingThreadView {
	constructor(elements, identity = null) {
		this.elements = elements;
		this.identity = identity;
	}

	showConversation(conversation, messages, actorAlias) {
		this.elements.special.hidden = true;
		this.elements.threadHeader.hidden = false;
		this.elements.thread.hidden = false;
		this.elements.composer.hidden = false;
		this.elements.threadTitle.textContent = conversation.title || "Private conversation";
		this.elements.threadSubtitle.textContent = conversationSubtitle(conversation);
		this.identity?.reset();
		this.renderMessages(messages, actorAlias);
	}

	renderMessages(messages, actorAlias, options = {}) {
		this.elements.thread.replaceChildren();
		if (!messages.length) {
			this.elements.thread.appendChild(createMessagingEmptyState({
				icon: "chat",
				title: "The room is open",
				body: "This accepted conversation has no messages yet. Private text stays here inside the consent boundary."
			}));
			return;
		}
		appendMessageHistory(this.elements.thread, messages, actorAlias);
		if (options.anchor) {
			this.restoreAnchor(options.anchor);
			return;
		}
		this.elements.thread.scrollTop = this.elements.thread.scrollHeight;
	}

	restoreAnchor(anchor) {
		const addedHeight = this.elements.thread.scrollHeight - Number(anchor.height || 0);
		this.elements.thread.scrollTop = Math.max(
			0,
			Number(anchor.top || 0) + addedHeight
		);
	}

	renderDetails(conversation) {
		renderDirectDetails(this.elements.detailsBody, conversation);
	}

	hideConversation() {
		this.identity?.reset();
		this.elements.threadHeader.hidden = true;
		this.elements.thread.hidden = true;
		this.elements.composer.hidden = true;
		this.elements.loadOlder.hidden = true;
	}
}

function conversationSubtitle(conversation) {
	const members = conversation.memberAliases || [];
	if (conversation.kind === "group") {
		return members.length
			? `${members.length} members · private group`
			: "Private group";
	}
	return members.length
		? members.join(" · ")
		: "Accepted private room";
}
