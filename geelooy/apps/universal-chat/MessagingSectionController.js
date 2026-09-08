// B"H
// Boruch Hashem
// Blessed is He

import { messagingNewActionPresentation } from "./MessagingNewActionPresentation.js";
import { MessagingSectionActions } from "./MessagingSectionActions.js";
import { messagingStyles } from "./MessagingStyleGateway.js";
import { MessagingWorkspaceSections } from "./MessagingWorkspaceSections.js";

/**
 * @file Routes flagship sections while feature styling travels beside navigation and stale special revelation is cancelled before every route.
 * @description The Awtsmoos creates every chamber before network or stylesheet can arrive; Awtsmoos.com reveals lawful content immediately,
 * while Gevurah seals the previous chamber so late modules cannot trespass into a new human choice and optional garments never block speech.
 */
const LIST_SECTIONS = new Set(["chats", "groups", "requests", "friends"]);

export class MessagingSectionController {
	constructor(options) {
		Object.assign(this, options);
		this.current = "chats";
		this.actions = new MessagingSectionActions({
			modal: options.modal,
			network: options.network,
			status: options.status
		});
		this.workspace = new MessagingWorkspaceSections({
			shell: this.shell,
			store: this.store,
			special: this.special,
			activity: options.activity,
			discovery: options.discovery,
			presence: options.presence,
			mobile: options.mobile,
			actions: this.actions
		});
	}

	/** Invalidates old special work, starts optional styles, and performs explicit navigation immediately. */
	async show(section) {
		this.workspace.cancelPendingRevelation();
		this.revealStyles(section);
		this.current = section;
		this.shell.selectSection(section);
		this.conversation.close();
		if (this.workspace.owns(section)) {
			await this.workspace.show(section);
			this.search.refresh();
			return;
		}
		this.mobile.showList();
		this.renderList(section);
		this.search.refresh();
	}

	/** Starts section styling without adding it to the functional navigation critical path. */
	revealStyles(section) {
		messagingStyles.loadSection(section).catch((error) => {
			console.warn(`Messaging section styles failed for ${section}:`, error?.message || error);
		});
	}

	/** Redraws only the current compact list without closing an already-open conversation. */
	refreshList() {
		if (!LIST_SECTIONS.has(this.current)) {
			return;
		}
		this.renderList(this.current);
		this.search.refresh();
	}

	/** Renders one private list while preserving each list's existing data contract. */
	renderList(section) {
		this.shell.elements.list.hidden = false;
		this.shell.elements.special.hidden = true;
		this.configureNewAction(section);
		if (section === "chats") {
			this.list.renderConversations(this.store.conversations, "direct");
			return;
		}
		if (section === "groups") {
			this.list.renderConversations(this.store.conversations, "group");
			return;
		}
		if (section === "requests") {
			this.list.renderRequests(this.store.requests);
			return;
		}
		this.list.renderFriends(this.store.relationships);
	}

	/** Synchronizes desktop copy, phone semantics, title, and visibility with the current creation task. */
	configureNewAction(section) {
		const presentation = messagingNewActionPresentation(section);
		const button = this.shell.elements.newAction;
		button.hidden = !presentation;
		if (!presentation) {
			return;
		}
		button.setAttribute("aria-label", presentation.ariaLabel);
		button.title = presentation.ariaLabel;
		const copy = button.querySelector("span:last-child");
		if (copy) {
			copy.textContent = presentation.buttonLabel;
		}
	}

	/** Delegates the current section's creation action through consent-aware private mutation APIs. */
	async newAction() {
		const changed = await this.actions.create(this.current);
		if (changed) {
			this.refreshList();
		}
	}
}
