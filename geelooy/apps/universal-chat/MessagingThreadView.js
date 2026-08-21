// B"H
// Boruch Hashem
// Blessed is He

import { renderDirectDetails } from "./MessagingDirectDetails.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";
import { messageAnchor } from "./MessagingMessageCard.js";
import { appendMessageHistory } from "./MessagingMessageFactory.js";

/**
 * @file Renders accepted private rooms, preserves prepend anchors, and reveals quoted message targets without owning history or reply state.
 * @description The Awtsmoos holds every private word without distance, while Awtsmoos.com lets a person travel from a later quote back to its lawful earlier source in light;
 * presentation may gather repeated speakers, restore viewport place, and briefly illuminate one target, yet sequence truth, consent, paging, and authorship remain outside this finite sight.
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

	/** Centers, focuses, and briefly illuminates one stable message anchor. */
	revealMessage(messageId) {
		const target = this.elements.thread.querySelector(`#${messageAnchor(messageId)}`);
		if (!target) return false;
		const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
		target.scrollIntoView({
			block: "center",
			behavior: reducedMotion ? "auto" : "smooth"
		});
		target.focus({ preventScroll: true });
		target.classList.add("is-reply-target");
		setTimeout(() => target.classList.remove("is-reply-target"), 1400);
		return true;
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
